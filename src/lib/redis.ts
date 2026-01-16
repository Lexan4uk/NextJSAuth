import { env } from '@/env/redis-server'
import { Redis } from '@upstash/redis'
import 'server-only'

export const redisClient = new Redis({
	url: env.REDIS_URL,
	token: env.REDIS_TOKEN,
})
