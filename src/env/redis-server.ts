import 'server-only'
import { z } from 'zod'

const envSchema = z.object({
	REDIS_URL: z.string().url(),
	REDIS_TOKEN: z.string().min(1),
})

export const env = envSchema.parse(process.env)
