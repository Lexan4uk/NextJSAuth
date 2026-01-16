'use server'
import crypto from 'crypto'

export async function hashPassword(
	password: string,
	salt: string
): Promise<string> {
	return new Promise((resolve, reject) => {
		crypto.scrypt(password.normalize(), salt, 64, (error, hash) => {
			if (error) reject(error)
			resolve(hash.toString('hex').normalize())
		})
	})
}
export async function generateSalt(): Promise<string> {
	return crypto.randomBytes(16).toString('hex').normalize()
}
export async function comparePasswords(data: {
	hashedPassword: string
	password: string
	salt: string
}): Promise<boolean> {
	const inputHashedPassword = await hashPassword(data.password, data.salt)
	return crypto.timingSafeEqual(
		Buffer.from(inputHashedPassword, 'hex'),
		Buffer.from(data.hashedPassword, 'hex')
	)
}
