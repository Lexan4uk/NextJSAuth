import { redisClient } from '@/lib/redis'
import { UserRole } from '@prisma/client'
import crypto from 'crypto'
import { cookies } from 'next/headers'

const COOKIE_SESSION_KEY = 'session-id'
const SESSION_EXPIRATION_SECONDS = 60 * 60 * 24 * 7

type CookieStore = Awaited<ReturnType<typeof cookies>>
interface ISetCookie {
	sessionId: string
	cookies: Pick<CookieStore, 'set'>
}
export interface IUserSession {
	id: string
	role: UserRole
}

export function setCookie({ sessionId, cookies }: ISetCookie) {
	cookies.set(COOKIE_SESSION_KEY, sessionId, {
		secure: true,
		httpOnly: true,
		sameSite: 'lax',
		expires: Date.now() + SESSION_EXPIRATION_SECONDS * 1000,
	})
}

export async function createUserSession(
	user: IUserSession,
	cookies: Pick<CookieStore, 'set'>
) {
	const sessionId = crypto.randomBytes(512).toString('hex').normalize()
	await redisClient.set(`session:${sessionId}`, user, {
		ex: SESSION_EXPIRATION_SECONDS,
	})

	setCookie({ sessionId, cookies })
}

export function getUserFromSession(cookies: Pick<CookieStore, 'get'>) {
	const sessionId = cookies.get(COOKIE_SESSION_KEY)?.value
	if (!sessionId) return null
	return getUserSessionById(sessionId)
}
async function getUserSessionById(sessionId: string) {
	const rawUser: IUserSession | null = await redisClient.get(
		`session:${sessionId}`
	)
	return rawUser ? rawUser : null
}
export async function removeUserFromSession(
	cookies: Pick<CookieStore, 'get' | 'delete'>
) {
	const sessionId = cookies.get(COOKIE_SESSION_KEY)?.value
	if (!sessionId) return null
	await redisClient.del(`session:${sessionId}`)
	cookies.delete(COOKIE_SESSION_KEY)
}
export async function updateUserSessionData(
	user: IUserSession,
	cookies: Pick<CookieStore, 'set' | 'get'>
) {
	const sessionId = cookies.get(COOKIE_SESSION_KEY)?.value
	if (!sessionId) return null
	await redisClient.set(`session:${sessionId}`, user, {
		ex: SESSION_EXPIRATION_SECONDS,
	})
}

//вроде не работает
export async function updateUserSessionExpiration(
	cookies: Pick<CookieStore, 'get' | 'set'>
) {
	const sessionId = cookies.get(COOKIE_SESSION_KEY)?.value
	if (sessionId == null) return null

	const user = await getUserSessionById(sessionId)
	if (user == null) return

	await redisClient.set(`session:${sessionId}`, user, {
		ex: SESSION_EXPIRATION_SECONDS,
	})
	setCookie({ sessionId, cookies })
}
