// src/controllers/auth.controller.ts
import { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../config/database'
import { env } from '../config/env'
import { AppError } from '../utils/AppError'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = loginSchema.parse(req.body)

    const admin = await prisma.admin.findUnique({ where: { email } })

    // Tempo constante para prevenir timing attacks
    const senhaCorrecta = admin
      ? await bcrypt.compare(password, admin.passwordHash)
      : await bcrypt.compare(password, '$2b$12$invalidhashforcomparison000000000000000000000000')

    if (!admin || !senhaCorrecta) {
      throw new AppError('Email ou password incorrectos.', 401)
    }

    const token = jwt.sign(
      { adminId: admin.id, email: admin.email },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
    )

    res.json({
      token,
      admin: { id: admin.id, email: admin.email, nome: admin.nome },
    })
  } catch (err) {
    next(err)
  }
}

export async function logout(_req: Request, res: Response) {
  // Com JWT stateless, o logout é gerido no cliente
  // Em produção, pode-se manter uma blacklist no Redis
  res.json({ message: 'Sessão terminada.' })
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const adminId = (req as any).adminId as string
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: { id: true, email: true, nome: true, createdAt: true },
    })
    if (!admin) throw new AppError('Administrador não encontrado.', 404)
    res.json(admin)
  } catch (err) {
    next(err)
  }
}
