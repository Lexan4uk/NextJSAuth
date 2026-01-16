import { OAuthProvider } from '@prisma/client'
import crypto from 'crypto'
import { cookies } from 'next/headers'
import 'server-only'
import { createDiscordOAuthClient } from './discord'
import { createGithubOAuthClient } from './github'
const STATE_COOKIE_KEY = 'oAuthState'
const SESSION_EXPIRATION_SECONDS = 60 * 10
const CODE_VERIFIER_COOKIE_KEY = 'oAuthCodeVerifier'
type CookieStore = Awaited<ReturnType<typeof cookies>>
interface ITokenSchema {
	access_token: string
	token_type: string
}
export interface OAuthUserInfo<T> {
	parser: (user: unknown) => T
}

export class OAuthClient<T> {
	private readonly provider: OAuthProvider
	private readonly clientId: string
	private readonly clientSecret: string
	private readonly scopes: string[]
	private readonly urls: {
		auth: string
		token: string
		user: string
	}
	private readonly userInfo: OAuthUserInfo<T>

	constructor({
		provider,
		clientId,
		clientSecret,
		scopes,
		urls,
		userInfo,
	}: {
		provider: OAuthProvider
		clientId: string
		clientSecret: string
		scopes: string[]
		urls: {
			auth: string
			token: string
			user: string
		}
		userInfo: OAuthUserInfo<T>
	}) {
		this.provider = provider
		this.clientId = clientId
		this.clientSecret = clientSecret
		this.scopes = scopes
		this.urls = urls
		this.userInfo = userInfo
	}

	private get redirectUrl() {
		return new URL(this.provider, process.env.OAUTH_REDIRECT_URL_BASE)
	}

	createAuthUrl(cookies: Pick<CookieStore, 'set'>) {
		const state = createState(cookies)
		const codeVerifier = createCodeVerifier(cookies)
		const url = new URL(this.urls.auth)
		url.searchParams.set('client_id', this.clientId)
		url.searchParams.set('redirect_uri', this.redirectUrl.toString())
		url.searchParams.set('response_type', 'code')
		url.searchParams.set('scope', this.scopes.join(' '))
		url.searchParams.set('state', state)
		url.searchParams.set('code_challenge_method', 'S256')
		url.searchParams.set(
			'code_challenge',
			crypto.hash('sha256', codeVerifier, 'base64url')
		)
		return url.toString()
	}
	private fetchToken(code: string, codeVerifier: string) {
		return fetch(this.urls.token, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				Accept: 'application/json',
			},
			body: new URLSearchParams({
				code,
				redirect_uri: this.redirectUrl.toString(),
				grant_type: 'authorization_code',
				client_id: this.clientId,
				client_secret: this.clientSecret,
				code_verifier: codeVerifier,
			}),
		})
			.then(res => res.json())
			.then(rawData => {
				if (
					!rawData ||
					typeof rawData.access_token !== 'string' ||
					typeof rawData.token_type !== 'string'
				) {
					throw new Error(
						'Неверные данные токена доступа oAuth либо неверный codeVerifier'
					)
				}
				const data: ITokenSchema = rawData

				return {
					accessToken: data.access_token,
					tokenType: data.token_type,
				}
			})
	}
	async fetchUser(
		code: string,
		state: string,
		cookies: Pick<CookieStore, 'get'>
	) {
		const isValidState = await validateState(state, cookies)
		if (!isValidState) throw new Error('Ошибка проверки state')
		const { accessToken, tokenType } = await this.fetchToken(
			code,
			getCodeVerifier(cookies)
		)
		const rawUser = await fetch(this.urls.user, {
			headers: {
				Authorization: `${tokenType} ${accessToken}`,
				Accept: 'application/json',
				'User-Agent': 'your-app-name',
			},
		}).then(res => res.json())
		return this.userInfo.parser(rawUser)
	}
}
function createState(cookies: Pick<CookieStore, 'set'>) {
	const state = crypto.randomBytes(64).toString('hex').normalize()
	cookies.set(STATE_COOKIE_KEY, state, {
		secure: true,
		httpOnly: true,
		sameSite: 'lax',
		expires: Date.now() + SESSION_EXPIRATION_SECONDS * 1000,
	})
	return state
}
function validateState(state: string, cookies: Pick<CookieStore, 'get'>) {
	const cookieState = cookies.get(STATE_COOKIE_KEY)?.value
	return cookieState === state
}
function createCodeVerifier(cookies: Pick<CookieStore, 'set'>) {
	const codeVerifier = crypto.randomBytes(64).toString('hex').normalize()
	cookies.set(CODE_VERIFIER_COOKIE_KEY, codeVerifier, {
		secure: true,
		httpOnly: true,
		sameSite: 'lax',
		expires: Date.now() + SESSION_EXPIRATION_SECONDS * 1000,
	})
	return codeVerifier
}
function getCodeVerifier(cookies: Pick<CookieStore, 'get'>) {
	const codeVerifier = cookies.get(CODE_VERIFIER_COOKIE_KEY)?.value
	if (!codeVerifier) throw new Error('Ошибка проверки code_challenge')
	return codeVerifier
}
export function getOAuthClient(provider: OAuthProvider) {
	switch (provider) {
		case 'discord':
			return createDiscordOAuthClient()
		case 'github':
			return createGithubOAuthClient()
		default:
			throw new Error(`Invalid provider ${provider satisfies never}`)
	}
}
