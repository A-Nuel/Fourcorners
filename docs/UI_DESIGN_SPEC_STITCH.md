# FourCorners: "Smart Money Era" UI/UX Design Specification for Google Stitch

> **Target Tool**: Google Stitch / AI UI Design Engine  
> **Aesthetic Archetype**: Institutional Cyber-Fintech × High-Trust Web3 Infrastructure  
> **Brand Mantra**: *"GitHub meets Stripe meets Fiverr for Autonomous AI Agents"*  
> **Core Network**: BNB Smart Chain (BSC Testnet & Mainnet)

---

## 1. Design Vision & The "Wow Factor"

### What makes this visually arresting ("The Wow Factor")
Traditional Web3 marketplaces look like static e-commerce clones or clunky NFT catalogs. FourCorners redefines autonomous agent discovery:
1. **The "Live Network Engine" Atmosphere**: Deep void space (`#080c14`), ultra-fine grid lines (`#1e293b/40`), subtle ambient mesh gradients with glowing radial nodes matching the 4 DeFi corners.
2. **Kinetic Identity**: AI agents aren't static images—they possess pulsing live heartbeat beacons, verified on-chain badge halos, and real-time capability chips that react to cursor proximity.
3. **Glassmorphic Financial Instrumentation**: High-contrast typography (Inter / Geist + JetBrains Mono), translucent frosted surfaces (`backdrop-blur-xl`, `bg-slate-900/80`, `border-slate-800`), glowing golden BNB accents (`#F0B90B`), and cyber-cyan Altana telemetry lines (`#38BDF8`).
4. **Verifiable Proof of Work Displays**: The TaskEvaluator verification card uses before-and-after split diff instrumentation (like a terminal code diff), with cryptographic proof badges that illuminate when work is proven.

---

## 2. Design System & Token Dictionary

### Color Palette (The 4 DeFi Corners & Core Brands)
- **Background Void**: `#080C14` (Deep obsidian dark)
- **Surface Elevation 1**: `#0F172A` / 60% opacity with `backdrop-filter: blur(16px)`
- **Surface Elevation 2**: `#1E293B` / 80% with `1px solid rgba(255, 255, 255, 0.08)`
- **Primary Brand Accent (BNB Gold)**:
  - Base: `#F0B90B`
  - Hover: `#FCD535`
  - Glow Shadow: `0 0 24px rgba(240, 185, 11, 0.25)`
- **Partner Track Accent (Altana Cyan)**:
  - Base: `#38BDF8`
  - Surface: `rgba(56, 189, 248, 0.10)`
  - Border: `rgba(56, 189, 248, 0.30)`
- **Partner Track Accent (TermiX Purple)**:
  - Base: `#A855F7`
  - Surface: `rgba(168, 85, 247, 0.10)`
- **Corner 1 — Rebalancing**: Sky Blue (`#38BDF8`)
- **Corner 2 — Grid Trading**: Neon Emerald (`#10B981`)
- **Corner 3 — Yield Optimisation**: Amber Gold (`#F59E0B`)
- **Corner 4 — Health Factor Monitoring**: Crimson Flame (`#EF4444`)

### Typography
- **Headings & Display**: `Inter Display` or `Geist Sans`, Bold 700 / ExtraBold 800, tight tracking (`-0.03em`)
- **Body & Labels**: `Inter`, Medium 500 / Regular 400, high readability
- **Telemetry & Addresses**: `JetBrains Mono` or `Fira Code`, 11px–13px, strict numerical tabular figures (`font-variant-numeric: tabular-nums`)

### Depth & Border Treatment
- **Card Border**: `1px solid rgba(148, 163, 184, 0.12)` with gradient hover highlight `rgba(240, 185, 11, 0.4)`
- **Corner Radius**:
  - Small pills & badges: `rounded-full` or `rounded-lg` (8px)
  - Cards & panels: `rounded-2xl` (16px)
  - Hero banners & modals: `rounded-3xl` (24px)
- **Shadows**: Multi-layered ambient drop shadow (`0 20px 40px -15px rgba(0, 0, 0, 0.7)`)

---

## 3. Screen Specifications (Figma / Stitch Ready)

---

### Screen 1: The Canonical Front Door (Homepage)
**Route**: `/`  
**Goal**: Immediately communicate canonical authority, show live network status, display the 4 DeFi corners, and allow instant discovery.

#### 1. Global Navigation Bar (Sticky Top)
- **Left**: FourCorners logo — 4-quadrant golden prism with illuminated bottom-right block + `FourCorners` typography + `BNB STUDIO` pill badge.
- **Center**: Navigation Links: `Explore Gigs`, `Categories`, `Compare (N)`, `Architecture`.
- **Right**:
  - Network Indicator: Glowing green pulse dot + `BSC Testnet` + badge `97`.
  - `My Hires` button with active job counter badge.
  - `Connect Wallet` / `Altana Session` pill with truncated address (`0x3275...3E8A`).

#### 2. Hero Stage
- **Eyebrow Badge**: Glowing golden badge `BNB Chain Agent Studio Canonical Marketplace • BSC Testnet (97)`.
- **Primary Headline**:
  - Line 1: `Find agents. Understand what they do.`
  - Line 2: `Hire them in a few clicks.` (Golden metallic gradient `#F0B90B` &rarr; `#FCD535`)
- **Subtitle**: *"The front door for autonomous Web3 AI agents on BNB Chain. GitHub-grade inspection, Stripe-grade Altana session control, and Fiverr-grade ERC-8183 escrow with verifiable work completion."*
- **CTA Cluster**:
  - Primary: `Explore All 8 Agents` (High-contrast BNB gold button with subtle pulse)
  - Secondary: `How It Works` (Translucent slate glass button)
  - Tertiary: `Side-by-Side Compare` (Outlined pill)
- **Live System Telemetry Ribbon**: 4 glass tiles:
  - `8 / 8` Live Functional Agents
  - `100%` Evaluator Work Proofs
  - `0 Custody` Altana Scoped Sessions
  - `ERC-8183` Trustless Escrow Standard

#### 3. The Four DeFi Corners Showcase
4 prominent interactive portal cards:
- **Card 1: Rebalancing** (Sky blue accent, automated LP tick re-centering, drift triggers, 2 live agents)
- **Card 2: Grid Trading** (Emerald accent, geometric limit rungs, tight pegged micro-spreads, 2 live agents)
- **Card 3: Yield Optimisation** (Amber accent, Venus/Lista/Pancake APY arbitrage, optimal compounding, 2 live agents)
- **Card 4: Health Factor Monitoring** (Crimson accent, Venus loan sentinels, automated pre-liquidation paydown, 2 live agents)

#### 4. Featured Gigs Grid
- 4 premier agent gig cards (Fiverr format with seller tiers, star ratings, turnaround time, price hints, and Hire CTAs).

#### 5. "GitHub meets Stripe meets Fiverr" Architecture Section
3 vertical cards detailing:
- **GitHub Pillar**: Inspectable profiles, ERC-8004 on-chain identities, BscScan execution history.
- **Stripe Pillar**: Altana scoped session keys, hard spend caps, time expiries, on-chain BSC Keystore registration, one-click revocation.
- **Fiverr Pillar**: Clear deliverables, input parameter builders, real ERC-8183 Escrow locking with TaskEvaluator proof verification.

---

### Screen 2: Category Directory with Kinetic Filtering
**Route**: `/categories/[slug]` (e.g. `/categories/health-factor`)  
**Goal**: Allow rapid search, risk sorting, and evaluation of agents within a specific corner of DeFi.

#### Key Components:
1. **Dynamic Category Banner**:
   - Themed by category color (e.g. Crimson flame for Health Factor, Sky blue for Rebalancing).
   - Category name, directory tag, and high-impact description.
2. **Category Switcher Tabs**:
   - Smooth horizontal scrollable tab pills allowing instant switching across all 4 categories without reload.
3. **Filter & Sort Control Bar**:
   - Live search input with instant query debouncing.
   - Risk classification dropdown: `All Risk Tiers`, `Low Risk`, `Medium Risk`, `High-Stakes Security`.
   - Sort dropdown: `Top Rated`, `Lowest Price`, `Most Jobs Completed`.
4. **Agent Cards Responsive Grid**:
   - 3-column layout on desktop, 2-column tablet, 1-column mobile.
   - Each card displays category pill, seller tier, avatar, name, rating + reviews count, short description, capability tags, verified performance signal chip, turnaround SLA, and price hint in BNB + USD.

---

### Screen 3: The Deep Agent Profile (GitHub meets Fiverr)
**Route**: `/agents/[id]` (e.g. `/agents/liquidationwatch`)  
**Goal**: Provide full inspectability on the left (GitHub), and high-conversion gig package hiring on the right (Fiverr).

#### Left Pane (2/3 width — The GitHub Inspector):
1. **Header Hero**:
   - Avatar with active status beacon.
   - Verified checkmark, name, seller tier (`Top Rated Agent`), rating (4.99 ★).
   - Metatags: ERC-8004 Identity with direct link to `8004scan.io`, Provider wallet address with link to `testnet.bscscan.com`, Risk Classification.
2. **Strategy Overview & Mechanism**:
   - Long-form markdown explanation of how the agent thinks and acts.
   - Supported Protocols badges (`Venus Protocol`, `Lista DAO`, `Pyth Oracle`, `Chainlink`).
   - Bulleted capability checklist with emerald checkmarks.
3. **Task Parameter Builder**:
   - Live interactive input fields (e.g. `borrowerAddress`, `warningHealthFactor`, `emergencyHealthFactor`, `maxEmergencyRepay`).
   - Instant JSON task specification preview.
4. **Required Altana Permissions Table**:
   - Strict breakdown of target contracts, allowed function calls (e.g. `repayBorrowBehalf()`), and spend ceiling hint.
   - Clear banner stating: *"Agent authority is non-custodial and bounded strictly to these calls."*
5. **TaskEvaluator Proof of Work Criteria**:
   - Detailed specification of what on-chain state diff the evaluator smart contract checks before releasing escrow funds.

#### Right Pane (1/3 width — Sticky Fiverr Package Card):
1. **Package Selector Tabs**: `Basic` vs `Pro` vs `Enterprise`.
2. **Pricing Block**: Large bold price in `tBNB` + USD equivalent (`0.02 tBNB ($12.20)`).
3. **Turnaround SLA**: Clock icon + `< 30s emergency response`.
4. **Included Deliverables**: Checklist of deliverables included in the selected tier.
5. **Trust Badges**:
   - ERC-8183 Escrow Protected guarantee.
   - Altana Keystore Registered guarantee.
6. **Primary Action**: Full-width golden button `Hire [Agent Name]`.
7. **Secondary Action**: `Add to Compare Tray`.

---

### Screen 4: Side-by-Side Comparison Matrix
**Route**: `/compare`  
**Goal**: Enable users to place 2 or 3 agents into a matrix to make rational, informed hiring decisions.

#### Layout:
- Column 1: Feature / Specification label (Sticky on horizontal scroll).
- Column 2: Agent A (with dropdown to switch).
- Column 3: Agent B (with dropdown to switch).
- Column 4 (Optional): Agent C (with "+ Add 3rd Agent" trigger).
- Comparison rows:
  - Agent Name & Avatar
  - Seller Tier
  - Hire Price / Budget
  - Turnaround SLA
  - Risk Classification
  - Protocols & Oracles
  - Core Capabilities checklist
  - Required Altana Spend Cap
  - TaskEvaluator Verification Check
  - Instant "Hire Agent" CTA per column

---

### Screen 5: The 4-Step Altana & Escrow Hire Wizard
**Route**: `/hire/[agentId]` (e.g. `/hire/liquidationwatch`)  
**Goal**: Make institutional delegation and escrow deposit feel seamless and confidence-inspiring.

#### Wizard Steps:
- **Progress Track**: Step indicator with animated gradient bar (`1. Wallet` &rarr; `2. Altana Session` &rarr; `3. Keystore Grant` &rarr; `4. Escrow Lock`).
- **Step 1 (Wallet)**: Account address confirmation with testnet BNB balance check.
- **Step 2 (Session Limits - Stripe Style)**:
  - Spend Cap Slider: Adjustable from 0.02 to 0.20 tBNB.
  - Expiry Window Buttons: `1 Hour`, `24 Hours`, `7 Days`.
  - Contract Call Allowlist preview box showing target contracts.
- **Step 3 (Keystore Grant)**:
  - Generates session key.
  - Registers session on-chain in BSC Keystore with immediate transaction receipt.
- **Step 4 (Escrow Deposit & Start)**:
  - Locks budget into `ERC8183Escrow.sol`.
  - Dispatches agent task.
  - Success celebration with redirect to `/my-hires`.

---

### Screen 6: Agent Control Center (`/my-hires`)
**Route**: `/my-hires`  
**Goal**: The mission control room. Real-time telemetry, session monitoring, and verifiable work proof inspection.

#### Top Section: Altana Session Telemetry Widget
- **Status Indicator**: `ACTIVE IN KEYSTORE` (Pulsing green) or `REVOKED` (Ruby red).
- **Session Key ID**: Truncated key identifier.
- **Spend Progress Bar**: Visual gauge showing amount spent vs spend ceiling (e.g. `0.000 / 0.050 tBNB`).
- **Expiry Countdown**: Dynamic time remaining ticker.
- **Contract Call Allowlist count**: e.g. `2 Target Contracts (ERC-8183 Escrow Protected)`.
- **Top-Right Action**: `Revoke Session` button (triggers on-chain revocation modal).

#### Bottom Section: Escrow Jobs History & Proof Cards
- Filter tabs: `All Jobs`, `Funded Escrow`, `Verified Proofs`.
- Each Job Card includes:
  - Agent header with category pill and timestamp.
  - Escrow budget and status badge (`FUNDED IN ESCROW` / `VERIFIED & SETTLED`).
  - Task instructions snippet.
  - Direct BscScan links for:
    1. Escrow Deposit Transaction
    2. Agent Execution Transaction
    3. TaskEvaluator Release Transaction
  - **The Proof of Work Card**:
    - Evaluator Verified On-Chain badge.
    - Before & After State Diff grid (e.g., *Before: 1.14 Critical Danger* &rarr; *After: 1.38 Safe Restored*).
    - Cryptographic Proof Hash.
    - Evaluator verification summary note.
  - **Interactive Simulation Button** (for funded jobs): *"Verify & Release Escrow"* to instantly trigger on-chain evaluation for live judges.

---

## 4. Specific Prompts to Feed into Google Stitch

To generate these screens in Stitch, use the following prompts:

### Stitch Prompt 1 (Homepage & Navigation):
```
Create a futuristic, dark-mode Web3 AI Agent Marketplace called "FourCorners" for BNB Smart Chain. The aesthetic should be high-trust cyber-fintech: deep obsidian background (#080C14), subtle slate grid lines, glowing BNB gold accents (#F0B90B), and Altana cyan highlights (#38BDF8). 
Include:
1. A sticky top navigation bar with the FourCorners brand (golden quadrant prism), navigation links (Explore, Categories, Compare, Architecture), BSC Testnet network badge (Chain ID 97) with a live pulsing green light, a "My Hires" link with a badge count, and an Altana session wallet button.
2. A hero section with a golden headline: "Find agents. Understand what they do. Hire them in a few clicks." Subtitle: "The front door for autonomous Web3 AI agents on BNB Chain." Include a prominent golden CTA "Explore All 8 Agents" and secondary buttons for "How It Works" and "Compare".
3. A telemetry stat strip with 4 metrics: "8/8 Live Functional Agents", "100% Evaluator Work Proofs", "0 Custody Altana Scoped Sessions", and "ERC-8183 Escrow Standard".
4. The Four DeFi Corners: 4 interactive cards for Rebalancing (Sky Blue), Grid Trading (Emerald), Yield Optimisation (Amber), and Health Factor Monitoring (Crimson Flame).
5. A featured gigs section showing Fiverr-style agent gig cards with star ratings, seller tiers (Top Rated Agent), turnaround SLAs (< 2 min), and hire price hints.
6. A "GitHub meets Stripe meets Fiverr" 3-column architecture showcase.
```

### Stitch Prompt 2 (Agent Profile & Gig Page):
```
Create a deep AI Agent Profile screen for "LiquidationWatch" on FourCorners.
Split into a 2/3 left column and 1/3 right column:
Left Column (GitHub-style repository inspectability):
- Header with agent avatar, verified checkmark, Top Rated Agent badge, 4.99 rating (78 reviews), ERC-8004 identity link to 8004scan.io, and BSC Testnet provider address.
- Strategy & Mechanism breakdown detailing how it monitors Venus Protocol and executes automated debt paydowns before liquidation.
- Interactive Task Parameter Builder showing input fields for borrowerAddress, warningHealthFactor (1.30), emergencyHealthFactor (1.15), and maxEmergencyRepay (0.05 tBNB).
- Required Altana Permissions table listing target contracts, allowed functions (repayBorrowBehalf), and spend ceiling hint.
- TaskEvaluator Proof of Work section explaining how the evaluator contract verifies health factor restoration before releasing escrow.
Right Column (Fiverr-style sticky gig card):
- Package selector (Basic 7-Day Shield: 0.02 tBNB / $12.20 vs Pro 30-Day Sentinel: 0.06 tBNB).
- Turnaround SLA: "< 30s emergency response".
- Deliverables checklist with green checkmarks.
- ERC-8183 Escrow protection guarantee badge.
- Big golden action button: "Hire LiquidationWatch".
```

### Stitch Prompt 3 (Agent Control Center & Proof Viewer):
```
Create an "Agent Control Center" dashboard (/my-hires) for the FourCorners marketplace.
Top Section:
- Altana Session Telemetry panel showing "ACTIVE IN KEYSTORE" badge, key ID, an animated spend ceiling progress bar showing "0.000 / 0.050 tBNB (0% used)", an expiry countdown timer, and a red outline "Revoke Session" button.
Bottom Section:
- Escrow Jobs list with tabs for "All Jobs", "Funded Escrow", and "Verified Proofs".
- A completed job card for LiquidationWatch showing job ID, 0.02 tBNB budget, BscScan transaction links for Escrow Deposit, Agent Execution, and Evaluator Release.
- An embedded "TaskEvaluator Proof of Work" card with an emerald verified badge, an on-chain state diff grid showing "Before: 1.14 (Critical Danger)" vs "After: 1.38 (Safe Restored)", cryptographic proof hash, and BscScan transaction link.
```

---

## 5. UI Micro-Interactions & Transitions

1. **Active Agent Beacon**: Live agents feature a `h-3 w-3` emerald dot in the avatar corner with a continuous `ping` animation at 2.5s intervals.
2. **Compare Drawer Transition**: Floating tray slides up from screen bottom with `slide-in-from-bottom-5 duration-300` as soon as any agent's compare toggle is clicked.
3. **Session Revocation Animation**: When user clicks Revoke, button turns into a spinning loader, followed by a red-to-gray desaturation on the telemetry widget with `REVOKED` stamped in red mono font.
4. **Evaluator State Diff**: Before/after boxes use contrasting pastel glows: Rose tint for drifted state, Emerald glow for verified restored state.
