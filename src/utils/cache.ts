type CacheEntry<T> = {
  expiresAt: number;
  value: T;
};

const store = new Map<string, CacheEntry<unknown>>();

export const remember = async <T>(
  key: string,
  ttlMs: number,
  resolver: () => Promise<T>
) => {
  const now = Date.now();
  const cached = store.get(key) as CacheEntry<T> | undefined;

  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  const value = await resolver();
  store.set(key, {
    value,
    expiresAt: now + ttlMs,
  });

  return value;
};

export const invalidateCache = (key: string) => {
  store.delete(key);
};

export const invalidateCacheByPrefix = (prefix: string) => {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) {
      store.delete(key);
    }
  }
};
