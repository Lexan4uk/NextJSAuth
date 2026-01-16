import { getCurrentUser } from '@/scripts/getCurrentUser'
import { redirect } from 'next/navigation'
import HomePage from './components/HomePage'

export default async function Home() {
	const user = await getCurrentUser()

	if (user) {
		redirect('/user')
	}

	return <HomePage />
}
