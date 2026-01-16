'use server'
import { IRegisterForm } from '@/app/components/RegisterForm'
import { prisma } from '@/lib/prisma'
import { generateSalt, hashPassword } from '@/scripts/hashPassword'
import { createUserSession } from '@/scripts/session'
import { TServerFieldError } from '@/types/globalTypes'
import { cookies } from 'next/headers'
import { toast } from 'sonner'

export async function registerUser(data: {
	email: string
	password: string
}): Promise<TServerFieldError<IRegisterForm>> {
	const userAlreadyExist = await prisma.user.findFirst({
		where: { email: data.email },
	})
	if (userAlreadyExist) {
		return {
			ok: false,
			field: 'confPassword',
			error: {
				type: 'server',
				message: 'Пользователь с таким email уже существует',
			},
		}
	}
	const salt = await generateSalt()
	const hashedPassword = await hashPassword(data.password, salt)
	const newUser = await prisma.user.create({
		data: {
			email: data.email,
			password: hashedPassword,
			salt: salt,
		},
	})
	if (!newUser) {
		toast.error('Ошибка при создании пользователя')
		return { ok: true }
	}
	const userForSession = {
		id: newUser.id,
		role: newUser.role,
	}
	await createUserSession(userForSession, await cookies())

	return { ok: true }
}
