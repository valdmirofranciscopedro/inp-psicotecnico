// src/routes/admin.routes.ts
import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import {
  getDashboardStats,
  listarCandidatos,
  getCandidato,
  confirmarInscricao,
  revogarInscricao,
  reenviarEmailCandidato,
  exportarCandidatos,
  getAuditLogs,
} from '../controllers/admin.controller'

const router = Router()

// Todas as rotas admin requerem autenticação
router.use(requireAuth)

// Dashboard
router.get('/dashboard', getDashboardStats)

// Candidatos
router.get('/candidatos', listarCandidatos)
router.get('/candidatos/:id', getCandidato)
router.patch('/candidatos/:id/confirmar', confirmarInscricao)
router.patch('/candidatos/:id/revogar', revogarInscricao)
router.post('/candidatos/:id/reenviar-email', reenviarEmailCandidato)

// Exportação
router.get('/exportar', exportarCandidatos)

// Auditoria
router.get('/auditoria', getAuditLogs)

export { router as adminRoutes }
