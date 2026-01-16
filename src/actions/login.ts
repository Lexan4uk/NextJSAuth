'use server'
import { IRegisterForm } from '@/app/components/RegisterForm'
import { prisma } from '@/lib/prisma'
import { comparePasswords } from '@/scripts/hashPassword'
import { createUserSession, IUserSession } from '@/scripts/session'
import { TServerFieldError } from '@/types/globalTypes'
import { cookies } from 'next/headers'

export async function loginUser(data: {
	email: string
	password: string
}): Promise<TServerFieldError<IRegisterForm>> {
	const userExist = await prisma.user.findFirst({
		where: { email: data.email },
	})
	if (!userExist) {
		return {
			ok: false,
			field: 'email',
			error: {
				type: 'server',
				message: 'Такого пользователя нет!',
			},
		}
	}
	if (!userExist.password || !userExist.salt)
		return {
			ok: false,
			field: 'email',
			error: {
				type: 'server',
				message: 'Пользователь с таким email зарегистророван через OAuth!',
			},
		}
	const isPasswordCorrect: boolean = await comparePasswords({
		hashedPassword: userExist.password,
		password: data.password,
		salt: userExist.salt,
	})
	if (!isPasswordCorrect)
		return {
			ok: false,
			field: 'password',
			error: {
				type: 'server',
				message: 'Неверный пароль!',
			},
		}
	//типизпция почему-то не работает адекватно, можно в createUserSession передать всего userExist и ошибок не будет
	const userForSession: IUserSession = {
		id: userExist.id,
		role: userExist.role,
	}
	await createUserSession(userForSession, await cookies())

	return { ok: true }
}
