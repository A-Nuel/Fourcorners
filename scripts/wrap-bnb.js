/**
 * Helper script to Wrap tBNB into WBNB (or unwrap WBNB back into tBNB) on BSC Testnet (Chain ID 97).
 * 
 * Usage:
 *   $env:DEPLOYER_PRIVATE_KEY="0x..." (or BSC_PRIVATE_KEY)
 *   node scripts/wrap-bnb.js 0.05          # Wraps 0.05 tBNB into WBNB
 *   node scripts/wrap-bnb.js --unwrap 0.05 # Unwraps 0.05 WBNB back to tBNB
 *   node scripts/wrap-bnb.js --balance    # Checks tBNB and WBNB balances
 */

const { createWalletClient, createPublicClient, http, parseEther, formatEther } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');
const { bscTestnet } = require('viem/chains');

const RPC_URL = process.env.BSC_TESTNET_RPC || 'https://data-seed-prebsc-1-s1.binance.org:8545/';
const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || process.env.BSC_PRIVATE_KEY;
const WBNB_ADDRESS = '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd';

const WBNB_ABI = [
  {
    name: 'deposit',
    type: 'function',
    stateMutability: 'payable',
    inputs: [],
    outputs: [],
  },
  {
    name: 'withdraw',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'wad', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'decimals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
];

async function main() {
  console.log('====================================================');
  console.log('  BSC Testnet WBNB Manager (Chain ID 97)');
  console.log('  WBNB Address: 0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd');
  console.log('====================================================');

  if (!PRIVATE_KEY) {
    console.error('\n[ERROR] DEPLOYER_PRIVATE_KEY or BSC_PRIVATE_KEY environment variable is required.');
    console.log('Set your key:');
    console.log('  $env:DEPLOYER_PRIVATE_KEY="0x..." (PowerShell)');
    console.log('  export DEPLOYER_PRIVATE_KEY="0x..." (Bash)');
    process.exit(1);
  }

  const account = privateKeyToAccount(PRIVATE_KEY);
  const publicClient = createPublicClient({
    chain: bscTestnet,
    transport: http(RPC_URL),
  });

  const walletClient = createWalletClient({
    account,
    chain: bscTestnet,
    transport: http(RPC_URL),
  });

  console.log(`Wallet Address: ${account.address}`);

  const nativeBal = await publicClient.getBalance({ address: account.address });
  const wbnbBal = await publicClient.readContract({
    address: WBNB_ADDRESS,
    abi: WBNB_ABI,
    functionName: 'balanceOf',
    args: [account.address],
  });

  console.log(`Current Native tBNB: ${formatEther(nativeBal)} tBNB`);
  console.log(`Current WBNB Token:  ${formatEther(wbnbBal)} WBNB`);

  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes('--balance')) {
    console.log('\n[Done] Balances checked.');
    return;
  }

  const isUnwrap = args.includes('--unwrap');
  const amountStr = args.find((a) => !a.startsWith('--'));

  if (!amountStr || isNaN(parseFloat(amountStr)) || parseFloat(amountStr) <= 0) {
    console.error('\n[ERROR] Please specify a valid amount in BNB (e.g. node scripts/wrap-bnb.js 0.02)');
    process.exit(1);
  }

  const amountWei = parseEther(amountStr);

  if (isUnwrap) {
    console.log(`\nUnwrapping ${amountStr} WBNB -> native tBNB...`);
    if (wbnbBal < amountWei) {
      console.error(`Insufficient WBNB balance (${formatEther(wbnbBal)} WBNB available).`);
      process.exit(1);
    }
    const hash = await walletClient.writeContract({
      address: WBNB_ADDRESS,
      abi: WBNB_ABI,
      functionName: 'withdraw',
      args: [amountWei],
    });
    console.log(`Transaction sent! Hash: https://testnet.bscscan.com/tx/${hash}`);
    await publicClient.waitForTransactionReceipt({ hash });
    console.log('✓ Successfully unwrapped WBNB to native tBNB!');
  } else {
    console.log(`\nWrapping ${amountStr} native tBNB -> WBNB...`);
    if (nativeBal < amountWei) {
      console.error(`Insufficient native tBNB balance (${formatEther(nativeBal)} tBNB available).`);
      process.exit(1);
    }
    const hash = await walletClient.writeContract({
      address: WBNB_ADDRESS,
      abi: WBNB_ABI,
      functionName: 'deposit',
      value: amountWei,
    });
    console.log(`Transaction sent! Hash: https://testnet.bscscan.com/tx/${hash}`);
    await publicClient.waitForTransactionReceipt({ hash });
    console.log('✓ Successfully wrapped tBNB into WBNB!');
  }

  const updatedWbnb = await publicClient.readContract({
    address: WBNB_ADDRESS,
    abi: WBNB_ABI,
    functionName: 'balanceOf',
    args: [account.address],
  });
  console.log(`\nNew WBNB Balance: ${formatEther(updatedWbnb)} WBNB`);
}

main().catch(console.error);
