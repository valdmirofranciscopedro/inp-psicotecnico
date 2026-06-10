// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import { AppError } from '../utils/AppError'

interface JwtPayload {
  adminId: string
  email: string
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    return next(new AppError('Autenticação necessária.', 401))
  }

  const token = authHeader.split(' ')[1]

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload
    ;(req as any).adminId = payload.adminId
    ;(req as any).adminEmail = payload.email
    next()
  } catch {
    next(new AppError('Token inválido ou expirado.', 401))
  }
}
