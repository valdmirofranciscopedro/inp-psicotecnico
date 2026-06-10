// src/services/email.service.ts
import { Resend } from 'resend'
import { env } from '../config/env'

const resend = new Resend(env.RESEND_API_KEY)

interface EnviarEmailParams {
  to: string
  subject: string
  html: string
}

export async function enviarEmail({ to, subject, html }: EnviarEmailParams) {
  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to,
    subject,
    html,
  })

  if (error) {
    throw new Error(`Falha ao enviar email para ${to}: ${error.message}`)
  }
}
