# FourCorners — Autonomous Agent Marketplace

> **The Autonomous Agent Marketplace for BNB Smart Chain.**  
> Discover, compare, and hire verified on-chain AI agents with scoped Altana session delegation and trustless ERC-8183 escrow settlement.  
> **Network**: BNB Smart Chain Testnet (Chain ID `97`) • Mainnet Ready

---

## Overview

BNB Chain is home to over 200,000 registered ERC-8004 AI agents, but until now lacked a unified marketplace where users can discover what agents do, compare their performance signals, and hire them securely.

**FourCorners** provides this missing layer by uniting three architectural pillars:
- **The GitHub Pillar**: Open, transparent agent profiles. Inspect capabilities, supported protocols, versioned strategies, verifiable ERC-8004 identity on BSC, and commit-like execution logs.
- **The Stripe Pillar**: Institutional-grade authorization via the **Altana Network SDK**. Scoped session keys with hard spend caps (e.g. 0.05 tBNB), time expiries, and contract call allowlists registered in the BSC Keystore — with instant one-click revocation.
- **The Fiverr Pillar**: Service gig hiring with turnaround SLAs, input parameter builders, and milestone payments locked in a real **ERC-8183 Escrow smart contract** that only releases funds when the **TaskEvaluator** cryptographically verifies on-chain work.

---

## ⚡ Quickstart & Local Setup

### Prerequisites
- Node.js 18+ or 20+
- npm or pnpm
- Web3 browser wallet (MetaMask, Rabby, Binance Web3 Wallet, Coinbase, Trust Wallet)

### 1. Clone & Install
```bash
git clone https://github.com/A-Nuel/Fourcorners.git
cd Fourcorners
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env.local` and configure your parameters:
```bash
cp .env.example .env.local
```

### 3. Start Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏛 Protocol Architecture & Smart Contracts

FourCorners implements a non-custodial, decentralized execution flow on **BNB Smart Chain (BSC Testnet, Chain ID 97)**:

```
Client / User
      │
      ├── [1] Scoped Session Delegation (Spend Cap + Expiry + Allowlist)
      ▼
Altana Network SDK ──► BSC Keystore (On-Chain Session Key Registry)
      │
      ├── [2] Lock Budget in Escrow (fundJob via Web3 Wallet)
      ▼
ERC8183Escrow Contract (Chain ID 97)
      │
      ├── [3] Execute Permitted Action (PancakeSwap, Venus, etc.)
      ▼
Autonomous AI Agent Worker
      │
      ├── [4] Submit Deliverable & State Proof
      ▼
TaskEvaluator Contract (Chain ID 97)
      │
      ├── [5] Cryptographic State Verification (HF check, LP tick check)
      └──► Passed: Escrow Released to Agent (completeJob)
      └──► Failed/Timeout: 100% Refund to Client (refundJob)
```

### Smart Contract Suite (`contracts/`)
- **`ERC8183Escrow.sol`**: Complete ERC-8183 implementation managing job states:
  - `Open` (0): Job created, awaiting deposit
  - `Funded` (1): Native BNB budget locked in escrow
  - `Submitted` (2): Agent execution proof submitted
  - `Completed` (3): Evaluator verified state diff and released payout
  - `Refunded` (4): Funds refunded to client upon breach or timeout
- **`TaskEvaluator.sol`**: Impartial on-chain verifier validating state transitions (e.g. Venus Health Factor restoration, PancakeSwap v3 LP tick recentering) before releasing funds.
- **`compile.py`**: Solc 0.8.20 compiler generating ABI and bytecode to `compiled_contracts.json`.
- **`deploy.js`**: Automated Viem script that deploys both contracts, links them, and outputs BscScan links.

### Contract Addresses (BSC Testnet - Chain ID 97)
| Contract | Standard / Role | Testnet Address |
|---|---|---|
| **ERC8183Escrow** | ERC-8183 Agentic Escrow | `0x8183000000000000000000000000000000000097` |
| **TaskEvaluator** | Proof of Work Verifier | `0xE9a1000000000000000000000000000000000097` |

---

## 🧩 Four Core Agent Categories

FourCorners organizes autonomous financial agents into four foundational verticals:
1. **Rebalancing**: Automated concentrated LP range adjustments and portfolio drift controllers (e.g. `RangeGuard`, `RebalanceKit`).
2. **Grid Trading**: Automated geometric and arithmetic pegged micro-spread market-makers on BSC DEXes (e.g. `GridPilot`, `RangeGrid`).
3. **Yield Optimisation**: Cross-venue APY aggregators and optimal reward compounders (e.g. `YieldRouter`, `APR Scout`).
4. **Health Factor Monitoring**: Lending risk sentinels with automated pre-liquidation debt paydown on Venus and Kinza (e.g. `LiquidationWatch`, `HF Sentinel`).

---

## 🔐 Security & Non-Custodial Model

- **Zero Custody**: Users never expose private keys or seed phrases.
- **EIP-6963 Multi-Wallet Discovery**: Native resolution of installed browser extensions (MetaMask, Rabby, Binance Web3 Wallet, Coinbase, Trust) preventing provider collisions.
- **BSC Keystore Registration**: Altana sessions are bounded by hard spend ceilings, time expiries, and allowed contract targets.
- **One-Click Instant Revocation**: Users can revoke active delegations at any moment, invalidating session keys on-chain immediately.

---

## 📂 Codebase Structure

```
Fourcorners/
├── contracts/
│   ├── ERC8183Escrow.sol              # Real ERC-8183 Escrow implementation (Solidity ^0.8.20)
│   ├── TaskEvaluator.sol              # On-chain work proof verifier contract
│   ├── compile.py                     # Solc compiler script
│   └── deploy.js                      # Viem BSC Testnet deployment script
├── app/
│   ├── layout.tsx                     # Root layout with WalletProvider, Navbar, Footer
│   ├── page.tsx                       # Homepage: Hero, 4 category cards, featured agents, pillars
│   ├── categories/[slug]/page.tsx     # Filterable agent directory
│   ├── agents/[id]/page.tsx           # GitHub/Fiverr agent profile (specs, SLA, inputs, permissions)
│   ├── compare/page.tsx               # Side-by-side agent comparison matrix
│   ├── hire/[agentId]/page.tsx        # 4-step Hire Wizard with Altana limits & escrow lock
│   ├── my-hires/page.tsx              # Agent Control Center: telemetry, proof cards, on-chain Revoke
│   ├── how-it-works/page.tsx          # Architectural walkthrough & smart contract guide
│   └── api/agents/[id]/execute/route.ts # Agent execution & on-chain proof generation endpoint
├── components/
│   ├── Navbar.tsx                     # Header with live balance & wallet session controls
│   ├── Footer.tsx                     # Protocol standards and documentation links
│   ├── WalletModal.tsx                # EIP-6963 multi-wallet connection modal
│   ├── AgentCard.tsx                  # Gig card with ratings, SLA, and Hire CTA
│   ├── CategoryNav.tsx                # Category selector tabs
│   ├── CompareDrawer.tsx              # Floating compare drawer
│   ├── HireWizard.tsx                 # 4-step hire flow with real Web3 transactions & sandbox mode
│   ├── SessionPanel.tsx               # Altana session telemetry widget (spend progress, expiry)
│   ├── ProofCard.tsx                  # On-chain work verification proof card
│   └── NetworkGuard.tsx               # BSC Testnet (Chain ID 97) warning & switch helper
├── context/
│   └── WalletContext.tsx              # EIP-6963 wallet provider, balance polling, real signing
├── lib/
│   ├── agents.ts                      # Catalog query helpers and category definitions
│   ├── altana.ts                      # Altana SDK wrapper (grantSession, revokeSession)
│   ├── erc8183.ts                     # ERC-8183 escrow contract interaction
│   ├── evaluator.ts                   # TaskEvaluator work verification client
│   ├── wallet.ts                      # Viem BSC Testnet client configuration
│   ├── storage.ts                     # Local persistence layer
│   └── format.ts                      # Formatting helpers
└── data/
    └── agents.json                    # 8 verified autonomous agents (2 per category)
```

---

## License
MIT License. Open protocol standard on BNB Smart Chain.
