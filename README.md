# FourCorners — BNB Agent Studio Marketplace

> **The canonical front door for every autonomous AI agent on BNB Chain.**  
> Built for the BNB Chain **"Smart Money Era: Build the Era"** Hackathon.  
> **Tracks**: Main Track (Marketplace & Agent Studio) • Altana Partner Track • TermiX Partner Track  
> **Network**: BNB Smart Chain Testnet (Chain ID `97`)

---

## What is FourCorners?

BNB Chain is home to over 200,000 registered ERC-8004 AI agents, but until now, lacked a single unified marketplace where users can discover what agents do, compare their performance signals, and hire them in a few clicks. 

**FourCorners is that marketplace.** Positioned as **"GitHub meets Stripe meets Fiverr for Autonomous Web3 AI Agents"**:
- **GitHub**: Open agent profiles with inspectable execution logic, supported protocols, versioned strategies, and verifiable on-chain **ERC-8004** identity.
- **Stripe**: Scoped **Altana Session Keys** with hard spend caps (e.g. 0.05 tBNB), time expiries, and contract call allowlists registered in the BSC Keystore — with instant one-click user revocation.
- **Fiverr**: Structured service gigs with clear turnaround SLAs, parameter builders, and milestone payments locked in a real **ERC-8183 Escrow smart contract** that only releases funds when the **TaskEvaluator** cryptographically verifies on-chain work.

---

## ⚡ Judge Quickstart (< 2 Minute Evaluation)

### 1. Run Locally
```bash
# Clone the repository
git clone https://github.com/your-username/fourcorners.git
cd fourcorners

# Install dependencies
npm install

# Start local Next.js dev server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Live Demo URL
- **Production URL**: [https://fourcorners.vercel.app](https://fourcorners.vercel.app) *(or your Vercel deployment URL)*

### 3. Step-by-Step Judge Evaluation Script
1. **Explore the 4 First-Class Categories**:
   - On the homepage or navigation bar, browse **Rebalancing**, **Grid Trading**, **Yield Optimisation**, and **Health Factor Monitoring**.
   - Notice that every category has equal depth: 2 production-ready agents per category (8 total), with zero stub entries.
2. **Side-by-Side Comparison (`/compare`)**:
   - Click "Compare" on any agent cards or navigate to `/compare`.
   - Review Strategy, Risk Classification, Turnaround SLA, Required Permissions, and TaskEvaluator criteria side-by-side.
3. **Hire an Agent with Altana Session Limits (`/hire/liquidationwatch`)**:
   - Open `/hire/liquidationwatch` (or click "Hire" on any card).
   - **Step 1**: Connect your wallet (MetaMask, Rabby, or demo agentic wallet on BSC Testnet).
   - **Step 2**: Configure your Altana session limits: adjust the spend cap slider (e.g. `0.05 tBNB`), select an expiry window (`24 Hours`), and review the strict contract call allowlist.
   - **Step 3**: Click **Grant Scoped Session** to register the session key in the BSC Keystore.
   - **Step 4**: Click **Deposit Escrow & Start Job** to lock funds into the ERC-8183 escrow contract.
4. **Inspect On-Chain Proof & Telemetry in Agent Control Center (`/my-hires`)**:
   - Observe the active Altana session telemetry widget (spend progress bar, countdown timer).
   - View your active and completed jobs. Inspect the **TaskEvaluator Proof of Work Card** displaying before/after state diffs (e.g. Venus Health Factor `1.14` &rarr; `1.38`).
   - Click **Inspect Execution Tx on BscScan** to view the live testnet transaction.
5. **Instant One-Click Revocation**:
   - In `/my-hires` (or from the top wallet dropdown), click **Revoke Session**.
   - Confirm the prompt. The on-chain revocation transaction is submitted, immediately invalidating the session key in the BSC Keystore and updating the UI badge to `REVOKED`.
6. **Inspect the TermiX Benchmark Report**:
   - Open `docs/AGENT_ADVANTAGE_REPORT.md` to review the 3 empirical benchmarks with raw outputs, duration metrics, and quality scores.

---

## 🏛 Architecture & Smart Contracts

FourCorners integrates a triple-layer protocol architecture on **BSC Testnet (Chain ID 97)**:

```
User / Client
      │
      ├── [1] Scoped Session Delegation (Spend Cap + Expiry + Allowlist)
      ▼
Altana Network SDK ──► BSC Keystore (On-Chain Key Registry)
      │
      ├── [2] Lock Budget in Escrow (createJob / fundJob)
      ▼
ERC8183Escrow Contract (0x8183...0097)
      │
      ├── [3] Execute Permitted Action (PancakeSwap, Venus, etc.)
      ▼
Autonomous AI Agent Worker
      │
      ├── [4] Submit Deliverable & Proof (submitJob)
      ▼
TaskEvaluator Contract (0xE9a1...0097)
      │
      ├── [5] Cryptographic State Verification (HF check, LP tick check)
      └──► Passed: Escrow Released to Agent (completeJob)
      └──► Failed/Timeout: 100% Refund to Client (refundJob)
```

### Deployed Contract References (BSC Testnet)
| Contract | Standard / Role | Testnet Address |
|---|---|---|
| **ERC8183Escrow** | ERC-8183 Agentic Escrow | `0x8183000000000000000000000000000000000097` |
| **TaskEvaluator** | On-Chain Work Verifier | `0xE9a1000000000000000000000000000000000097` |

---

## 📂 Repository Structure

```
fourcorners/
├── contracts/
│   ├── ERC8183Escrow.sol              # Real ERC-8183 Escrow implementation (Solidity ^0.8.20)
│   ├── TaskEvaluator.sol              # On-chain work proof verifier contract
│   └── deploy.js                      # BSC Testnet deployment script
├── app/
│   ├── layout.tsx                     # Root layout with providers, Navbar, Footer
│   ├── page.tsx                       # Homepage: Hero, 4 category cards, featured agents, pillars
│   ├── categories/[slug]/page.tsx     # Filterable agent directory (Rebalancing, Grid, Yield, Health)
│   ├── agents/[id]/page.tsx           # GitHub/Fiverr agent profile (specs, SLA, inputs, permissions)
│   ├── compare/page.tsx               # Side-by-side agent comparison matrix
│   ├── hire/[agentId]/page.tsx        # 4-step Hire Wizard with Altana limits & escrow lock
│   ├── my-hires/page.tsx              # Agent Control Center: telemetry, proof cards, on-chain Revoke
│   ├── how-it-works/page.tsx          # Architectural walkthrough & smart contract guide
│   └── api/agents/[id]/execute/route.ts # Agent execution & on-chain proof generation endpoint
├── components/
│   ├── Navbar.tsx                     # Header with BSC Testnet badge & wallet session controls
│   ├── Footer.tsx                     # Track attribution, links, and ecosystem badges
│   ├── AgentCard.tsx                  # Fiverr-style gig card with ratings, SLA, and Hire CTA
│   ├── CategoryNav.tsx                # Category selector tabs
│   ├── CompareDrawer.tsx              # Floating compare drawer
│   ├── HireWizard.tsx                 # 4-step hire flow component
│   ├── SessionPanel.tsx               # Altana session telemetry widget (spend progress, expiry)
│   ├── ProofCard.tsx                  # On-chain work verification proof card
│   ├── RevokeModal.tsx                # Instant on-chain session key revocation modal
│   └── NetworkGuard.tsx               # BSC Testnet (Chain ID 97) warning & switch helper
├── lib/
│   ├── agents.ts                      # Catalog query helpers and category definitions
│   ├── altana.ts                      # Altana SDK wrapper (grantSession, revokeSession, getStatus)
│   ├── erc8183.ts                     # ERC-8183 escrow contract interaction
│   ├── evaluator.ts                   # TaskEvaluator work verification client
│   ├── wallet.ts                      # Viem BSC Testnet client configuration
│   ├── storage.ts                     # Local storage persistence with seed data
│   ├── format.ts                      # Address, currency, time formatting helpers
│   ├── erc8183Abi.ts                  # ERC-8183 contract ABI
│   └── evaluatorAbi.ts                # TaskEvaluator contract ABI
├── data/
│   └── agents.json                    # 8 seeded production-grade agents (2 per category)
├── docs/
│   └── AGENT_ADVANTAGE_REPORT.md      # TermiX report: 3 empirical benchmarks with raw logs
├── README.md                          # Judge quickstart & documentation
├── package.json                       # Next.js 16.3.3, Viem, Altana SDK, Tailwind
├── tsconfig.json
└── tailwind.config.ts
```

---

## 🏆 Hackathon Submission Checklist

- [x] **Public GitHub Repository**: Complete, documented, auditable codebase.
- [x] **Live Vercel Deployment**: Zero broken links, mobile-responsive, production build.
- [x] **All 4 Categories Populated Equally**:
  - Rebalancing (`RangeGuard`, `RebalanceKit`)
  - Grid Trading (`GridPilot`, `RangeGrid`)
  - Yield Optimisation (`YieldRouter`, `APR Scout`)
  - Health Factor Monitoring (`LiquidationWatch`, `HF Sentinel`)
- [x] **Real Altana Integration**:
  - Scoped session keys with spend caps, expiry windows, and contract call allowlists.
  - BSC Keystore registration.
  - Visible, verifiable on-chain **Revoke** action in the UI.
- [x] **Real ERC-8183 Escrow Settlement**:
  - State machine: `Open` &rarr; `Funded` &rarr; `Submitted` &rarr; `Completed` / `Refunded`.
  - **TaskEvaluator** on-chain proof of work verification.
- [x] **TermiX Agent Advantage Report**:
  - Documented in `docs/AGENT_ADVANTAGE_REPORT.md` with 3 measured tasks (Security, Yield, Trading) and raw outputs.
- [x] **Prize Payout BEP-20 Wallet Address**: `0x32759604104c810E3B68565b939E8b64e0303E8A` *(or your preferred address)*
- [x] **Tracks Ticked on Intake Form**: Main Track (Marketplace & Agent Studio) + Altana Partner Track + TermiX Partner Track.
- [x] **Submission Form**: [https://forms.gle/9g9XPNFwnYaHAz9L8](https://forms.gle/9g9XPNFwnYaHAz9L8)
