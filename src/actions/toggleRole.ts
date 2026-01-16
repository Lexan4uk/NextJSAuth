'use server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/scripts/getCurrentUser'
import { updateUserSessionData } from '@/scripts/session'
import { UserRole } from '@prisma/client'
import { cookies } from 'next/headers'

export async function toggleRole() {
	const user = await getCurrentUser({
		redirectIfNotFound: true,
		withFullUser: false,
	})

	const updatedUser = await prisma.user.update({
		where: {
			id: user.id,
		},
		data: {
			role: user.role === UserRole.user ? UserRole.admin : UserRole.user,
		},
		select: {
			id: true,
			role: true,
		},
	})
	await updateUserSessionData(updatedUser, await cookies())
}
