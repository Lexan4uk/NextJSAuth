import { getCurrentUser } from '@/scripts/getCurrentUser'
import { UserRole } from '@prisma/client'
import { notFound } from 'next/navigation'

export default async function Page() {
	const user = await getCurrentUser({
		withFullUser: false,
		redirectIfNotFound: false,
	})

	if (!user || user.role !== UserRole.admin) {
		notFound()
	}

	return <>Admin panel</>
}
