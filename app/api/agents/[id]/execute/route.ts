import { NextRequest, NextResponse } from 'next/server';
import rawAgents from '@/data/agents.json';
import { rateLimit, clientKeyFromRequest } from '@/lib/rateLimit';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const key = clientKeyFromRequest(request);
    const rl = rateLimit(`execute:${key}`, 8, 60_000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Try again shortly.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    const { id } = await context.params;
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { jobId, inputParams, budgetBnb, executionTxHash } = body;

    if (!jobId || typeof jobId !== 'string') {
      return NextResponse.json({ error: 'jobId is required' }, { status: 400 });
    }

    const agent = (rawAgents as any[]).find(
      (a) => a.id.toLowerCase() === id.toLowerCase()
    );

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Never invent transaction hashes. Only echo a client-supplied real hash.
    const hasRealTx =
      typeof executionTxHash === 'string' &&
      /^0x[a-fA-F0-9]{64}$/.test(executionTxHash);

    const proof = {
      jobId,
      agentId: agent.id,
      agentName: agent.name,
      executionTxHash: hasRealTx ? executionTxHash : null,
      proofHash: null,
      stateDiff: {
        metric: 'Execution receipt',
        before: 'Pending',
        after: hasRealTx
          ? 'Client-supplied execution tx recorded'
          : 'No on-chain execution tx provided (intent-only)',
      },
      evaluationNote: hasRealTx
        ? `${agent.name}: recorded provided execution transaction.`
        : `${agent.name}: intent recorded. No fabricated explorer link.`,
      executedAt: new Date().toISOString(),
      network: 'bsc-testnet',
      chainId: 97,
      explorerUrl: hasRealTx
        ? `https://testnet.bscscan.com/tx/${executionTxHash}`
        : null,
      onChain: hasRealTx,
    };

    return NextResponse.json({
      success: true,
      jobId,
      status: hasRealTx ? 'submitted' : 'funded',
      proof,
      rateLimitRemaining: rl.remaining,
    });
  } catch (error: any) {
    console.error('Agent execution API error:', error);
    return NextResponse.json(
      { error: error.message || 'Agent execution failed' },
      { status: 500 }
    );
  }
}
