import { loginUser } from '@/actions/login'
import { SubmitErrorHandler, SubmitHandler, useForm } from 'react-hook-form'
interface IAuthForm {
	email: string
	password: string
}
export default function AuthForm() {
	const {
		register,
		handleSubmit,
		formState: { errors },
		setError,
		clearErrors,
	} = useForm<IAuthForm>({
		mode: 'onSubmit',
		reValidateMode: 'onSubmit',
	})

	const onSubmit: SubmitHandler<IAuthForm> = async (data: IAuthForm) => {
		const result = await loginUser(data)
		if (!result?.ok) {
			setError(result.field as keyof IAuthForm, {
				type: 'server',
				message: result.error.message,
			})
			return
		}
	}
	const onError: SubmitErrorHandler<IAuthForm> = errors => {
		//toast.error(`Ошибка входа`)
	}
	return (
		<form
			className='w-100 m-auto flex items-center justify-center rounded-2xl bg-gray-100 shadow-sm p-8 flex-col border border-gray-100'
			onSubmit={handleSubmit(onSubmit, onError)}
		>
			<div className='flex mb-4 w-full  justify-center items-center gap-2'>
				<h1 className='text-2xl font-semibold text-gray-900'>Next auth log</h1>
			</div>

			<input
				id='email'
				placeholder='Email'
				className='mb-2 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
				{...register('email', {
					required: 'Заполните поле email',
					pattern: {
						value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
						message: 'Введите корректный email',
					},
					onChange: () => clearErrors('email'),
				})}
			/>
			{errors.email && (
				<span className='text-red-500 text-sm mb-4 w-full'>
					{errors.email.message}
				</span>
			)}

			<input
				id='password'
				placeholder='Пароль'
				type='password'
				className='mb-2 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
				{...register('password', {
					required: 'Заполните поле пароля',
					onChange: () => clearErrors('password'),
				})}
			/>
			{errors.password && (
				<span className='text-red-500 text-sm mb-2 w-full'>
					{errors.password.message}
				</span>
			)}

			<div className='flex items-center gap-5 justify-center w-full'>
				<button className='w-full py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors hover:cursor-pointer'>
					Войти
				</button>
			</div>
		</form>
	)
}
