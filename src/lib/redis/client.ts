import Redis, { Cluster } from 'ioredis'

let redisClient: Redis | Cluster | null = null

export function getRedisClient(): Redis | Cluster | null {
  // Check if Redis is configured
  if (!process.env.REDIS_HOSTS) {
    console.warn('REDIS_HOSTS not configured, Redis caching disabled')
    return null
  }

  if (!redisClient) {
    try {
      const isCluster = process.env.REDIS_CLUSTER?.toLowerCase() === 'true'
      const hosts = process.env.REDIS_HOSTS.split(',').map(host => host.trim())
      const port = parseInt(process.env.REDIS_PORT || '6379', 10)
      const password = process.env.REDIS_PASSWORD || undefined

      const commonOptions = {
        maxRetriesPerRequest: 3,
        retryStrategy(times: number) {
          const delay = Math.min(times * 50, 2000)
          return delay
        },
        reconnectOnError(err: Error) {
          const targetError = 'READONLY'
          if (err.message.includes(targetError)) {
            return true
          }
          return false
        },
      }

      if (isCluster) {
        // Redis Cluster configuration
        const clusterNodes = hosts.map(host => ({ host, port }))
        redisClient = new Cluster(clusterNodes, {
          redisOptions: {
            password,
            ...commonOptions,
          },
          clusterRetryStrategy(times: number) {
            const delay = Math.min(times * 50, 2000)
            return delay
          },
          // enableReadyCheck: true,
          // maxRedirections: 16,
          // scaleReads: 'slave',
        })

        redisClient.on('error', err => {
          console.error('Redis Cluster Error:', err)
        })

        redisClient.on('connect', () => {
          console.log('Redis Cluster Connected')
        })
      } else {
        // Standalone Redis configuration
        redisClient = new Redis({
          host: hosts[0],
          port,
          password,
          ...commonOptions,
        })

        redisClient.on('error', err => {
          console.error('Redis Client Error:', err)
        })

        redisClient.on('connect', () => {
          console.log('Redis Client Connected')
        })
      }
    } catch (error) {
      console.error('Failed to create Redis client:', error)
      return null
    }
  }

  return redisClient
}

// Helper to safely close Redis connection (useful for testing or cleanup)
export async function closeRedisConnection(): Promise<void> {
  if (redisClient) {
    await redisClient.quit()
    redisClient = null
  }
}
