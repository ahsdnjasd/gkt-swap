const { Asset, getLiquidityPoolId } = require('@stellar/stellar-sdk');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local to avoid dependency issues
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const issuerMatch = envContent.match(/NEXT_PUBLIC_LQID_ISSUER=(.*)/);
const issuer = issuerMatch ? issuerMatch[1].trim() : null;

if (!issuer) {
  console.error('Error: NEXT_PUBLIC_LQID_ISSUER not found in .env.local');
  process.exit(1);
}

// 1. Define assets
const assetA = Asset.native();
const assetB = new Asset('LQID', issuer);

// 2. Sort assets lexicographically (required by Stellar)
const assets = Asset.compare(assetA, assetB) <= 0 ? [assetA, assetB] : [assetB, assetA];

// 3. Get the Pool ID using v12 SDK function
const poolIdBuffer = getLiquidityPoolId('constant_product', {
  assetA: assets[0],
  assetB: assets[1],
  fee: 30
});
const poolId = poolIdBuffer.toString('hex');

console.log('--- Stellar Liquidity Pool Configuration ---');
console.log(`Asset A: ${assets[0].toString()}`);
console.log(`Asset B: ${assets[1].toString()}`);
console.log(`Fee: 0.30% (30 bps)`);
console.log('-------------------------------------------');
console.log(`\nYOUR POOL ID:\n${poolId}\n`);
console.log('Copy this ID into your Admin panel or .env.local file.');
