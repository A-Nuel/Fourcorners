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
        process.env.NEXT_PUBLIC_BSC_TESTNET_RPC ||
          'https://data-seed-prebsc-1-s1.binance.org:8545/',
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

/**
 * Contract addresses.
 * Placeholder zero-pattern addresses mean NOT deployed.
 * Set NEXT_PUBLIC_ERC8183_CONTRACT_ADDRESS and NEXT_PUBLIC_EVALUATOR_CONTRACT_ADDRESS
 * only after verified testnet deployment.
 */
const PLACEHOLDER_ESCROW = '0x8183000000000000000000000000000000000097' as const;
const PLACEHOLDER_EVALUATOR = '0xE9a1000000000000000000000000000000000097' as const;

export const CONTRACT_ADDRESSES = {
  escrow: (process.env.NEXT_PUBLIC_ERC8183_CONTRACT_ADDRESS ||
    PLACEHOLDER_ESCROW) as `0x${string}`,
  evaluator: (process.env.NEXT_PUBLIC_EVALUATOR_CONTRACT_ADDRESS ||
    PLACEHOLDER_EVALUATOR) as `0x${string}`,
};

export function isContractsDeployed(): boolean {
  const e = CONTRACT_ADDRESSES.escrow.toLowerCase();
  const v = CONTRACT_ADDRESSES.evaluator.toLowerCase();
  const isPlaceholder =
    e === PLACEHOLDER_ESCROW.toLowerCase() ||
    v === PLACEHOLDER_EVALUATOR.toLowerCase() ||
    e.includes('000000000000000000000000') ||
    v.includes('000000000000000000000000');
  return !isPlaceholder;
}
