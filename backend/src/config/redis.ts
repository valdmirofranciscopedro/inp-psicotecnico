// src/config/redis.ts
import IORedis from 'ioredis'
import { env } from './env'

export const redis = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null, // necessário para BullMQ
})

redis.on('connect', () => console.log('✅ Redis conectado'))
redis.on('error', (err) => console.error('❌ Redis erro:', err))
