'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, ArrowRight } from 'lucide-react';

export default function NetworkGuard() {
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !(window as any).ethereum) return;

    const checkNetwork = async () => {
      try {
        const chainId = await (window as any).ethereum.request({ method: 'eth_chainId' });
        // BSC Testnet is 97 (0x61 in hex)
        if (chainId && chainId !== '0x61' && chainId !== 97) {
          setIsWrongNetwork(true);
        } else {
          setIsWrongNetwork(false);
        }
      } catch (e) {
        console.warn('Could not read chainId', e);
      }
    };

    checkNetwork();

    const handleChainChanged = (chainIdHex: string) => {
      if (chainIdHex !== '0x61') {
        setIsWrongNetwork(true);
      } else {
        setIsWrongNetwork(false);
      }
    };

    (window as any).ethereum.on?.('chainChanged', handleChainChanged);
    return () => {
      (window as any).ethereum.removeListener?.('chainChanged', handleChainChanged);
    };
  }, []);

  const switchNetwork = async () => {
    if (typeof window === 'undefined' || !(window as any).ethereum) return;
    try {
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x61' }],
      });
      setIsWrongNetwork(false);
    } catch (switchError: any) {
      // 4902 error code means the chain has not been added to MetaMask
      if (switchError.code === 4902) {
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
          setIsWrongNetwork(false);
        } catch (addError) {
          console.error('Failed to add BSC testnet', addError);
        }
      }
    }
  };

  if (!isWrongNetwork) return null;

  return (
    <div className="w-full bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 text-xs text-amber-200 backdrop-blur-md">
      <div className="mx-auto max-w-7xl flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 text-amber-400 flex-shrink-0" />
          <span>
            You are connected to an unsupported network. FourCorners runs on <strong>BSC Testnet (Chain ID 97)</strong>.
          </span>
        </div>
        <button
          onClick={switchNetwork}
          className="flex items-center space-x-1 rounded-lg bg-amber-500 px-2.5 py-1 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors"
        >
          <span>Switch to BSC Testnet</span>
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
