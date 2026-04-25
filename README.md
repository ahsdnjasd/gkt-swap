# ☄️ GKTSwap | The Fastest DEX on Stellar

GKTSwap is a next-generation decentralized exchange built on the Stellar Testnet. It leverages Stellar's native Liquidity Pools (AMM) to provide instant swaps, deep liquidity, and institutional-grade security with an ultra-premium glassmorphic interface.

[![CI/CD Pipeline](https://github.com/ahsdnjasd/gkt-swap/actions/workflows/ci.yml/badge.svg)](https://github.com/ahsdnjasd/gkt-swap/actions)
[![Live Demo](https://img.shields.io/badge/Live-Demo-cyan?style=for-the-badge&logo=netlify)](https://unrivaled-tarsier-375dd1.netlify.app/)

**Live Demo**: [https://unrivaled-tarsier-375dd1.netlify.app/](https://unrivaled-tarsier-375dd1.netlify.app/)

---

## 🖼️ Platform Interface

GKTSwap provides an ultra-premium, light-themed glassmorphic interface designed for clarity and speed.

### Desktop Dashboard
![Desktop Dashboard](./public/screenshots/dashboard.png)

### Mobile Trading Experience
![Mobile Demo](./public/screenshots/mobile_demo.png)

---

## ⛓️ On-Chain Metadata (Testnet)

The protocol is officially deployed and initialized on the Stellar Testnet.

- **Liquid Token ID**: `[INSERT_FULL_TOKEN_ID_HERE]` (Soroban SEP-41)
- **Liquid Vault ID**: `[INSERT_FULL_VAULT_ID_HERE]` (Inter-contract logic)
- **Network**: Stellar Testnet (`Test SDF Network ; September 2015`)
- **Bridge Architecture**: Ultra-Hardened Server-Side Submission (Defense-in-Depth)

---

## 📜 Soroban Smart Contracts

The project includes production-ready Soroban smart contracts located in the `/contracts` directory:

### 1. Liquid Token (`/contracts/liquid_token`)
A custom **SEP-41 compliant** token contract that manages the protocol's native GKT liquidity.
- **Features**: Decentralized minting, administrative controls, and optimized storage patterns.

### 2. Liquid Vault (`/contracts/liquid_vault`)
A high-level execution layer that handles inter-contract calls for secure asset management.
- **Logic**: Implements secure `transfer` and `deposit` patterns by communicating directly with the `liquid_token` contract.

---


---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Blockchain**: Stellar Network (Stellar SDK v12+)
- **Wallet**: freighter-api (Stellar Wallet Integration)
- **Styling**: Tailwind CSS + Framer Motion (Glassmorphism)
- **Database**: MongoDB (Local analytics & caching)

---

## 🚀 Getting Started

1. **Clone the repo**:
   ```bash
   git clone https://github.com/parth1241/liquidswap.git
   ```
2. **Setup environment**:
   Copy `.env.local.example` to `.env.local` and add your Stellar Secret Keys.
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Run development**:
   ```bash
   npm run dev
   ```

---

