import { createPublicClient, http, defineChain } from 'viem';

export const bscTestnet = defineChain({
  id: 97,
  name: 'BNB Smart Chain Testnet',
  nativeCurrency: {
    name: 'Testnet BNB',
    symbol: 'tBNB',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [
        process.env.NEXT_PUBLIC_BSC_TESTNET_RPC || 'https://data-seed-prebsc-1-s1.binance.org:8545/',
        'https://bsc-testnet.public.blastapi.io',
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'BscScan',
      url: 'https://testnet.bscscan.com',
    },
  },
  testnet: true,
});

export const publicClient = createPublicClient({
  chain: bscTestnet,
  transport: http(),
});

export const CONTRACT_ADDRESSES = {
  escrow: (process.env.NEXT_PUBLIC_ERC8183_CONTRACT_ADDRESS ||
    '0x8183000000000000000000000000000000000097') as `0x${string}`,
  evaluator: (process.env.NEXT_PUBLIC_EVALUATOR_CONTRACT_ADDRESS ||
    '0xE9a1000000000000000000000000000000000097') as `0x${string}`,
};
