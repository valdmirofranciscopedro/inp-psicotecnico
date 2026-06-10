// src/routes/index.ts
import { Router } from 'express'
import { inscricaoRoutes } from './inscricao.routes'
import { authRoutes } from './auth.routes'
import { adminRoutes } from './admin.routes'
import { publicRoutes } from './public.routes'
import { configuracoesRoutes } from './configuracoes.routes'

const router = Router()

router.use('/inscricao', inscricaoRoutes)
router.use('/auth', authRoutes)
router.use('/admin', adminRoutes)
router.use('/public', publicRoutes)
router.use('/configuracoes', configuracoesRoutes)

export { router as apiRoutes }
