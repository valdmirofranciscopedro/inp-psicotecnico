// src/server.ts
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import path from 'path'

import { env } from './config/env'
import { apiRoutes } from './routes'
import { errorHandler } from './middleware/errorHandler'
import { requestLogger } from './middleware/requestLogger'

const app = express()
app.set('trust proxy', 1) // necessário quando atrás do Nginx

// ─── Segurança e middlewares base ───────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}))
app.use(compression())
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}))
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(requestLogger)

// ─── Servir uploads (com auth no middleware de rotas) ─
app.use('/uploads', express.static(path.resolve(env.UPLOAD_DIR)))

// ─── Rotas da API ────────────────────────────────────
app.use('/api', apiRoutes)

// ─── Health check ────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString() })
})

// ─── Error handler global ────────────────────────────
app.use(errorHandler)

app.listen(env.PORT, () => {
  console.log(`🚀 Backend INP a correr em http://localhost:${env.PORT}`)
  console.log(`   Ambiente: ${env.NODE_ENV}`)
})

export default app
