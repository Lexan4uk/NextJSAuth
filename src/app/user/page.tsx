import { getCurrentUser } from '@/scripts/getCurrentUser'
import UserPage from './components/UserPage'

export default async function page() {
	const user = await getCurrentUser({
		withFullUser: true,
		redirectIfNotFound: false,
	})
	//можно включить редирект тут, но по умолчанию он срабатывает через миддлвер
	return user ? <UserPage user={user} /> : <></>
}
