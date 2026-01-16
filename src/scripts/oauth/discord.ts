import { IFetchedUser } from '@/app/api/oauth/[provider]/route'
import { OAuthClient } from './base'

interface IDiscordUserRaw {
	id: string
	username: string
	global_name: string | null
	email: string
}

export function createDiscordOAuthClient() {
	if (!process.env.DISCORD_CLIENT_ID)
		throw new Error('Задайте DISCORD_CLIENT_ID в .env')
	if (!process.env.DISCORD_CLIENT_SECRET)
		throw new Error('Задайте DISCORD_CLIENT_SECRET в .env')
	return new OAuthClient({
		provider: 'discord',
		clientId: process.env.DISCORD_CLIENT_ID,
		clientSecret: process.env.DISCORD_CLIENT_SECRET,
		scopes: ['identify', 'email'],
		urls: {
			auth: 'https://discord.com/oauth2/authorize',
			token: 'https://discord.com/api/oauth2/token',
			user: 'https://discord.com/api/users/@me',
		},
		userInfo: {
			parser: (user: unknown): IFetchedUser => {
				const u = user as IDiscordUserRaw

				return {
					id: u.id,
					name: u.global_name ?? u.username,
					email: u.email,
				}
			},
		},
	})
}
