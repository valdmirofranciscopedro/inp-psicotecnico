// src/routes/auth.routes.ts
import { Router } from 'express'
import { loginRateLimit } from '../middleware/rateLimit'
import { login, logout, me } from '../controllers/auth.controller'
import { requireAuth } from '../middleware/auth'

const router = Router()

router.post('/login', loginRateLimit, login)
router.post('/logout', requireAuth, logout)
router.get('/me', requireAuth, me)

export { router as authRoutes }
