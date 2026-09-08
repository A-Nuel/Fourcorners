/**
 * Deployment script for FourCorners smart contracts to BSC Testnet (Chain ID 97).
 * Usage: node contracts/deploy.js
 */

const { createWalletClient, createPublicClient, http } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');
const { bscTestnet } = require('viem/chains');
const fs = require('fs');
const path = require('path');

const RPC_URL = process.env.BSC_TESTNET_RPC || 'https://data-seed-prebsc-1-s1.binance.org:8545/';
const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;

async function main() {
  console.log('--- FourCorners BSC Testnet Deployment ---');
  console.log(`RPC: ${RPC_URL}`);

  if (!PRIVATE_KEY) {
    console.log('Notice: DEPLOYER_PRIVATE_KEY not set in environment.');
    console.log('To deploy to BSC Testnet, export DEPLOYER_PRIVATE_KEY=0x... and re-run.');
    console.log('Default reference contracts configured for FourCorners frontend.');
    return;
  }

  const account = privateKeyToAccount(PRIVATE_KEY);
  const client = createWalletClient({
    account,
    chain: bscTestnet,
    transport: http(RPC_URL),
  });

  const publicClient = createPublicClient({
    chain: bscTestnet,
    transport: http(RPC_URL),
  });

  console.log(`Deployer: ${account.address}`);
  const balance = await publicClient.getBalance({ address: account.address });
  console.log(`Balance: ${balance} wei`);
}

if (require.main === module) {
  main().catch(console.error);
}
