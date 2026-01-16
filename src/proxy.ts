import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies'
import { NextResponse, type NextRequest } from 'next/server'
import { updateUserSessionExpiration } from './scripts/session'

const privateRoutes = ['/user']

export async function proxy(request: NextRequest) {
	const response = (await proxyAuth(request)) ?? NextResponse.next()

	await updateUserSessionExpiration({
		set: (name: string, value: string, options?: Partial<ResponseCookie>) => {
			response.cookies.set(name, value, options)
			return response.cookies
		},
		get: (key: string) => request.cookies.get(key),
	})

	return response
}
export function proxyAuth(request: NextRequest) {
	const { pathname } = request.nextUrl
	const sessionId = request.cookies.get('session-id')?.value

	if (privateRoutes.some(route => pathname.startsWith(route))) {
		if (!sessionId) {
			return NextResponse.redirect(new URL('/', request.url))
		}
	}
}
