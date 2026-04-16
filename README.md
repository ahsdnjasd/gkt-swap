// /Users/parthkaran/Documents/claude_projects/liquidswap/README.md
# ⬡ LiquidSwap — DEX on Stellar

> Swap XLM ↔ LQID and earn fees as a liquidity provider. Built on 
> Stellar Testnet with real-time price feeds and production CI/CD.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Stellar](https://img.shields.io/badge/Stellar-Testnet-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)
![CI](https://github.com/parth1241/liquidswap/actions/workflows/ci.yml/badge.svg)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 🌐 Live Demo
[https://liquidswap-stellar.vercel.app](https://liquidswap-stellar.vercel.app)

## 🎥 Demo Video
[Watch 1-minute demo](https://youtu.be/PLACEHOLDER)

## ✨ Features
- **Fluid Swapping**: Instant exchanges between XLM and LQID using an automated market maker (AMM).
- **Liquidity Provision**: Add liquidity to the XLM/LQID pool and earn 0.3% fees on every trade.
- **Real-Time Data**: Live price feeds, TVL, and volume updates powered by Server-Sent Events (SSE).
- **Stellar Integration**: Direct interaction with the Stellar Horizon API and Freighter wallet.
- **Inter-Operation Pattern**: Atomic multi-operation transactions for complex liquidity updates.
- **Pro Performance**: Built with Next.js 14, optimized for both desktop and mobile users.
- **Administrative Control**: Secure panel for protocol initialization and Horizon synchronization.
- **Global CI/CD**: Fully automated testing and deployment pipeline via GitHub Actions.

## 🛠️ Tech Stack
| Category | Technology |
|----------|------------|
| Frontend | Next.js 14 (App Router), React 18, Tailwind CSS |
| Blockchain | @stellar/stellar-sdk, @stellar/freighter-api |
| Backend | Next.js Server Actions & Route Handlers |
| Database | MongoDB Atlas, Mongoose ODM |
| Real-time | Server-Sent Events (SSE) |
| Testing | Jest, React Testing Library |
| DevOps | GitHub Actions, Vercel |

## ⛓️ Stellar Integration

### Custom Tokens
| Token | Code | Purpose |
|-------|------|---------|
| Trade Token | LQID | The primary swappable asset for the exchange |
| LP Share Token | LPOOL | Represents a provider's percentage of the liquidity pool |

**$LQID Issuer Address:** `[ADD AFTER DEPLOY]`
**$LPOOL Issuer Address:** `[ADD AFTER DEPLOY]`
**Liquidity Pool ID:** `[ADD AFTER DEPLOY]`

### Inter-Operation Pattern
Stellar utilizes multi-operation transaction envelopes as the native equivalent of inter-contract calls. In LiquidSwap, the **Add Liquidity** transaction is an atomic envelope containing:
1. **Op 1: ChangeTrust**: Ensures the user's account has a trustline for the $LPOOL share token.
2. **Op 2: LiquidityPoolDeposit**: Mints the shares and deposits the assets in a single atomic step. Both operations must succeed for the transaction to be confirmed.

### How Swaps Work
LiquidSwap uses the `PathPaymentStrictReceive` operation for all trades. Swaps are governed by the constant product formula ($x \times y = k$), with a fixed **0.3% protocol fee** distributed back to liquidity providers.

### Real-Time Price Feed
The application maintains a high-velocity price feed via an SSE endpoint (`/api/events`). The client uses the `EventSource` API to receive lightweight JSON updates every 3 seconds, ensuring users always see the latest market state without manual refreshing.

## 📸 Screenshots

### Desktop Swap Interface
*(Add screenshot here)*

### Mobile Responsive View  
*(Add screenshot — REQUIRED for submission)*

### CI/CD Pipeline
*(Add GitHub Actions screenshot — REQUIRED for submission)*

### Test Coverage Output
*(Add jest --coverage screenshot — REQUIRED for submission)*

## 🚀 Local Setup

### Prerequisites
- **Node.js 20+**
- **MongoDB Atlas** account (or local MongoDB)
- **Freighter Wallet** extension installed in your browser
- **Funded Testnet Account**: Generate one at [Stellar Laboratory](https://laboratory.stellar.org)

### Installation
1. Clone the repository: `git clone https://github.com/parth1241/liquidswap.git`
2. Install dependencies: `npm install`
3. Create environment file: `cp .env.local.example .env.local`
4. Fill in your environment variables (see below).
5. Start development server: `npm run dev`

### Environment Variables
| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | Connection string for your MongoDB database |
| `NEXT_PUBLIC_LQID_ISSUER` | Public key of the LQID asset issuer |
| `NEXT_PUBLIC_POOL_ID` | The 64-character ID of the Stellar liquidity pool |
| `ADMIN_SECRET` | A private key used to protect administrative API routes |

### Running Tests
```bash
npm test
npm test -- --coverage
```

### Funding Testnet Account
Use the **Friendbot** at the Stellar Laboratory to fund your public key with 10,000 test XLM.

## 📁 Project Structure
```text
├── .github/workflows/   # CI/CD pipelines
├── src/
│   ├── app/             # App router pages & API endpoints
│   ├── components/      # UI components (Atomic design)
│   ├── lib/             # Core logic (Stellar, AMM, SSE)
│   ├── models/          # Database schemas
│   └── types/           # TS Interfaces
├── tests/               # Jest test suite
└── public/              # Static assets
```

## 🔐 Admin Setup
To initialize your liquidity pool, navigate to `/admin`. You will need to connect the wallet matching `NEXT_PUBLIC_ADMIN_ADDRESS`. Once authenticated, you can initialize the database records and sync reserves directly from the Stellar network.

## 🤝 Contributing
Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## 📄 License
MIT © 2025 Parth Karan
