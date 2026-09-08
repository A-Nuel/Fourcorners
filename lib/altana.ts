import { AltanaSession } from './types';
import { CONTRACT_ADDRESSES, isContractsDeployed } from './wallet';

export interface GrantSessionParams {
  ownerAddress: string;
  spendCapBnb: string;
  durationHours: number;
  allowedContracts?: string[];
}

export class AltanaNotReadyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AltanaNotReadyError';
  }
}

/**
 * Altana session grant — real path only.
 * Does NOT invent tx hashes or Keystore registration claims.
 *
 * When contracts / Altana SDK path is not live, returns a local intent
 * with keystoreRegistered=false and empty txHash so the UI stays honest.
 */
export async function grantAltanaSession(
  params: GrantSessionParams
): Promise<AltanaSession> {
  const { ownerAddress, spendCapBnb, durationHours, allowedContracts } = params;

  if (!ownerAddress || !/^0x[a-fA-F0-9]{40}$/.test(ownerAddress)) {
    throw new AltanaNotReadyError('A connected wallet address is required to grant a session.');
  }

  const expiryTimestamp = Math.floor(Date.now() / 1000) + durationHours * 3600;
  const targetContracts =
    allowedContracts && allowedContracts.length > 0
      ? allowedContracts
      : [CONTRACT_ADDRESSES.escrow, CONTRACT_ADDRESSES.evaluator].filter(
          (a) => !a.includes('000000000000000000000000')
        );

  // Real Altana SDK path (when env + contracts are configured)
  // Keep structure ready; do not fabricate explorer evidence.
  if (isContractsDeployed() && process.env.NEXT_PUBLIC_ALTANA_ENABLED === 'true') {
    // Hook point for @altananetwork/sdk grantSession once keys + contracts are live.
    throw new AltanaNotReadyError(
      'Altana live path is configured but not yet wired in this build. Set NEXT_PUBLIC_ALTANA_ENABLED only after SDK integration is complete.'
    );
  }

  // Intent-only session (honest): no Keystore claim, no fake tx
  const session: AltanaSession = {
    sessionKeyId: `intent-${ownerAddress.slice(2, 10)}-${expiryTimestamp}`,
    publicKey: '',
    ownerAddress,
    spendCapBnb,
    spentBnb: '0',
    expiryTimestamp,
    allowedContracts: targetContracts,
    status: 'active',
    txHash: '',
    keystoreRegistered: false,
  };

  return session;
}

/**
 * Revoke session — real path only. No synthetic revoke txs.
 */
export async function revokeAltanaSession(
  sessionKeyId: string
): Promise<{ success: boolean; txHash: string; mode: 'onchain' | 'local' }> {
  if (!sessionKeyId) {
    return { success: false, txHash: '', mode: 'local' };
  }

  if (isContractsDeployed() && process.env.NEXT_PUBLIC_ALTANA_ENABLED === 'true') {
    throw new AltanaNotReadyError(
      'On-chain revoke requires live Altana wiring. Not fabricating a tx hash.'
    );
  }

  // Local intent revoke only
  return { success: true, txHash: '', mode: 'local' };
}

export function getKeystoreExplorerUrl(_sessionKeyId?: string): string {
  // Official Altana testnet explorer when sessions are real
  return 'https://testnet.altana.network';
}
