'use client'
import { oAuthSignIn } from '@/actions/oAuthSignIn'
import { OAuthProvider } from '@prisma/client'
import { LogIn } from 'lucide-react'
import { useState } from 'react'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'

export default function HomePage() {
	const [openForm, setOpenForm] = useState<'Login' | 'Register'>('Login')
	const oAuthDiscordClick = async () => {
		oAuthSignIn(OAuthProvider.discord)
	}
	const oAuthGithubClick = async () => {
		oAuthSignIn(OAuthProvider.github)
	}
	return (
		<main className='flex w-full h-dvh'>
			<div className='flex flex-col w-full h-full  bg-gray-200'>
				<div className='flex mx-auto gap-2 mt-4 flex-col'>
					<div className='flex gap-2'>
						<button
							onClick={() => setOpenForm('Login')}
							className='px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-900 transition-colors hover:cursor-pointer w-full'
						>
							Вход
						</button>
						<button
							onClick={() => setOpenForm('Register')}
							className='px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-900 transition-colors hover:cursor-pointer w-full'
						>
							Регистрация
						</button>
					</div>
					<div className='flex gap-2'>
						<button
							onClick={() => oAuthDiscordClick()}
							className='px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-900 transition-colors hover:cursor-pointer flex gap-2'
						>
							Войти через Discord <LogIn />
						</button>
						<button
							onClick={() => oAuthGithubClick()}
							className='px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-900 transition-colors hover:cursor-pointer flex gap-2'
						>
							Войти через Github <LogIn />
						</button>
					</div>
				</div>
				{openForm == 'Login' && <LoginForm />}
				{openForm == 'Register' && <RegisterForm />}
			</div>
		</main>
	)
}
