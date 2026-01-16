'use server'
import { getOAuthClient } from '@/scripts/oauth/base'
import { OAuthProvider } from '@prisma/client'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function oAuthSignIn(provider: OAuthProvider) {
	const oAuthClient = getOAuthClient(provider)
	redirect(oAuthClient.createAuthUrl(await cookies()))
}
