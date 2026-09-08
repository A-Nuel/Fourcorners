import { createPublicClient, createWalletClient, http, custom, defineChain, formatEther } from 'viem';

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

export function getBrowserWalletClient() {
  if (typeof window === 'undefined' || !(window as any).ethereum) {
    return null;
  }
  return createWalletClient({
    chain: bscTestnet,
    transport: custom((window as any).ethereum),
  });
}

export async function fetchBnbBalance(address: `0x${string}`): Promise<string> {
  try {
    const balanceWei = await publicClient.getBalance({ address });
    const formatted = formatEther(balanceWei);
    return parseFloat(formatted).toFixed(4);
  } catch (e) {
    console.warn('Failed to fetch BNB balance:', e);
    return '0.0000';
  }
}

export async function switchOrAddBscTestnet(): Promise<boolean> {
  if (typeof window === 'undefined' || !(window as any).ethereum) {
    return false;
  }
  try {
    await (window as any).ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x61' }],
    });
    return true;
  } catch (switchError: any) {
    if (switchError.code === 4902 || switchError?.data?.originalError?.code === 4902) {
      try {
        await (window as any).ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0x61',
              chainName: 'BNB Smart Chain Testnet',
              nativeCurrency: { name: 'tBNB', symbol: 'tBNB', decimals: 18 },
              rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
              blockExplorerUrls: ['https://testnet.bscscan.com'],
            },
          ],
        });
        return true;
      } catch (addError) {
        console.error('Failed to add BSC testnet to wallet', addError);
        return false;
      }
    }
    console.error('Failed to switch to BSC testnet', switchError);
    return false;
  }
}

const PLACEHOLDER_ESCROW = '0x8183000000000000000000000000000000000097' as const;
const PLACEHOLDER_EVALUATOR = '0xE9a1000000000000000000000000000000000097' as const;

export const CONTRACT_ADDRESSES = {
  escrow: (process.env.NEXT_PUBLIC_ERC8183_CONTRACT_ADDRESS ||
    PLACEHOLDER_ESCROW) as `0x${string}`,
  evaluator: (process.env.NEXT_PUBLIC_EVALUATOR_CONTRACT_ADDRESS ||
    PLACEHOLDER_EVALUATOR) as `0x${string}`,
};

/** True only when env points at real deployed addresses (not placeholders). */
export function isContractsDeployed(): boolean {
  const e = CONTRACT_ADDRESSES.escrow.toLowerCase();
  const v = CONTRACT_ADDRESSES.evaluator.toLowerCase();
  return (
    e !== PLACEHOLDER_ESCROW.toLowerCase() &&
    v !== PLACEHOLDER_EVALUATOR.toLowerCase() &&
    !e.includes('000000000000000000000000') &&
    !v.includes('000000000000000000000000')
  );
}
