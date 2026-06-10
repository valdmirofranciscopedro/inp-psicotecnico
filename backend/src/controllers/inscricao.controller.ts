// src/controllers/inscricao.controller.ts
import { Request, Response, NextFunction } from 'express'
import crypto from 'crypto'
import { prisma } from '../config/database'
import { inscricaoSchema, reenviarSchema } from '../validators/inscricao.validator'
import { emailQueue } from '../services/emailQueue'
import { AppError } from '../utils/AppError'

// Gera hash do BI para detecção de duplicados sem armazenar em plain text
function hashBI(bi: string): string {
  return crypto.createHash('sha256').update(bi.trim().toUpperCase()).digest('hex')
}

// ─── Verificar duplicado em tempo real ──────────────
export async function verificarDuplicado(req: Request, res: Response, next: NextFunction) {
  try {
    const { numeroProcesso, bilheteIdentidade } = req.body

    const checks = await Promise.all([
      numeroProcesso
        ? prisma.candidato.findUnique({ where: { numeroProcesso }, select: { id: true } })
        : null,
      bilheteIdentidade
        ? prisma.candidato.findUnique({ where: { biHash: hashBI(bilheteIdentidade) }, select: { id: true } })
        : null,
    ])

    res.json({
      numeroProcesoDuplicado: !!checks[0],
      biDuplicado: !!checks[1],
    })
  } catch (err) {
    next(err)
  }
}

// ─── Submeter inscrição ──────────────────────────────
export async function submeterInscricao(req: Request, res: Response, next: NextFunction) {
  try {
    // Validar campos do formulário
    const dadosValidos = inscricaoSchema.parse(req.body)

    // Verificar ficheiros enviados
    const files = req.files as Record<string, Express.Multer.File[]>
    if (!files?.bilheteIdentidade?.[0]) throw new AppError('Bilhete de Identidade é obrigatório', 400)
    if (!files?.certificadoHabilitacoes?.[0]) throw new AppError('Certificado de Habilitações é obrigatório', 400)
    if (!files?.curriculumVitae?.[0]) throw new AppError('Curriculum Vitae é obrigatório', 400)

    const biHash = hashBI(dadosValidos.bilheteIdentidade)

    // Verificar duplicados
    const [procExiste, biExiste, emailExiste] = await Promise.all([
      prisma.candidato.findUnique({ where: { numeroProcesso: dadosValidos.numeroProcesso }, select: { id: true } }),
      prisma.candidato.findUnique({ where: { biHash }, select: { id: true } }),
      prisma.candidato.findUnique({ where: { email: dadosValidos.email }, select: { id: true } }),
    ])

    if (procExiste) throw new AppError('Este número de processo já está registado.', 409)
    if (biExiste) throw new AppError('Este Bilhete de Identidade já está registado.', 409)
    if (emailExiste) throw new AppError('Este email já está registado.', 409)

    // Gerar token de confirmação (válido 48h)
    const tokenConfirmacao = crypto.randomBytes(32).toString('hex')
    const tokenExpiracao = new Date(Date.now() + 48 * 60 * 60 * 1000)

    // Criar candidato + documentos numa transacção
    const candidato = await prisma.$transaction(async (tx) => {
      const c = await tx.candidato.create({
        data: {
          ...dadosValidos,
          anoConclusao: Number(dadosValidos.anoConclusao),
          biHash,
          tokenConfirmacao,
          tokenExpiracao,
          documentos: {
            create: [
              {
                tipo: 'BILHETE_IDENTIDADE',
                nomeOriginal: files.bilheteIdentidade[0].originalname,
                nomeFicheiro: files.bilheteIdentidade[0].filename,
                mimeType: files.bilheteIdentidade[0].mimetype,
                tamanhoBytes: files.bilheteIdentidade[0].size,
                caminho: files.bilheteIdentidade[0].path,
              },
              {
                tipo: 'CERTIFICADO_HABILITACOES',
                nomeOriginal: files.certificadoHabilitacoes[0].originalname,
                nomeFicheiro: files.certificadoHabilitacoes[0].filename,
                mimeType: files.certificadoHabilitacoes[0].mimetype,
                tamanhoBytes: files.certificadoHabilitacoes[0].size,
                caminho: files.certificadoHabilitacoes[0].path,
              },
              {
                tipo: 'CURRICULUM_VITAE',
                nomeOriginal: files.curriculumVitae[0].originalname,
                nomeFicheiro: files.curriculumVitae[0].filename,
                mimeType: files.curriculumVitae[0].mimetype,
                tamanhoBytes: files.curriculumVitae[0].size,
                caminho: files.curriculumVitae[0].path,
              },
            ],
          },
        },
      })
      return c
    })

    // Enfileirar envio de email (não bloqueia a resposta)
    await emailQueue.add('confirmacao', {
      tipo: 'CONFIRMACAO_INSCRICAO',
      candidatoId: candidato.id,
      email: candidato.email,
      nome: candidato.nomeCompleto,
      token: tokenConfirmacao,
    })

    res.status(201).json({
      message: 'Inscrição submetida com sucesso. Verifique o seu email para confirmar.',
      candidatoId: candidato.id,
    })
  } catch (err) {
    next(err)
  }
}

// ─── Confirmar email via token ───────────────────────
export async function confirmarEmail(req: Request, res: Response, next: NextFunction) {
  try {
    const { token } = req.params

    const candidato = await prisma.candidato.findUnique({
      where: { tokenConfirmacao: token },
      select: { id: true, email: true, nomeCompleto: true, tokenExpiracao: true, emailConfirmado: true },
    })

    if (!candidato) throw new AppError('Link de confirmação inválido.', 400)
    if (candidato.emailConfirmado) throw new AppError('Esta inscrição já foi confirmada anteriormente.', 400)
    if (candidato.tokenExpiracao && candidato.tokenExpiracao < new Date()) {
      throw new AppError('Este link expirou. Solicite um novo email de confirmação.', 400)
    }

    await prisma.candidato.update({
      where: { id: candidato.id },
      data: {
        emailConfirmado: true,
        estado: 'CONFIRMADO',
        emailConfirmadoEm: new Date(),
        tokenConfirmacao: null,
        tokenExpiracao: null,
      },
    })

    // Email de boas-vindas
    await emailQueue.add('boasVindas', {
      tipo: 'BOAS_VINDAS',
      email: candidato.email,
      nome: candidato.nomeCompleto,
    })

    res.json({ message: 'Inscrição confirmada com sucesso!' })
  } catch (err) {
    next(err)
  }
}

// ─── Reenviar email de confirmação ───────────────────
export async function reenviarConfirmacao(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = reenviarSchema.parse(req.body)

    const candidato = await prisma.candidato.findUnique({
      where: { email },
      select: { id: true, nomeCompleto: true, emailConfirmado: true },
    })

    // Resposta genérica para não revelar se o email existe ou não
    if (!candidato || candidato.emailConfirmado) {
      return res.json({ message: 'Se o email estiver registado, receberá um novo link em breve.' })
    }

    const tokenConfirmacao = crypto.randomBytes(32).toString('hex')
    const tokenExpiracao = new Date(Date.now() + 48 * 60 * 60 * 1000)

    await prisma.candidato.update({
      where: { id: candidato.id },
      data: { tokenConfirmacao, tokenExpiracao },
    })

    await emailQueue.add('confirmacao', {
      tipo: 'CONFIRMACAO_INSCRICAO',
      candidatoId: candidato.id,
      email,
      nome: candidato.nomeCompleto,
      token: tokenConfirmacao,
    })

    res.json({ message: 'Se o email estiver registado, receberá um novo link em breve.' })
  } catch (err) {
    next(err)
  }
}
