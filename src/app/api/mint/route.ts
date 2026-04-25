// /Users/parthkaran/Documents/claude_projects/liquidswap/src/app/api/mint/route.ts
import { NextResponse } from 'next/server';
import {
  Asset,
  Horizon,
  TransactionBuilder,
  Operation,
  Keypair,
  StrKey,
} from '@stellar/stellar-sdk';

const HORIZON_URL = 'https://horizon-testnet.stellar.org';
const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015';
const server = new Horizon.Server(HORIZON_URL);

function sanitize(val: string | undefined): string {
  if (!val) return '';
  return val.trim().replace(/[\u200B-\u200D\uFEFF]/g, "");
}

/**
 * Server-side mint endpoint.
 * Signs and submits a Payment from the Issuer account to the target address.
 * This runs on the server so we can use STELLAR_ISSUER_SECRET safely.
 */
export async function POST(req: Request) {
  try {
    const adminKey = req.headers.get('x-admin-key');
    if (adminKey !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { targetAddress, amount } = await req.json();

    if (!targetAddress || !amount) {
      return NextResponse.json({ error: 'Missing targetAddress or amount' }, { status: 400 });
    }

    const issuerSecret = sanitize(process.env.STELLAR_ISSUER_SECRET);
    if (!issuerSecret || !StrKey.isValidEd25519SecretSeed(issuerSecret) || issuerSecret === 'SAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA') {
      return NextResponse.json({ 
        error: 'STELLAR_ISSUER_SECRET is invalid or not configured. Check your .env.local and RESTART the server.' 
      }, { status: 500 });
    }

    const issuerKeypair = Keypair.fromSecret(issuerSecret);
    const issuerPublicKey = issuerKeypair.publicKey();
    
    // Explicitly construct the asset to ensure validity
    const gktAsset = new Asset('GKT', issuerPublicKey);

    // Load the issuer account
    const issuerAccount = await server.loadAccount(issuerPublicKey);

    // Get fee
    const feeStats = await server.feeStats();
    const fee = feeStats.fee_charged.min.toString();

    // Build the mint transaction
    const transaction = new TransactionBuilder(issuerAccount, {
      fee,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        Operation.payment({
          destination: targetAddress,
          asset: gktAsset,
          amount: parseFloat(amount).toFixed(7),
        })
      )
      .setTimeout(60)
      .build();

    // Sign with issuer secret key (server-side)
    transaction.sign(issuerKeypair);

    // Submit
    const result = await server.submitTransaction(transaction);

    return NextResponse.json({ 
      success: true, 
      txHash: result.hash,
      amount: amount,
      message: `Successfully minted ${amount} GKT to ${targetAddress}`
    });
  } catch (error: any) {
    console.error('Server Minting Error:', error);
    
    // Extract detailed result codes
    const codes = error?.response?.data?.extras?.result_codes;
    const detail = codes?.operations?.[0] 
      || codes?.transaction
      || error?.message 
      || 'Unknown error';
    
    return NextResponse.json({ 
      error: `Mint failed: ${detail}${codes ? ` (Network Code: ${JSON.stringify(codes)})` : ''}` 
    }, { status: 500 });
  }
}
