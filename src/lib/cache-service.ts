export interface CacheEntry<T> { 
  value: T; 
  expiresAt: number; 
}

export class CacheService<T> {
  private store = new Map<string, CacheEntry<T>>();
  private ttl: number;
  
  constructor(ttlMs = 8000) { 
    this.ttl = ttlMs; 
  }
  
  async get(key: string, fetcher: () => Promise<{ value: T; latencyMs: number }>): Promise<{ value: T; source: 'cache' | 'db'; latencyMs: number }> {
    const entry = this.store.get(key);
    if (entry && Date.now() < entry.expiresAt) {
      return { value: entry.value, source: 'cache', latencyMs: Math.floor(Math.random() * 5) + 1 };
    }
    const result = await fetcher();
    this.store.set(key, { value: result.value, expiresAt: Date.now() + this.ttl });
    return { value: result.value, source: 'db', latencyMs: result.latencyMs };
  }
  
  invalidate() { 
    this.store.clear(); 
  }
  
  size() { 
    return this.store.size; 
  }
}
