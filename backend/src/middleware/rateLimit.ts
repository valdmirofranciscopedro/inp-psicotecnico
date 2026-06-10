// src/middleware/rateLimit.ts
import rateLimit from 'express-rate-limit'

// Formulário de inscrição: 5 submissões por IP por hora
export const inscricaoRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5,
  message: {
    error: 'Demasiadas tentativas. Tente novamente em 1 hora.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Login admin: 10 tentativas por 15 minutos
export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    error: 'Demasiadas tentativas de login. Tente novamente em 15 minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})
