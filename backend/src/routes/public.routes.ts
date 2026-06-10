// src/routes/public.routes.ts
import { Router } from 'express'
import { getEstatisticasPublicas } from '../controllers/public.controller'

const router = Router()

// Estatísticas públicas (total inscritos, dias restantes) — sem dados sensíveis
router.get('/stats', getEstatisticasPublicas)

export { router as publicRoutes }
