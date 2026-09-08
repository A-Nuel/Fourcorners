/**
 * Production-grade EIP-1193 wallet helpers for BSC Testnet (chain 97).
 * No silent demo fallbacks. No synthetic addresses.
 */

export const BSC_TESTNET_CHAIN_ID_HEX = '0x61';
export const BSC_TESTNET_CHAIN_ID = 97;

export class WalletError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = 'WalletError';
  }
}

function getEthereum(): any | null {
  if (typeof window === 'undefined') return null;
  return (window as any).ethereum ?? null;
}

export async function connectWallet(): Promise<string> {
  const ethereum = getEthereum();
  if (!ethereum) {
    throw new WalletError(
      'NO_PROVIDER',
      'No browser wallet found. Install MetaMask, Rabby, or Trust Wallet and try again.'
    );
  }

  const accounts: string[] = await ethereum.request({
    method: 'eth_requestAccounts',
  });

  if (!accounts?.[0]) {
    throw new WalletError('NO_ACCOUNT', 'Wallet returned no accounts.');
  }

  await ensureBscTestnet();
  return accounts[0];
}

export async function getConnectedAccount(): Promise<string | null> {
  const ethereum = getEthereum();
  if (!ethereum) return null;
  try {
    const accounts: string[] = await ethereum.request({ method: 'eth_accounts' });
    return accounts?.[0] ?? null;
  } catch {
    return null;
  }
}

export async function getChainIdHex(): Promise<string | null> {
  const ethereum = getEthereum();
  if (!ethereum) return null;
  try {
    return await ethereum.request({ method: 'eth_chainId' });
  } catch {
    return null;
  }
}

export async function ensureBscTestnet(): Promise<void> {
  const ethereum = getEthereum();
  if (!ethereum) {
    throw new WalletError('NO_PROVIDER', 'No browser wallet found.');
  }

  const chainId = await ethereum.request({ method: 'eth_chainId' });
  if (chainId === BSC_TESTNET_CHAIN_ID_HEX) return;

  try {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: BSC_TESTNET_CHAIN_ID_HEX }],
    });
  } catch (switchError: any) {
    // 4902 = chain not added
    if (switchError?.code === 4902) {
      await ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: BSC_TESTNET_CHAIN_ID_HEX,
            chainName: 'BNB Smart Chain Testnet',
            nativeCurrency: { name: 'tBNB', symbol: 'tBNB', decimals: 18 },
            rpcUrls: [
              'https://data-seed-prebsc-1-s1.binance.org:8545/',
              'https://bsc-testnet.public.blastapi.io',
            ],
            blockExplorerUrls: ['https://testnet.bscscan.com'],
          },
        ],
      });
      return;
    }
    throw new WalletError(
      'WRONG_NETWORK',
      'Please switch your wallet to BNB Smart Chain Testnet (chain 97).'
    );
  }
}

export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}
