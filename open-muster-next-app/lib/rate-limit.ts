export interface RateLimitOptions {
  interval: number
  uniqueTokenPerInterval: number
}

export interface RateLimiter {
  check: (limit: number, token: string) => Promise<void>
}

export function rateLimit(options: RateLimitOptions): RateLimiter {
  const tokenCache = new Map()
  let lastIntervalStart = Date.now()

  return {
    check: (limit: number, token: string) => {
      const now = Date.now()
      if (now - lastIntervalStart >= options.interval) {
        lastIntervalStart = now
        tokenCache.clear()
      }

      if (!tokenCache.has(token)) {
        tokenCache.set(token, 0)
      }

      const tokenCount = tokenCache.get(token)
      if (tokenCount >= limit) {
        return Promise.reject(new Error("Rate limit exceeded"))
      }

      tokenCache.set(token, tokenCount + 1)
      return Promise.resolve()
    },
  }
}

