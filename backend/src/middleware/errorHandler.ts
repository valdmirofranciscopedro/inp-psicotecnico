// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { AppError } from '../utils/AppError'
import { env } from '../config/env'

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // Erro de validação Zod
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Dados inválidos',
      detalhes: err.flatten().fieldErrors,
    })
  }

  // Erro de ficheiro demasiado grande (multer)
  if (err.message?.includes('File too large')) {
    return res.status(400).json({
      error: `O ficheiro excede o tamanho máximo de ${process.env.UPLOAD_MAX_SIZE_MB || 10}MB.`,
    })
  }

  // Erro de tipo de ficheiro (multer)
  if (err.message?.includes('Tipo de ficheiro não permitido')) {
    return res.status(400).json({ error: err.message })
  }

  // Erro de aplicação controlado
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message })
  }

  // Erro não tratado — não expor detalhes em produção
  console.error('Erro não tratado:', err)
  res.status(500).json({
    error: 'Erro interno do servidor.',
    ...(env.NODE_ENV === 'development' && { detalhes: err.message }),
  })
}
