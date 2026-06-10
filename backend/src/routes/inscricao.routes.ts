// src/routes/inscricao.routes.ts
import { Router } from 'express'
import { inscricaoRateLimit } from '../middleware/rateLimit'
import { uploadDocumentos } from '../config/upload'
import {
  submeterInscricao,
  confirmarEmail,
  reenviarConfirmacao,
  verificarDuplicado,
} from '../controllers/inscricao.controller'

const router = Router()

// Verificar se Nº processo ou BI já estão registados (pré-validação em tempo real)
router.post('/verificar-duplicado', inscricaoRateLimit, verificarDuplicado)

// Submeter nova inscrição (com upload dos 3 documentos)
router.post('/submeter', inscricaoRateLimit, uploadDocumentos, submeterInscricao)

// Confirmar email via token único
router.get('/confirmar/:token', confirmarEmail)

// Reenviar email de confirmação
router.post('/reenviar-confirmacao', inscricaoRateLimit, reenviarConfirmacao)

export { router as inscricaoRoutes }
