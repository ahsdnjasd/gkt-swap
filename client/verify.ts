import { SwapService, SwapData } from './swapService';
import { xdr, Address } from '@stellar/stellar-sdk';

async function run() {
    // Mock data based on the Rust struct: { user, amount_in, amount_out }
    const mockAddress = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";
    
    // Create a map that matches our Rust struct for SwapEvent
    // struct SwapEvent { user: Address, amount_in: i128, amount_out: i128 }
    const mockEvent = xdr.ScVal.scvMap([
        new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol("amount_in"),
            val: xdr.ScVal.scvI128(new xdr.Int128Parts({ lo: 100 as any, hi: 0 as any }))
        }),
        new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol("amount_out"),
            val: xdr.ScVal.scvI128(new xdr.Int128Parts({ lo: 90 as any, hi: 0 as any }))
        }),
        new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol("user"),
            val: Address.fromString(mockAddress).toScVal()
        })
    ]);

    const base64Xdr = mockEvent.toXDR("base64");
    console.log("Mock XDR:", base64Xdr);

    const service = new SwapService();
    
    // Use any to access private method for testing
    const parsed = (service as any).parseSwapEvent(base64Xdr, 12345) as SwapData;

    console.log("Parsed Swap Data:", JSON.stringify(parsed, (k, v) => typeof v === 'bigint' ? v.toString() : v, 2));

    if (parsed && parsed.amountIn === 100n && parsed.amountOut === 90n && parsed.user === mockAddress) {
        console.log("✅ Verification Successful: XDR Parsing logic works correctly.");
    } else {
        console.error("❌ Verification Failed: Data mismatch.");
        process.exit(1);
    }

    const price = SwapService.calculatePrice(parsed);
    console.log("Calculated Price:", price);
    if (price === 0.9) {
        console.log("✅ Verification Successful: Price calculation works correctly.");
    } else {
        console.error("❌ Verification Failed: Price mismatch.");
        process.exit(1);
    }
}

run();
