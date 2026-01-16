import { IFetchedUser } from '@/app/api/oauth/[provider]/route'
import { OAuthClient } from './base'
interface IGithubUserRaw {
	id: number
	login: string
	name: string | null
	email: string
}
interface IGithubEmail {
	email: string
	primary: boolean
	verified: boolean
	visibility: 'public' | null
}

export function createGithubOAuthClient() {
	if (!process.env.GITHUB_CLIENT_ID)
		throw new Error('Задайте GITHUB_CLIENT_ID в .env')
	if (!process.env.GITHUB_CLIENT_SECRET)
		throw new Error('Задайте GITHUB_CLIENT_SECRET в .env')

	return new OAuthClient({
		provider: 'github',
		clientId: process.env.GITHUB_CLIENT_ID,
		clientSecret: process.env.GITHUB_CLIENT_SECRET,
		scopes: ['user:email', 'read:user'],
		urls: {
			auth: 'https://github.com/login/oauth/authorize',
			token: 'https://github.com/login/oauth/access_token',
			user: 'https://api.github.com/user',
		},
		userInfo: {
			parser: (user: unknown): IFetchedUser => {
				const u = user as IGithubUserRaw

				return {
					id: u.id.toString(),
					name: u.name ?? u.login,
					email: u.email ?? 'Ваш Email в Github приватный',
				}
			},
		},
	})
}
