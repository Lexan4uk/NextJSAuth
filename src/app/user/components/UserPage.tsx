'use client'
import { logoutUser } from '@/actions/logout'
import { toggleRole } from '@/actions/toggleRole'
import { UserRole } from '@prisma/client'
import { redirect, useRouter } from 'next/navigation'

interface IUserPage {
	id: string
	name: string | null
	email: string
	role: UserRole
}

export default function UserPage({ user }: { user: IUserPage }) {
	const router = useRouter()

	const exitClick = async () => {
		await logoutUser()
		redirect('/')
	}
	const changeRoleClick = async () => {
		await toggleRole()
		router.refresh()
	}
	return (
		<main className='flex w-full h-dvh'>
			<div className='flex flex-col w-full h-full ml-2  bg-gray-200'>
				<div className='flex gap-2 mt-4'>Страница пользователя</div>
				<div className=''>ID: {user.id}</div>
				<div className=''>Email: {user.email}</div>
				<div className=''>Имя: {user.name}</div>
				<div className=''>Роль: {user.role}</div>
				<button
					onClick={() => changeRoleClick()}
					className='px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-900 transition-colors hover:cursor-pointer w-fit mt-2'
				>
					Пернключить роль
				</button>
				<button
					onClick={() => exitClick()}
					className='px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-900 transition-colors hover:cursor-pointer w-fit mt-2'
				>
					Выйти
				</button>
			</div>
		</main>
	)
}
