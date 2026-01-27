import { getRedisClient } from './client'

const DEFAULT_TTL = parseInt(process.env.REDIS_TTL || '86400', 10) // Default 24 hours

export async function getCachedData<T>(key: string): Promise<T | null> {
  const redis = getRedisClient()
  if (!redis) return null

  try {
    const cached = await redis.get(key)
    if (cached) {
      return JSON.parse(cached) as T
    }
  } catch (error) {
    console.error(`Redis get error for key ${key}:`, error)
  }

  return null
}

export async function setCachedData<T>(
  key: string,
  data: T,
  ttl: number = DEFAULT_TTL,
): Promise<void> {
  const redis = getRedisClient()
  if (!redis) return

  try {
    await redis.setex(key, ttl, JSON.stringify(data))
  } catch (error) {
    console.error(`Redis set error for key ${key}:`, error)
  }
}
