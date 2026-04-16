const { SwapService } = require('./swapService');
const { xdr, Address, scValToNative } = require('@stellar/stellar-sdk');

// Mock data based on the Rust struct: { user, amount_in, amount_out }
// user: G..., amount_in: 100, amount_out: 90
const mockAddress = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";
const mockEvent = xdr.ScVal.scvMap([
    new xdr.ScMapEntry({
        key: xdr.ScVal.scvSymbol("amount_in"),
        val: xdr.ScVal.scvI128(new xdr.Int128Parts({ lo: 100n, hi: 0n }))
    }),
    new xdr.ScMapEntry({
        key: xdr.ScVal.scvSymbol("amount_out"),
        val: xdr.ScVal.scvI128(new xdr.Int128Parts({ lo: 90n, hi: 0n }))
    }),
    new xdr.ScMapEntry({
        key: xdr.ScVal.scvSymbol("user"),
        val: Address.fromString(mockAddress).toScVal()
    })
]);

const base64Xdr = mockEvent.toXDR("base64");

console.log("Mock XDR:", base64Xdr);

const service = new SwapService();
// We need to bypass private if we just want to test parsing
const parsed = service.parseSwapEvent(base64Xdr, 12345);

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
