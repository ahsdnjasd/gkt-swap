// /Users/parthkaran/Documents/claude_projects/liquidswap/src/lib/cache.ts

class SimpleCache {
  private store: Map<string, { value: any; expiresAt: number }>;

  constructor() {
    this.store = new Map();
  }

  set(key: string, value: any, ttlSeconds: number): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.store.set(key, { value, expiresAt });
  }

  get(key: string): any | null {
    const item = this.store.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return item.value;
  }

  bust(key: string): void {
    this.store.delete(key);
  }

  bustAll(): void {
    this.store.clear();
  }
}

export const cache = new SimpleCache();
