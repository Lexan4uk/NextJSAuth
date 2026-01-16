import { IFetchedUser } from '@/app/api/oauth/[provider]/route'
import { prisma } from '@/lib/prisma'
import { OAuthProvider } from '@prisma/client'

export async function connectUserToAccount(
	fetchedUser: IFetchedUser,
	provider: OAuthProvider
) {
	//console.log(fetchedUser)
	const { id: providerAccountId, email, name } = fetchedUser

	const user = await prisma.$transaction(async prismaTx => {
		let user = await prismaTx.user.findUnique({
			where: { email },
			select: { id: true, role: true },
		})

		if (!user) {
			user = await prismaTx.user.create({
				data: { email, name },
				select: { id: true, role: true },
			})
		}

		await prismaTx.userOAuthAccount.upsert({
			where: {
				providerAccountId_provider: {
					provider,
					providerAccountId,
				},
			},
			create: {
				provider,
				providerAccountId,
				userId: user.id,
			},
			update: {}, // onConflictDoNothing
		})

		return user
	})

	return user
}
