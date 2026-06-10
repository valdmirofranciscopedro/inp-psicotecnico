// src/controllers/configuracoes.controller.ts
import { Request, Response, NextFunction } from 'express'
import { prisma } from '../config/database'
import { redis } from '../config/redis'
import { logAuditoria } from '../services/auditoria.service'
import { z } from 'zod'

const configSchema = z.object({
  dataInicio: z.string().min(1, 'Data de início obrigatória'),
  dataTermino: z.string().min(1, 'Data de término obrigatória'),
})

export async function getConfiguracoes(_req: Request, res: Response, next: NextFunction) {
  try {
    const cacheKey = 'config:inscricoes'
    const cached = await redis.get(cacheKey)
    if (cached) return res.json(JSON.parse(cached))

    const configs = await prisma.configuracao.findMany()
    const resultado: Record<string, string> = {}
    configs.forEach((c) => { resultado[c.chave] = c.valor })

    await redis.setex(cacheKey, 60, JSON.stringify(resultado))
    res.json(resultado)
  } catch (err) {
    next(err)
  }
}

export async function salvarConfiguracoes(req: Request, res: Response, next: NextFunction) {
  try {
    const { dataInicio, dataTermino } = configSchema.parse(req.body)
    const adminId = (req as any).adminId as string

    await Promise.all([
      prisma.configuracao.upsert({
        where: { chave: 'dataInicio' },
        update: { valor: dataInicio },
        create: { chave: 'dataInicio', valor: dataInicio },
      }),
      prisma.configuracao.upsert({
        where: { chave: 'dataTermino' },
        update: { valor: dataTermino },
        create: { chave: 'dataTermino', valor: dataTermino },
      }),
    ])

    // Invalidar cache
    await redis.del('config:inscricoes')

    await logAuditoria(adminId, 'ALTEROU_CONFIGURACOES', { dataInicio, dataTermino }, req.ip)

    res.json({ message: 'Configurações guardadas com sucesso.' })
  } catch (err) {
    next(err)
  }
}