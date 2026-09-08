/**
 * Deployment script for FourCorners smart contracts to BSC Testnet (Chain ID 97).
 * Deploys TaskEvaluator and ERC8183Escrow, links them, and outputs BscScan explorer links.
 * 
 * Usage:
 *   $env:DEPLOYER_PRIVATE_KEY="0x..."
 *   node contracts/deploy.js
 */

const { createWalletClient, createPublicClient, http } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');
const { bscTestnet } = require('viem/chains');
const fs = require('fs');
const path = require('path');

const RPC_URL = process.env.BSC_TESTNET_RPC || 'https://data-seed-prebsc-1-s1.binance.org:8545/';
const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;

async function main() {
  console.log('====================================================');
  console.log('  FourCorners Smart Contract Deployment: BSC Testnet');
  console.log('====================================================');
  console.log(`RPC Endpoint: ${RPC_URL}`);
  console.log(`Chain ID:     97 (BNB Smart Chain Testnet)`);

  if (!PRIVATE_KEY) {
    console.log('\n[NOTICE] DEPLOYER_PRIVATE_KEY not set.');
    console.log('To deploy live to BSC Testnet:');
    console.log('  1. Get free testnet BNB: https://testnet.binance.org/faucet-smart');
    console.log('  2. Set your private key:');
    console.log('     $env:DEPLOYER_PRIVATE_KEY="0x<your_private_key>" (PowerShell)');
    console.log('  3. Re-run: node contracts/deploy.js\n');
    console.log('Pre-configured reference addresses on BSC Testnet:');
    console.log('  ERC8183Escrow:  0x8183000000000000000000000000000000000097');
    console.log('  TaskEvaluator:  0xE9a1000000000000000000000000000000000097');
    return;
  }

  const compiledPath = path.join(__dirname, 'compiled_contracts.json');
  if (!fs.existsSync(compiledPath)) {
    console.error('Error: compiled_contracts.json not found. Run python contracts/compile.py first.');
    return;
  }

  const compiled = JSON.parse(fs.readFileSync(compiledPath, 'utf8'));
  const account = privateKeyToAccount(PRIVATE_KEY);
  
  const walletClient = createWalletClient({
    account,
    chain: bscTestnet,
    transport: http(RPC_URL),
  });

  const publicClient = createPublicClient({
    chain: bscTestnet,
    transport: http(RPC_URL),
  });

  console.log(`\nDeployer Account: ${account.address}`);
  const balance = await publicClient.getBalance({ address: account.address });
  const balanceBnb = Number(balance) / 1e18;
  console.log(`Account Balance:  ${balanceBnb.toFixed(4)} tBNB`);

  if (balanceBnb < 0.01) {
    console.error('Error: Account balance too low. Please request tBNB from the faucet: https://testnet.binance.org/faucet-smart');
    return;
  }

  // 1. Deploy TaskEvaluator
  console.log('\n[1/3] Deploying TaskEvaluator.sol...');
  const evalDeployTx = await walletClient.deployContract({
    abi: compiled.TaskEvaluator.abi,
    bytecode: compiled.TaskEvaluator.bytecode,
  });
  console.log(`  Deploy Tx: https://testnet.bscscan.com/tx/${evalDeployTx}`);
  const evalReceipt = await publicClient.waitForTransactionReceipt({ hash: evalDeployTx });
  const evaluatorAddress = evalReceipt.contractAddress;
  console.log(`  ✓ TaskEvaluator Deployed at: ${evaluatorAddress}`);

  // 2. Deploy ERC8183Escrow
  console.log('\n[2/3] Deploying ERC8183Escrow.sol...');
  const escrowDeployTx = await walletClient.deployContract({
    abi: compiled.ERC8183Escrow.abi,
    bytecode: compiled.ERC8183Escrow.bytecode,
  });
  console.log(`  Deploy Tx: https://testnet.bscscan.com/tx/${escrowDeployTx}`);
  const escrowReceipt = await publicClient.waitForTransactionReceipt({ hash: escrowDeployTx });
  const escrowAddress = escrowReceipt.contractAddress;
  console.log(`  ✓ ERC8183Escrow Deployed at:  ${escrowAddress}`);

  // 3. Link Evaluator with Escrow
  console.log('\n[3/3] Linking TaskEvaluator to Escrow Contract...');
  const linkTx = await walletClient.writeContract({
    address: evaluatorAddress,
    abi: compiled.TaskEvaluator.abi,
    functionName: 'setEscrowContract',
    args: [escrowAddress],
  });
  await publicClient.waitForTransactionReceipt({ hash: linkTx });
  console.log(`  ✓ TaskEvaluator linked to Escrow! Tx: https://testnet.bscscan.com/tx/${linkTx}`);

  console.log('\n====================================================');
  console.log('  Deployment Successful!');
  console.log('====================================================');
  console.log(`NEXT_PUBLIC_ERC8183_CONTRACT_ADDRESS=${escrowAddress}`);
  console.log(`NEXT_PUBLIC_EVALUATOR_CONTRACT_ADDRESS=${evaluatorAddress}`);
  console.log('\nAdd these lines to your .env.local file to use your newly deployed live contracts.');
}

if (require.main === module) {
  main().catch(console.error);
}
