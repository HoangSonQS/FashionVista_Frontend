type CacheEntry<T> = {
  expiresAt: number;
  promise?: Promise<T>;
  value?: T;
};

const cache = new Map<string, CacheEntry<unknown>>();

export const buildRequestCacheKey = (prefix: string, value?: unknown) => {
  if (value === undefined) {
    return prefix;
  }
  return `${prefix}:${JSON.stringify(value)}`;
};

export const cachedRequest = async <T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number,
): Promise<T> => {
  const now = Date.now();
  const entry = cache.get(key) as CacheEntry<T> | undefined;

  if (entry?.promise) {
    return entry.promise;
  }

  if (entry && entry.value !== undefined && entry.expiresAt > now) {
    return entry.value;
  }

  const promise = fetcher()
    .then((value) => {
      cache.set(key, {
        value,
        expiresAt: Date.now() + ttlMs,
      });
      return value;
    })
    .catch((error) => {
      cache.delete(key);
      throw error;
    });

  cache.set(key, {
    promise,
    expiresAt: now + ttlMs,
  });

  return promise;
};

export const setCachedRequestValue = <T>(key: string, value: T, ttlMs: number) => {
  cache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
};

export const clearCachedRequest = (key: string) => {
  cache.delete(key);
};

export const clearCachedRequestsByPrefix = (prefix: string) => {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
};
