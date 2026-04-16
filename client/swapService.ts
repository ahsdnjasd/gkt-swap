import {
  SorobanRpc,
  scValToNative,
} from "@stellar/stellar-sdk";
import * as StellarBase from "@stellar/stellar-sdk";
const { xdr } = StellarBase;

export interface SwapData {
  user: string;
  amountIn: bigint;
  amountOut: bigint;
  ledger: number;
}

export class SwapService {
  private rpc: SorobanRpc.Server;
  private lastLedger: number = 0;
  private isStreaming: boolean = false;

  constructor(rpcUrl: string = "https://soroban-testnet.stellar.org") {
    this.rpc = new SorobanRpc.Server(rpcUrl);
  }

  /**
   * Helper to parse the SwapEvent from XDR value.
   * Internal Rust structure was: 
   * struct SwapEvent { user: Address, amount_in: i128, amount_out: i128 }
   */
  private parseSwapEvent(eventXdr: string, ledger: number): SwapData | null {
    try {
      const scVal = xdr.ScVal.fromXDR(eventXdr, "base64");
      const native: any = scValToNative(scVal);

      // Verify the native object has the expected fields
      if (!native || typeof native.amount_in === "undefined") {
        return null;
      }

      return {
        user: native.user, 
        amountIn: BigInt(native.amount_in.toString()),
        amountOut: BigInt(native.amount_out.toString()),
        ledger,
      };
    } catch (e) {
      console.error("Failed to parse swap event XDR:", e);
      return null;
    }
  }

  /**
   * Stream swap events from the contract.
   * @param contractId The contract ID to monitor
   * @param onSwap Callback triggered when a new swap is detected
   */
  public async streamSwaps(
    contractId: string,
    onSwap: (swap: SwapData) => void
  ) {
    if (this.isStreaming) return;
    this.isStreaming = true;

    // Get latest ledger to start from
    const latestLedgerRes = await this.rpc.getLatestLedger();
    this.lastLedger = latestLedgerRes.sequence;

    console.log(`Starting swap stream for ${contractId} from ledger ${this.lastLedger}`);

    const poll = async () => {
      if (!this.isStreaming) return;

      try {
        const eventsResponse = await this.rpc.getEvents({
          startLedger: this.lastLedger + 1,
          filters: [
            {
              type: "contract",
              contractId: contractId,
              topics: [
                // In our contract we used (symbol_short!("swap"),)
                ["swap"] 
              ],
            },
          ],
        });

        for (const event of eventsResponse.events) {
          const swap = this.parseSwapEvent(event.value, event.ledger);
          if (swap) {
            onSwap(swap);
          }
          // Update last ledger to the latest we've seen
          if (event.ledger > this.lastLedger) {
            this.lastLedger = event.ledger;
          }
        }

        // If no events, we might still need to update lastLedger to latest known
        const currentLatest = await this.rpc.getLatestLedger();
        if (currentLatest.sequence > this.lastLedger) {
            this.lastLedger = currentLatest.sequence;
        }

      } catch (error) {
        console.error("Error polling for swap events:", error);
      }

      // Poll again in 5 seconds
      if (this.isStreaming) {
        setTimeout(poll, 5000);
      }
    };

    poll();
  }

  public stopStreaming() {
    this.isStreaming = false;
  }

  /**
   * Helper to calculate the current 'Price' based on a swap event.
   * Price = output / input (simplified)
   */
  public static calculatePrice(swap: SwapData): number {
    if (swap.amountIn === 0n) return 0;
    // Converting to Number for price representation (standard for UI/charts)
    return Number(swap.amountOut) / Number(swap.amountIn);
  }
}
