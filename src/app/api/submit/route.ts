import { NextResponse } from 'next/server';
import { Horizon, Transaction, Networks } from '@stellar/stellar-sdk';

const HORIZON_URL = 'https://horizon-testnet.stellar.org';
const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015';
const server = new Horizon.Server(HORIZON_URL);

/**
 * Defense in Depth Submission Bridge.
 * Performs server-side validation and detailed diagnostic logging.
 */
export async function POST(req: Request) {
  let rawXdr = '';
  try {
    const { signedXDR } = await req.json();
    rawXdr = (signedXDR || '').replace(/\s/g, '').trim();

    if (!rawXdr) {
      return NextResponse.json({ error: 'Missing signedXDR' }, { status: 400 });
    }

    // DIAGNOSTIC LOGGING (Viewable in your terminal)
    console.log('\n--- BRIDGE SUBMISSION START ---');
    console.log('TIMESTAMP:', new Date().toISOString());
    console.log('XDR LENGTH:', rawXdr.length);
    console.log('XDR START:', rawXdr.substring(0, 50));
    console.log('XDR END:', rawXdr.substring(rawXdr.length - 50));
    
    // STEP 1: VALIDATE ENVELOPE (Bypasses browser-side serialization bugs)
    let transaction: Transaction;
    try {
      transaction = new Transaction(rawXdr, NETWORK_PASSPHRASE);
    } catch (validationError: any) {
      console.error('XDR VALIDATION FAILED:', validationError.message);
      return NextResponse.json({ 
        error: `Invalid Transaction Envelope: ${validationError.message}. This suggests the data was corrupted before reaching the server.` 
      }, { status: 400 });
    }

    // STEP 2: SUBMIT TO HORIZON
    console.log('XDR Validated. Submitting to Horizon Testnet...');
    const result = await server.submitTransaction(transaction);

    console.log('SUBMISSION SUCCESS! Hash:', result.hash);
    console.log('--- BRIDGE SUBMISSION END ---\n');

    return NextResponse.json({ 
      success: true, 
      txHash: result.hash 
    });

  } catch (error: any) {
    console.error('BRIDGE CRITICAL FAILURE:', error);
    
    // Extract Horizon-specific result codes
    const resultCodes = error?.response?.data?.extras?.result_codes;
    const detail = resultCodes?.operations?.[0] || resultCodes?.transaction || error?.message || 'Unknown Network Error';
    
    if (detail.includes('switch') || detail.includes('is not a function')) {
      return NextResponse.json({ 
        error: `Deep Serialization Error (e.switch) at Server Level. Please check your .env.local character counts.` 
      }, { status: 500 });
    }

    return NextResponse.json({ error: detail }, { status: 500 });
  }
}
