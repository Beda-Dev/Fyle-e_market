import { getServerSession } from 'next-auth'
import { ZodError, ZodSchema } from 'zod'
import { authOptions } from './auth'

export class ApiError extends Error {
  constructor(public status: number, message: string, public details?: unknown) {
    super(message)
  }
}

export function jsonError(status: number, message: string, details?: unknown) {
  return Response.json({ error: message, ...(details ? { details } : {}) }, { status })
}

export async function parseJson<T>(request: Request, schema: ZodSchema<T>): Promise<T> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    throw new ApiError(400, 'Corps de requête JSON invalide')
  }
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw new ApiError(400, 'Données invalides', parsed.error.flatten())
  }
  return parsed.data
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return jsonError(error.status, error.message, error.details)
  }
  if (error instanceof ZodError) {
    return jsonError(400, 'Données invalides', error.flatten())
  }
  console.error('API error:', error)
  return jsonError(500, 'Erreur serveur')
}

export async function requireUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new ApiError(401, 'Authentification requise')
  }
  return session.user
}

export async function requireAdmin() {
  const user = await requireUser()
  if (user.role !== 'ADMIN') {
    throw new ApiError(403, 'Accès réservé aux administrateurs')
  }
  return user
}
