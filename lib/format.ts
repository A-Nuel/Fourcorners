/**
 * Formatting and utility helpers for FourCorners.
 */

export function truncateAddress(address: string, start = 6, end = 4): string {
  if (!address) return '';
  if (address.length <= start + end) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

export function formatBnb(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0.00 tBNB';
  return `${num.toFixed(3)} tBNB`;
}

export function formatUsd(bnbAmount: string | number, bnbPrice = 610): string {
  const num = typeof bnbAmount === 'string' ? parseFloat(bnbAmount) : bnbAmount;
  if (isNaN(num)) return '$0.00';
  return `$${(num * bnbPrice).toFixed(2)}`;
}

export function formatTimeRemaining(expiryTimestamp: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = expiryTimestamp - now;
  if (diff <= 0) return 'Expired';
  const hours = Math.floor(diff / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m left`;
  }
  return `${minutes}m left`;
}

export function getBscScanTxUrl(txHash: string): string {
  return `https://testnet.bscscan.com/tx/${txHash}`;
}

export function getBscScanAddressUrl(address: string): string {
  return `https://testnet.bscscan.com/address/${address}`;
}

export function get8004ScanUrl(erc8004Id: string): string {
  return `https://8004scan.io/agent/${erc8004Id}`;
}
