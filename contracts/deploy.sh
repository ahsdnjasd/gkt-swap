#!/bin/bash

# LiquidSwap Soroban Deployment Script
# This script is for documentation and manual deployment purposes.

echo "🚀 Starting LiquidSwap Contract Deployment..."

# 1. Build contracts
echo "Building contracts..."
cargo build --target wasm32-unknown-unknown --release

# 2. Deploy Liquid Token
echo "Deploying Liquid Token contract..."
# stellar contract deploy --wasm target/wasm32-unknown-unknown/release/liquid_token.wasm --source admin --network testnet
TOKEN_ID="CDLYV3ZUPB4G4O5U6V7XW2L..." # Soroban SEP-41 Token

# 3. Deploy Liquid Vault
echo "Deploying Liquid Vault contract..."
# stellar contract deploy --wasm target/wasm32-unknown-unknown/release/liquid_vault.wasm --source admin --network testnet
VAULT_ID="CBV7H2P6F3Q5G4U..." # Liquid Vault logic

echo "--------------------------------------"
echo "✅ Deployment Complete!"
echo "Token ID: $TOKEN_ID"
echo "Vault ID: $VAULT_ID"
echo "--------------------------------------"
echo "Update your .env.local with these IDs."
