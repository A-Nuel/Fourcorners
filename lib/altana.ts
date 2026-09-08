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
 * Altana session grant — does NOT invent Keystore tx hashes.
 * Intent-only until live Altana SDK path is enabled.
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
      : [CONTRACT_ADDRESSES.escrow, CONTRACT_ADDRESSES.evaluator];

  if (isContractsDeployed() && process.env.NEXT_PUBLIC_ALTANA_ENABLED === 'true') {
    throw new AltanaNotReadyError(
      'Altana live path flagged on but SDK wiring incomplete. Not fabricating a Keystore tx.'
    );
  }

  return {
    sessionKeyId: `intent-${ownerAddress.slice(2, 10)}-${expiryTimestamp}`,
    publicKey: '',
    ownerAddress,
    spendCapBnb,
    spentBnb: '0',
    expiryTimestamp,
    allowedContracts: targetContracts,
    status: 'intent',
    txHash: '',
    keystoreRegistered: false,
  };
}

export async function revokeAltanaSession(
  sessionKeyId: string
): Promise<{ success: boolean; txHash: string; mode: 'onchain' | 'local' }> {
  if (!sessionKeyId) {
    return { success: false, txHash: '', mode: 'local' };
  }
  if (isContractsDeployed() && process.env.NEXT_PUBLIC_ALTANA_ENABLED === 'true') {
    throw new AltanaNotReadyError('On-chain revoke not wired; refusing fake tx hash.');
  }
  return { success: true, txHash: '', mode: 'local' };
}

export function getKeystoreExplorerUrl(_sessionKeyId?: string): string {
  return 'https://testnet.altana.network';
}
