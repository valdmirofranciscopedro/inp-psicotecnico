// src/controllers/public.controller.ts
import { Request, Response, NextFunction } from 'express'
import { prisma } from '../config/database'
import { redis } from '../config/redis'

export async function getEstatisticasPublicas(_req: Request, res: Response, next: NextFunction) {
  try {
    // Cache de 5 minutos para não sobrecarregar a BD
    const cacheKey = 'stats:publicas'
    const cached = await redis.get(cacheKey)
    if (cached) return res.json(JSON.parse(cached))

    const total = await prisma.candidato.count({ where: { estado: 'CONFIRMADO' } })
    const provincias = await prisma.candidato.groupBy({
      by: ['provincia'],
      where: { estado: 'CONFIRMADO' },
      _count: { provincia: true },
    })

    const stats = {
      totalInscritos: total,
      totalProvincias: provincias.length,
      prazoFinal: process.env.PRAZO_FINAL || '2025-06-30',
    }

    await redis.setex(cacheKey, 300, JSON.stringify(stats))
    res.json(stats)
  } catch (err) {
    next(err)
  }
}
