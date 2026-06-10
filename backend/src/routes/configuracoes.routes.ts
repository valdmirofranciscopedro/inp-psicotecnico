// src/routes/configuracoes.routes.ts
import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { getConfiguracoes, salvarConfiguracoes } from '../controllers/configuracoes.controller'

const router = Router()

// Pública — o frontend precisa de verificar se as inscrições estão abertas
router.get('/', getConfiguracoes)

// Restrita — só admin pode alterar
router.post('/', requireAuth, salvarConfiguracoes)

export { router as configuracoesRoutes }