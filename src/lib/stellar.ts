import {
  Asset,
  Horizon,
  TransactionBuilder,
  Operation,
  Networks,
  Keypair,
  getLiquidityPoolId,
  LiquidityPoolFeeV18,
  StrKey,
  LiquidityPoolAsset,
  Transaction,
} from '@stellar/stellar-sdk';
import { AccountAssets } from '@/types';

/**
 * Ultra-aggressive sanitizer: removes all whitespace, hidden characters, 
 * and non-alphanumeric junk.
 */
export function sanitize(val: string | undefined): string {
  if (!val) return '';
  return val.trim().replace(/[^A-Z0-9]/gi, "").replace(/[\u200B-\u200D\uFEFF]/g, "");
}

// ASSET HELPERS
export const getGktAsset = () => {
  const issuer = sanitize(process.env.NEXT_PUBLIC_GKT_ISSUER || 'GBPIJUJONMC53VKN6XRCSXK4XT4X5QSMNFMIRB4WYJKFYV4T3QD6ZD4Z');
  return new Asset('GKT', issuer);
};

export const getLpoolAsset = () => {
  return new LiquidityPoolAsset(Asset.native(), getGktAsset(), LiquidityPoolFeeV18);
};

// GLOBAL NETWORK CONFIG - HARDCODED TESTNET
export const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015';
export const HORIZON_URL = 'https://horizon-testnet.stellar.org';
export const server = new Horizon.Server(HORIZON_URL);

/**
 * Deterministically computes the Liquidity Pool ID for XLM/GKT.
 */
export function getCurrentPoolId(): string {
  const assetA = Asset.native();
  const assetB = getGktAsset();
  const [first, second] = [assetA, assetB].sort((a, b) => {
    if (a.isNative()) return -1;
    if (b.isNative()) return 1;
    return a.getCode().localeCompare(b.getCode());
  });
  return getLiquidityPoolId('constant_product', {
    assetA: first,
    assetB: second,
    fee: LiquidityPoolFeeV18,
  }).toString('hex');
}

/**
 * Checks if a Liquidity Pool exists on Stellar.
 */
export async function checkPoolExists(poolId: string): Promise<boolean> {
  try {
    await server.liquidityPools().liquidityPoolId(poolId).call();
    return true;
  } catch {
    return false;
  }
}

/**
 * Fetches pool reserves and shares from Horizon.
 */
export async function getPoolInfo(poolId: string) {
  try {
    const pool = await server.liquidityPools().liquidityPoolId(poolId).call();
    const reserves = pool.reserves;
    const xlmRes = reserves.find(r => r.asset === 'native');
    const gktRes = reserves.find(r => r.asset.includes('GKT'));
    
    return {
      xlmReserve: parseFloat(xlmRes?.amount || '0'),
      gktReserve: parseFloat(gktRes?.amount || '0'),
      totalShares: parseFloat(pool.total_shares),
    };
  } catch (error) {
    return { xlmReserve: 0, gktReserve: 0, totalShares: 0 };
  }
}

/**
 * Fetches all relevant balances for an account.
 */
export async function getAccountAssets(userPublicKey: string): Promise<AccountAssets> {
  try {
    const account = await server.loadAccount(userPublicKey);
    const balances = account.balances;

    const xlm = parseFloat(balances.find((b: any) => b.asset_type === 'native')?.balance || '0');
    
    const gktEntry = balances.find(
      (b: any) => b.asset_code === 'GKT' && b.asset_issuer === process.env.NEXT_PUBLIC_GKT_ISSUER
    );
    const gkt = parseFloat(gktEntry?.balance || '0');
    const hasGktTrust = !!gktEntry;

    const poolId = getCurrentPoolId();
    const lpoolEntry = balances.find(
      (b: any) => b.asset_type === 'liquidity_pool_shares' && b.liquidity_pool_id === poolId
    );
    const lpool = parseFloat(lpoolEntry?.balance || '0');
    const hasLpoolTrust = !!lpoolEntry;

    return { xlm, gkt, lpool, hasGktTrust, hasLpoolTrust };
  } catch {
    return { xlm: 0, gkt: 0, lpool: 0, hasGktTrust: false, hasLpoolTrust: false };
  }
}

/**
 * Network Fee Helper
 */
export async function getNetworkFee(): Promise<string> {
  try {
    const feeStats = await server.feeStats();
    return feeStats.fee_charged.min.toString();
  } catch {
    return '1000'; // Fallback
  }
}

/**
 * BUILDERS - ALL HARDCODED TO TESTNET
 */
export async function createTrustlineXDR(userPublicKey: string, asset: 'GKT' | 'LPOOL'): Promise<string> {
  const account = await server.loadAccount(userPublicKey);
  const targetAsset = asset === 'GKT' ? getGktAsset() : getLpoolAsset();

  const transaction = new TransactionBuilder(account, {
    fee: await getNetworkFee(),
    networkPassphrase: 'Test SDF Network ; September 2015',
  })
    .addOperation(Operation.changeTrust({ asset: targetAsset, limit: '922337203685' }))
    .setTimeout(60);

  const tx = transaction.build();
  console.log('CRITICAL: Building Trustline for Network:', tx.networkPassphrase);
  return tx.toXDR();
}

export async function buildSwapXDR(userPublicKey: string, fromToken: 'XLM' | 'GKT', toAmount: string, maxSend: string): Promise<string> {
  const account = await server.loadAccount(userPublicKey);
  const sendAsset = fromToken === 'XLM' ? Asset.native() : getGktAsset();
  const destAsset = fromToken === 'XLM' ? getGktAsset() : Asset.native();

  const transaction = new TransactionBuilder(account, {
    fee: await getNetworkFee(),
    networkPassphrase: 'Test SDF Network ; September 2015',
  })
    .addOperation(Operation.pathPaymentStrictReceive({
      sendAsset,
      sendMax: maxSend,
      destination: userPublicKey,
      destAsset,
      destAmount: toAmount,
      path: [],
    }))
    .setTimeout(60);

  return transaction.build().toXDR();
}

export async function buildAddLiquidityXDR(userPublicKey: string, xlmAmount: string, gktAmount: string, minPrice: string, maxPrice: string): Promise<string> {
  const account = await server.loadAccount(userPublicKey);
  const poolId = getCurrentPoolId();

  const transaction = new TransactionBuilder(account, {
    fee: await getNetworkFee(),
    networkPassphrase: 'Test SDF Network ; September 2015',
  })
    .addOperation(Operation.changeTrust({ asset: getLpoolAsset(), limit: '1000000' }))
    .addOperation(Operation.liquidityPoolDeposit({
      liquidityPoolId: poolId,
      maxAmountA: xlmAmount,
      maxAmountB: gktAmount,
      minPrice,
      maxPrice,
    }))
    .setTimeout(60);

  return transaction.build().toXDR();
}

export async function buildRemoveLiquidityXDR(userPublicKey: string, lpShares: string, minXLM: string, minGKT: string): Promise<string> {
  const account = await server.loadAccount(userPublicKey);
  const poolId = getCurrentPoolId();

  const transaction = new TransactionBuilder(account, {
    fee: await getNetworkFee(),
    networkPassphrase: 'Test SDF Network ; September 2015',
  })
    .addOperation(Operation.liquidityPoolWithdraw({
      liquidityPoolId: poolId,
      amount: lpShares,
      minAmountA: minXLM,
      minAmountB: minGKT,
    }))
    .setTimeout(60);

  return transaction.build().toXDR();
}

/**
 * Verifies a transaction hash on-chain.
 */
export async function verifySwapTx(txHash: string): Promise<{ valid: boolean }> {
  try {
    const tx = await server.transactions().transaction(txHash).call();
    return { valid: !!tx && tx.successful };
  } catch {
    return { valid: false };
  }
}

/**
 * SUBMISSION BRIDGE
 */
export async function submitSignedXDR(xdrInput: any): Promise<string> {
  if (!xdrInput) throw new Error('Transaction was cancelled or no signature was provided.');
  
  try {
    // FREIGHTER COMPATIBILITY: Exhaustive search for XDR in wallet response
    let signedXDR = typeof xdrInput === 'string' ? xdrInput : (
      xdrInput.signedTxXdr || 
      xdrInput.signedTransaction || 
      xdrInput.signedXDR || 
      xdrInput.signedXdr || 
      xdrInput.xdr || 
      xdrInput.envelope
    );
    
    if (!signedXDR || typeof signedXDR !== 'string') {
      console.error('DEBUG: Wallet Response Structure:', JSON.stringify(xdrInput));
      throw new Error(`The wallet returned a format we didn't expect. See console for details.`);
    }

    // AGGRESSIVE SCRUBBING (Remove all whitespace/newlines before sending)
    const scrubbedXDR = signedXDR.replace(/\s/g, '').trim();

    const response = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signedXDR: scrubbedXDR }),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Server submission failed');
    return result.txHash;
  } catch (error: any) {
    throw new Error(error.message || 'Network error during submission');
  }
}
