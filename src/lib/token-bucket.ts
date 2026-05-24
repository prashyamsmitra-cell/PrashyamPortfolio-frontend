export class TokenBucket {
  private tokens: number;
  private lastRefill: number;
  
  constructor(public capacity: number, public refillRate: number) {
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }
  
  refill() {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.refillRate);
    this.lastRefill = now;
  }
  
  allow(): boolean {
    this.refill();
    if (this.tokens >= 1) { 
      this.tokens -= 1; 
      return true; 
    }
    return false;
  }
  
  peek(): number { 
    this.refill(); 
    return Math.floor(this.tokens); 
  }
  
  reconfigure(capacity: number, refillRate: number) {
    this.capacity = capacity; 
    this.refillRate = refillRate;
    this.tokens = Math.min(this.tokens, capacity);
  }
}
