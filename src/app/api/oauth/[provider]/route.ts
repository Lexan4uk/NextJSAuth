import { connectUserToAccount } from '@/actions/connectUserToAccount'
import { getOAuthClient } from '@/scripts/oauth/base'
import { createUserSession } from '@/scripts/session'
import { OAuthProvider } from '@prisma/client'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
export interface IFetchedUser {
	id: string
	email: string
	name: string
}

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ provider: string }> }
) {
	const { provider: rawProvider } = await params
	const code = request.nextUrl.searchParams.get('code')
	const state = request.nextUrl.searchParams.get('state')

	const provider = rawProvider as OAuthProvider
	if (typeof code !== 'string' || typeof state !== 'string') {
		return NextResponse.redirect(new URL('/', request.url))
	}
	const cookieStore = await cookies()
	const oAuthClient = await getOAuthClient(provider)
	const oAuthUser = await oAuthClient.fetchUser(code, state, cookieStore)
	const user = await connectUserToAccount(oAuthUser, provider)

	await createUserSession(user, cookieStore)

	const response = NextResponse.redirect(new URL('/', request.url))

	cookieStore.getAll().forEach(cookie => {
		response.cookies.set(cookie)
	})

	return response
}
