'use server'
import { removeUserFromSession } from '@/scripts/session'
import { cookies } from 'next/headers'

export async function logoutUser() {
	await removeUserFromSession(await cookies())
	return
}
