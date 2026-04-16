// /Users/parthkaran/Documents/claude_projects/liquidswap/tests/cache.test.ts
import { cache } from '@/lib/cache';

describe('SimpleCache', () => {
  beforeEach(() => {
    cache.bustAll();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('set then get returns stored value', () => {
    cache.set('key', 'value', 60);
    expect(cache.get('key')).toBe('value');
  });

  test('get on missing key returns null', () => {
    expect(cache.get('nonexistent')).toBeNull();
  });

  test('bust removes key', () => {
    cache.set('key', 'value', 60);
    cache.bust('key');
    expect(cache.get('key')).toBeNull();
  });

  test('expired entry returns null', () => {
    cache.set('key', 'value', 0); // expire immediately
    jest.advanceTimersByTime(1);
    expect(cache.get('key')).toBeNull();
  });
});
