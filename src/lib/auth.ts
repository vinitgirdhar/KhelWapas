import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface JWTPayload {
  userId: string
  email: string
  role: 'user' | 'admin'
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

export async function getCurrentUser(request?: NextRequest): Promise<JWTPayload | null> {
  try {
    let token: string | undefined

    if (request) {
      // For API routes
      token = request.cookies.get('auth-token')?.value
    } else {
      // For server components
      const cookieStore = cookies()
      token = cookieStore.get('auth-token')?.value
    }

    if (!token) return null

    return verifyToken(token)
  } catch {
    return null
  }
}

export function setAuthCookie(token: string): string {
  return `auth-token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`
}

export function clearAuthCookie(): string {
  return 'auth-token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'
}
