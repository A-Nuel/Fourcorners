import { Agent, Category, CategoryInfo } from './types';
import rawAgents from '../data/agents.json';

export const CATEGORIES: CategoryInfo[] = [
  {
    slug: 'rebalancing',
    name: 'Rebalancing',
    shortName: 'Rebalancing',
    tagline: 'Automated LP range adjustments & portfolio drift controllers',
    description: 'Autonomous agents that monitor concentrated liquidity (PancakeSwap v3) and portfolio asset allocations. They execute optimal tick recentering and low-slippage drift rebalances when volatility strikes.',
    iconName: 'Scale',
    accentColor: '#38bdf8',
    badgeBg: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    borderColor: 'border-sky-500/30 hover:border-sky-500/60',
  },
  {
    slug: 'grid-trading',
    name: 'Grid Trading',
    shortName: 'Grid',
    tagline: 'Automated geometric & pegged micro-spread market-makers',
    description: 'High-efficiency grid trading agents deploying buy-low-sell-high order rungs inside customizable price channels on BNB Chain DEXes, with built-in stop losses and circuit breakers.',
    iconName: 'Grid',
    accentColor: '#10b981',
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    borderColor: 'border-emerald-500/30 hover:border-emerald-500/60',
  },
  {
    slug: 'yield-optimisation',
    name: 'Yield Optimisation',
    shortName: 'Yield',
    tagline: 'Cross-venue APY aggregators & optimal reward compounding',
    description: 'Continuously monitors lending supply rates, staking yields, and liquidity mining rewards across Venus, Lista DAO, and PancakeSwap. Routes deposits to peak risk-adjusted APY venues.',
    iconName: 'TrendingUp',
    accentColor: '#f59e0b',
    badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    borderColor: 'border-amber-500/30 hover:border-amber-500/60',
  },
  {
    slug: 'health-factor',
    name: 'Health Factor Monitoring',
    shortName: 'Health Factor',
    tagline: 'Lending risk sentinels with automated pre-liquidation debt paydown',
    description: 'Real-time collateral guardians protecting Venus and Kinza loans from liquidation haircuts. Streams oracle price feeds and executes emergency debt paydown if health factors breach safety bounds.',
    iconName: 'ShieldAlert',
    accentColor: '#ef4444',
    badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    borderColor: 'border-rose-500/30 hover:border-rose-500/60',
  },
];

export const ALL_AGENTS: Agent[] = rawAgents as Agent[];

export function getAgentsByCategory(category: Category): Agent[] {
  return ALL_AGENTS.filter((a) => a.category === category);
}

export function getAgentById(id: string): Agent | undefined {
  return ALL_AGENTS.find((a) => a.id.toLowerCase() === id.toLowerCase());
}

export function getCategoryInfo(category: Category): CategoryInfo | undefined {
  return CATEGORIES.find((c) => c.slug === category);
}

export function searchAgents(query: string, category?: Category): Agent[] {
  let filtered = ALL_AGENTS;
  if (category) {
    filtered = filtered.filter((a) => a.category === category);
  }
  if (!query.trim()) return filtered;

  const q = query.toLowerCase();
  return filtered.filter(
    (a) =>
      a.name.toLowerCase().includes(q) ||
      a.shortDescription.toLowerCase().includes(q) ||
      a.capabilities.some((c) => c.toLowerCase().includes(q)) ||
      a.supportedProtocols.some((p) => p.toLowerCase().includes(q))
  );
}

export function getFeaturedAgents(): Agent[] {
  // Returns one premier agent from each of the 4 categories
  return [
    getAgentById('rangeguard')!,
    getAgentById('gridpilot')!,
    getAgentById('yieldrouter')!,
    getAgentById('liquidationwatch')!,
  ].filter(Boolean);
}
