// src/controllers/admin.controller.ts
import { Request, Response, NextFunction } from 'express'
import { prisma } from '../config/database'
import { emailQueue } from '../services/emailQueue'
import { AppError } from '../utils/AppError'
import { logAuditoria } from '../services/auditoria.service'
import { gerarExcelCandidatos } from '../services/excel.service'
import crypto from 'crypto'

// ─── Dashboard ───────────────────────────────────────
export async function getDashboardStats(req: Request, res: Response, next: NextFunction) {
  try {
    const [
      totalInscritos,
      totalConfirmados,
      totalPendentes,
      porGenero,
      porProvincia,
      porLocalTeste,
      porCurso,
      inscricoesPorDia,
    ] = await Promise.all([
      prisma.candidato.count(),
      prisma.candidato.count({ where: { estado: 'CONFIRMADO' } }),
      prisma.candidato.count({ where: { estado: 'PENDENTE' } }),
      prisma.candidato.groupBy({ by: ['genero'], _count: { genero: true } }),
      prisma.candidato.groupBy({ by: ['provincia'], _count: { provincia: true }, orderBy: { _count: { provincia: 'desc' } } }),
      prisma.candidato.groupBy({ by: ['localTeste'], _count: { localTeste: true } }),
      prisma.candidato.groupBy({ by: ['cursoFrequentado'], _count: { cursoFrequentado: true }, orderBy: { _count: { cursoFrequentado: 'desc' } } }),
      // Inscrições dos últimos 30 dias
      prisma.$queryRaw<{ data: string; total: number }[]>`
        SELECT DATE("createdAt")::text as data, COUNT(*)::int as total
        FROM candidatos
        WHERE "createdAt" >= NOW() - INTERVAL '30 days'
        GROUP BY DATE("createdAt")
        ORDER BY DATE("createdAt")
      `,
    ])

    res.json({
      totais: { totalInscritos, totalConfirmados, totalPendentes },
      porGenero: porGenero.map((g) => ({ genero: g.genero, total: g._count.genero })),
      porProvincia: porProvincia.map((p) => ({ provincia: p.provincia, total: p._count.provincia })),
      porLocalTeste: porLocalTeste.map((l) => ({ local: l.localTeste, total: l._count.localTeste })),
      porCurso: porCurso.slice(0, 10).map((c) => ({ curso: c.cursoFrequentado, total: c._count.cursoFrequentado })),
      inscricoesPorDia,
    })
  } catch (err) {
    next(err)
  }
}

// ─── Listar candidatos com filtros e paginação ────────
export async function listarCandidatos(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      pagina = '1',
      limite = '20',
      estado,
      provincia,
      localTeste,
      busca,
    } = req.query as Record<string, string>

    const skip = (Number(pagina) - 1) * Number(limite)

    const where: any = {}
    if (estado) where.estado = estado
    if (provincia) where.provincia = provincia
    if (localTeste) where.localTeste = localTeste
    if (busca) {
      where.OR = [
        { nomeCompleto: { contains: busca, mode: 'insensitive' } },
        { numeroProcesso: { contains: busca, mode: 'insensitive' } },
        { email: { contains: busca, mode: 'insensitive' } },
      ]
    }

    const [candidatos, total] = await Promise.all([
      prisma.candidato.findMany({
        where,
        skip,
        take: Number(limite),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          nomeCompleto: true,
          numeroProcesso: true,
          email: true,
          telefone: true,
          genero: true,
          provincia: true,
          localTeste: true,
          cursoFrequentado: true,
          anoConclusao: true,
          estado: true,
          emailConfirmado: true,
          createdAt: true,
        },
      }),
      prisma.candidato.count({ where }),
    ])

    res.json({
      candidatos,
      paginacao: {
        total,
        pagina: Number(pagina),
        limite: Number(limite),
        totalPaginas: Math.ceil(total / Number(limite)),
      },
    })
  } catch (err) {
    next(err)
  }
}

// ─── Detalhe de um candidato ─────────────────────────
export async function getCandidato(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params
    const candidato = await prisma.candidato.findUnique({
      where: { id },
      include: { documentos: true },
    })
    if (!candidato) throw new AppError('Candidato não encontrado.', 404)

    // Remover dados sensíveis
    const { biHash, tokenConfirmacao, tokenExpiracao, ...dadosPublicos } = candidato
    res.json(dadosPublicos)
  } catch (err) {
    next(err)
  }
}

// ─── Confirmar inscrição manualmente ─────────────────
export async function confirmarInscricao(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params
    const adminId = (req as any).adminId as string

    const candidato = await prisma.candidato.update({
      where: { id },
      data: { estado: 'CONFIRMADO', emailConfirmado: true, emailConfirmadoEm: new Date() },
      select: { nomeCompleto: true, email: true },
    })

    await logAuditoria(adminId, 'CONFIRMOU_INSCRICAO', { candidatoId: id }, req.ip)

    res.json({ message: `Inscrição de ${candidato.nomeCompleto} confirmada.` })
  } catch (err) {
    next(err)
  }
}

// ─── Revogar inscrição ───────────────────────────────
export async function revogarInscricao(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params
    const adminId = (req as any).adminId as string
    const { motivo } = req.body

    const candidato = await prisma.candidato.update({
      where: { id },
      data: { estado: 'REVOGADO' },
      select: { nomeCompleto: true },
    })

    await logAuditoria(adminId, 'REVOGOU_INSCRICAO', { candidatoId: id, motivo }, req.ip)

    res.json({ message: `Inscrição de ${candidato.nomeCompleto} revogada.` })
  } catch (err) {
    next(err)
  }
}

// ─── Reenviar email para candidato ───────────────────
export async function reenviarEmailCandidato(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params
    const adminId = (req as any).adminId as string

    const candidato = await prisma.candidato.findUnique({
      where: { id },
      select: { email: true, nomeCompleto: true, emailConfirmado: true },
    })

    if (!candidato) throw new AppError('Candidato não encontrado.', 404)

    const tokenConfirmacao = crypto.randomBytes(32).toString('hex')
    const tokenExpiracao = new Date(Date.now() + 48 * 60 * 60 * 1000)

    await prisma.candidato.update({
      where: { id },
      data: { tokenConfirmacao, tokenExpiracao },
    })

    await emailQueue.add('confirmacao', {
      tipo: 'CONFIRMACAO_INSCRICAO',
      candidatoId: id,
      email: candidato.email,
      nome: candidato.nomeCompleto,
      token: tokenConfirmacao,
    })

    await logAuditoria(adminId, 'REENVIOU_EMAIL', { candidatoId: id }, req.ip)

    res.json({ message: 'Email reenviado com sucesso.' })
  } catch (err) {
    next(err)
  }
}

// ─── Exportar candidatos para Excel ──────────────────
export async function exportarCandidatos(req: Request, res: Response, next: NextFunction) {
  try {
    const { estado, provincia, localTeste } = req.query as Record<string, string>
    const adminId = (req as any).adminId as string

    const where: any = {}
    if (estado) where.estado = estado
    if (provincia) where.provincia = provincia
    if (localTeste) where.localTeste = localTeste

    const candidatos = await prisma.candidato.findMany({
      where,
      orderBy: { nomeCompleto: 'asc' },
      select: {
        nomeCompleto: true,
        numeroProcesso: true,
        email: true,
        telefone: true,
        genero: true,
        provincia: true,
        localizacaoActual: true,
        cursoFrequentado: true,
        anoConclusao: true,
        localTeste: true,
        estado: true,
        createdAt: true,
      },
    })

    const buffer = await gerarExcelCandidatos(candidatos)

    await logAuditoria(adminId, 'EXPORTOU_DADOS', { filtros: { estado, provincia, localTeste }, total: candidatos.length }, req.ip)

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename=candidatos-inp-${Date.now()}.xlsx`)
    res.send(buffer)
  } catch (err) {
    next(err)
  }
}

// ─── Logs de auditoria ───────────────────────────────
export async function getAuditLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const { pagina = '1', limite = '50' } = req.query as Record<string, string>
    const skip = (Number(pagina) - 1) * Number(limite)

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        skip,
        take: Number(limite),
        orderBy: { createdAt: 'desc' },
        include: { admin: { select: { nome: true, email: true } } },
      }),
      prisma.auditLog.count(),
    ])

    res.json({ logs, paginacao: { total, pagina: Number(pagina), limite: Number(limite) } })
  } catch (err) {
    next(err)
  }
}
