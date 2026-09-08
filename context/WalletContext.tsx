'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { parseEther, formatEther } from 'viem';
import { publicClient, getBrowserWalletClient, fetchBnbBalance, switchOrAddBscTestnet, CONTRACT_ADDRESSES } from '@/lib/wallet';
import { getStoredSession } from '@/lib/storage';

export type WalletType = 'injected' | 'metamask' | 'binance' | 'rabby' | 'coinbase' | 'trust' | 'okx' | 'altana' | 'walletconnect';

export interface DiscoveredWallet {
  id: string;
  name: string;
  icon: string;
  rdns: string;
  provider: any;
}

interface WalletContextType {
  address: `0x${string}` | null;
  isConnected: boolean;
  isConnecting: boolean;
  chainId: number | null;
  balance: string;
  walletType: WalletType | null;
  walletName: string | null;
  error: string | null;
  isModalOpen: boolean;
  discoveredWallets: DiscoveredWallet[];
  openModal: () => void;
  closeModal: () => void;
  connect: (type?: WalletType) => Promise<boolean>;
  connectProvider: (provider: any, name: string) => Promise<boolean>;
  disconnect: () => void;
  switchNetwork: () => Promise<boolean>;
  sendEscrowPayment: (to: `0x${string}`, valueBnb: string) => Promise<{ hash: string; blockNumber?: number }>;
  signSessionDelegation: (message: string) => Promise<string>;
  refreshBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const STORAGE_WALLET_KEY = 'fourcorners_connected_wallet_v2';
const STORAGE_WALLET_TYPE = 'fourcorners_wallet_type_v2';
const STORAGE_WALLET_NAME = 'fourcorners_wallet_name_v2';

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<`0x${string}` | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [chainId, setChainId] = useState<number | null>(null);
  const [balance, setBalance] = useState<string>('0.0000');
  const [walletType, setWalletType] = useState<WalletType | null>(null);
  const [walletName, setWalletName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [discoveredWallets, setDiscoveredWallets] = useState<DiscoveredWallet[]>([]);
  const [activeProvider, setActiveProvider] = useState<any>(null);

  // EIP-6963 Standard Wallet Discovery
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleAnnounceProvider = (event: any) => {
      if (!event.detail || !event.detail.info) return;
      const { info, provider } = event.detail;
      setDiscoveredWallets((prev) => {
        if (prev.some((w) => w.rdns === info.rdns)) return prev;
        return [
          ...prev,
          {
            id: info.rdns,
            name: info.name,
            icon: info.icon,
            rdns: info.rdns,
            provider,
          },
        ];
      });
    };

    window.addEventListener('eip6963:announceProvider' as any, handleAnnounceProvider);
    window.dispatchEvent(new Event('eip6963:requestProvider'));

    return () => {
      window.removeEventListener('eip6963:announceProvider' as any, handleAnnounceProvider);
    };
  }, []);

  // Restore stored session or wallet connection
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedType = localStorage.getItem(STORAGE_WALLET_TYPE) as WalletType | null;
    const savedAddress = localStorage.getItem(STORAGE_WALLET_KEY) as `0x${string}` | null;
    const savedName = localStorage.getItem(STORAGE_WALLET_NAME);

    if (savedType === 'altana') {
      const session = getStoredSession();
      if (session && session.status === 'active') {
        const addr = session.ownerAddress as `0x${string}`;
        setAddress(addr);
        setWalletType('altana');
        setWalletName('Altana Session');
        setChainId(97);
        fetchBnbBalance(addr).then(setBalance);
      }
      return;
    }

    if ((window as any).ethereum && savedAddress) {
      const eth = (window as any).ethereum;
      eth
        .request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts && accounts.length > 0 && accounts[0].toLowerCase() === savedAddress.toLowerCase()) {
            const acc = accounts[0] as `0x${string}`;
            setAddress(acc);
            setWalletType(savedType || 'injected');
            setWalletName(savedName || 'Browser Wallet');
            setActiveProvider(eth);
            updateAccountState(acc, eth);
          }
        })
        .catch(console.warn);
    }
  }, []);

  // Polling balance every 15s if connected
  useEffect(() => {
    if (!address) return;
    const interval = setInterval(() => {
      fetchBnbBalance(address).then(setBalance);
    }, 15000);
    return () => clearInterval(interval);
  }, [address]);

  // Listen for account and network changes on active provider
  useEffect(() => {
    const provider = activeProvider || (typeof window !== 'undefined' ? (window as any).ethereum : null);
    if (!provider || !provider.on) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (!accounts || accounts.length === 0) {
        disconnect();
      } else {
        const newAddress = accounts[0] as `0x${string}`;
        setAddress(newAddress);
        localStorage.setItem(STORAGE_WALLET_KEY, newAddress);
        updateAccountState(newAddress, provider);
      }
    };

    const handleChainChanged = (chainIdHex: string) => {
      const parsedId = parseInt(chainIdHex, 16);
      setChainId(parsedId);
      if (address) {
        fetchBnbBalance(address).then(setBalance);
      }
    };

    provider.on('accountsChanged', handleAccountsChanged);
    provider.on('chainChanged', handleChainChanged);

    return () => {
      provider.removeListener?.('accountsChanged', handleAccountsChanged);
      provider.removeListener?.('chainChanged', handleChainChanged);
    };
  }, [activeProvider, address]);

  const updateAccountState = async (addr: `0x${string}`, provider?: any) => {
    try {
      const prov = provider || activeProvider || (window as any).ethereum;
      if (prov) {
        const hexChain = await prov.request({ method: 'eth_chainId' });
        setChainId(parseInt(hexChain, 16));
      }
      const b = await fetchBnbBalance(addr);
      setBalance(b);
    } catch (e) {
      console.warn('Failed to update account state', e);
    }
  };

  const resolveProviderForType = (type: WalletType): any => {
    if (typeof window === 'undefined') return null;

    // Check EIP-6963 first
    if (type === 'metamask') {
      const d = discoveredWallets.find((w) => w.rdns.includes('metamask') || w.name.toLowerCase().includes('metamask'));
      if (d) return d.provider;
    }
    if (type === 'rabby') {
      const d = discoveredWallets.find((w) => w.rdns.includes('rabby') || w.name.toLowerCase().includes('rabby'));
      if (d) return d.provider;
    }
    if (type === 'binance') {
      const d = discoveredWallets.find((w) => w.rdns.includes('binance') || w.name.toLowerCase().includes('binance'));
      if (d) return d.provider;
    }
    if (type === 'coinbase') {
      const d = discoveredWallets.find((w) => w.rdns.includes('coinbase') || w.name.toLowerCase().includes('coinbase'));
      if (d) return d.provider;
    }

    const eth = (window as any).ethereum;
    if (!eth) {
      if (type === 'binance' && (window as any).BinanceChain) return (window as any).BinanceChain;
      return null;
    }

    // Check if multiple providers are injected (e.g. MetaMask + Rabby)
    if (eth.providers && Array.isArray(eth.providers)) {
      if (type === 'metamask') {
        const p = eth.providers.find((item: any) => item.isMetaMask && !item.isRabby);
        if (p) return p;
      }
      if (type === 'rabby') {
        const p = eth.providers.find((item: any) => item.isRabby);
        if (p) return p;
      }
      if (type === 'binance') {
        const p = eth.providers.find((item: any) => item.isBinance);
        if (p) return p;
      }
      if (type === 'coinbase') {
        const p = eth.providers.find((item: any) => item.isCoinbaseWallet);
        if (p) return p;
      }
    }

    // Standard flags
    if (type === 'rabby' && (eth.isRabby || (window as any).rabby)) return (window as any).rabby || eth;
    if (type === 'binance' && ((window as any).BinanceChain || eth.isBinance)) return (window as any).BinanceChain || eth;
    if (type === 'coinbase' && ((window as any).coinbaseWalletExtension || eth.isCoinbaseWallet)) {
      return (window as any).coinbaseWalletExtension || eth;
    }
    if (type === 'metamask' && eth.isMetaMask) return eth;

    return eth;
  };

  const connectProvider = async (provider: any, name: string): Promise<boolean> => {
    setIsConnecting(true);
    setError(null);

    try {
      if (!provider || !provider.request) {
        throw new Error(`Provider for ${name} is not available.`);
      }

      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts authorized in wallet.');
      }

      const selected = accounts[0] as `0x${string}`;
      setAddress(selected);
      setActiveProvider(provider);
      setWalletType('injected');
      setWalletName(name);

      localStorage.setItem(STORAGE_WALLET_KEY, selected);
      localStorage.setItem(STORAGE_WALLET_TYPE, 'injected');
      localStorage.setItem(STORAGE_WALLET_NAME, name);

      // Verify and switch to BSC Testnet (97)
      try {
        const currentHexChain = await provider.request({ method: 'eth_chainId' });
        const currentChainId = parseInt(currentHexChain, 16);
        setChainId(currentChainId);

        if (currentChainId !== 97) {
          await switchOrAddBscTestnet();
        }
      } catch (chainErr) {
        console.warn('Chain switch prompt warning:', chainErr);
      }

      await updateAccountState(selected, provider);
      setIsModalOpen(false);
      return true;
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      const msg = err.code === 4001 ? 'Connection rejected in wallet.' : err.message || 'Failed to connect wallet.';
      setError(msg);
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  const connect = async (type: WalletType = 'injected'): Promise<boolean> => {
    setIsConnecting(true);
    setError(null);

    try {
      if (type === 'altana') {
        const session = getStoredSession();
        if (session && session.status === 'active') {
          const acc = session.ownerAddress as `0x${string}`;
          setAddress(acc);
          setWalletType('altana');
          setWalletName('Altana Session Key');
          setChainId(97);
          localStorage.setItem(STORAGE_WALLET_KEY, acc);
          localStorage.setItem(STORAGE_WALLET_TYPE, 'altana');
          localStorage.setItem(STORAGE_WALLET_NAME, 'Altana Session Key');
          await updateAccountState(acc);
          setIsModalOpen(false);
          return true;
        } else {
          throw new Error('No active Altana session key found. Please grant a session via Hire Wizard.');
        }
      }

      const provider = resolveProviderForType(type);
      if (!provider) {
        const names: Record<string, string> = {
          metamask: 'MetaMask',
          binance: 'Binance Web3 Wallet',
          rabby: 'Rabby Wallet',
          coinbase: 'Coinbase Wallet',
          trust: 'Trust Wallet',
        };
        const targetName = names[type] || 'Web3';
        throw new Error(`${targetName} extension was not detected. Please ensure the extension is installed and enabled.`);
      }

      const walletTitleMap: Record<string, string> = {
        metamask: 'MetaMask',
        binance: 'Binance Web3 Wallet',
        rabby: 'Rabby Wallet',
        coinbase: 'Coinbase Wallet',
        trust: 'Trust Wallet',
        injected: 'Browser Wallet',
      };

      return await connectProvider(provider, walletTitleMap[type] || 'Web3 Wallet');
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      const msg = err.code === 4001 ? 'Connection rejected by user in wallet.' : err.message || 'Failed to connect wallet.';
      setError(msg);
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAddress(null);
    setWalletType(null);
    setWalletName(null);
    setActiveProvider(null);
    setChainId(null);
    setBalance('0.0000');
    setError(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_WALLET_KEY);
      localStorage.removeItem(STORAGE_WALLET_TYPE);
      localStorage.removeItem(STORAGE_WALLET_NAME);
    }
  };

  const switchNetwork = async (): Promise<boolean> => {
    return await switchOrAddBscTestnet();
  };

  const refreshBalance = async (): Promise<void> => {
    if (address) {
      const b = await fetchBnbBalance(address);
      setBalance(b);
    }
  };

  const sendEscrowPayment = async (
    to: `0x${string}`,
    valueBnb: string
  ): Promise<{ hash: string; blockNumber?: number }> => {
    if (!address) {
      throw new Error('Please connect your wallet first.');
    }

    const provider = activeProvider || (typeof window !== 'undefined' ? (window as any).ethereum : null);
    if (!provider) {
      throw new Error('No active Web3 wallet provider available to sign transaction.');
    }

    const valueWei = parseEther(valueBnb);
    const valueWeiHex = '0x' + valueWei.toString(16);

    // Broadcast transaction directly through user's active wallet provider
    const txHash = await provider.request({
      method: 'eth_sendTransaction',
      params: [
        {
          from: address,
          to,
          value: valueWeiHex,
        },
      ],
    });

    if (!txHash || typeof txHash !== 'string') {
      throw new Error('Transaction submission failed to return a transaction hash.');
    }

    // Wait for on-chain receipt on BSC Testnet
    try {
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash as `0x${string}` });
      await refreshBalance();
      return { hash: txHash, blockNumber: Number(receipt.blockNumber) };
    } catch (receiptErr) {
      console.warn('Receipt wait slow or timed out, transaction broadcast confirmed:', receiptErr);
      return { hash: txHash };
    }
  };

  const signSessionDelegation = async (message: string): Promise<string> => {
    if (!address) {
      throw new Error('Please connect your wallet first.');
    }

    const provider = activeProvider || (typeof window !== 'undefined' ? (window as any).ethereum : null);
    if (!provider) {
      throw new Error('No active Web3 wallet provider available.');
    }

    return await provider.request({
      method: 'personal_sign',
      params: [message, address],
    });
  };

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected: !!address,
        isConnecting,
        chainId,
        balance,
        walletType,
        walletName,
        error,
        isModalOpen,
        discoveredWallets,
        openModal: () => setIsModalOpen(true),
        closeModal: () => setIsModalOpen(false),
        connect,
        connectProvider,
        disconnect,
        switchNetwork,
        sendEscrowPayment,
        signSessionDelegation,
        refreshBalance,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
