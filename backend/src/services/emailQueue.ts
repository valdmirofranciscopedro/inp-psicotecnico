// src/services/emailQueue.ts
import { Queue, Worker } from 'bullmq'
import { redis } from '../config/redis'
import { enviarEmail } from './email.service'

export const emailQueue = new Queue('emails', { connection: redis })

// Worker que processa os emails em background
const worker = new Worker(
  'emails',
  async (job) => {
    const { tipo, email, nome, token, candidatoId } = job.data

    switch (tipo) {
      case 'CONFIRMACAO_INSCRICAO':
        await enviarEmailConfirmacao({ email, nome, token })
        break
      case 'BOAS_VINDAS':
        await enviarEmailBoasVindas({ email, nome })
        break
      default:
        console.warn(`Tipo de email desconhecido: ${tipo}`)
    }
  },
  {
    connection: redis,
    concurrency: 5,
  }
)

worker.on('completed', (job) => {
  console.log(`✅ Email enviado: job ${job.id} (${job.data.tipo}) → ${job.data.email}`)
})

worker.on('failed', (job, err) => {
  console.error(`❌ Falha ao enviar email: job ${job?.id}`, err)
})

// ─── Funções de envio ────────────────────────────────

async function enviarEmailConfirmacao({ email, nome, token }: { email: string; nome: string; token: string }) {
  const frontendUrl = process.env.FRONTEND_URL
  const linkConfirmacao = `${frontendUrl}/confirmar/${token}`

  await enviarEmail({
    to: email,
    subject: 'Confirme a sua inscrição — Teste Psicotécnico INP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
        <div style="background: #0F2D5A; padding: 20px 24px; border-radius: 8px 8px 0 0;">
          <h1 style="color: #fff; margin: 0; font-size: 18px; font-weight: 500;">Instituto Nacional de Petróleos</h1>
          <p style="color: #85B7EB; margin: 4px 0 0; font-size: 13px;">Teste Psicotécnico 2025</p>
        </div>
        <div style="background: #f9f9f9; padding: 28px 24px; border: 1px solid #e5e5e5; border-top: none;">
          <p style="margin: 0 0 16px; color: #333;">Olá, <strong>${nome}</strong>,</p>
          <p style="margin: 0 0 16px; color: #555; line-height: 1.6;">
            A sua inscrição no teste psicotécnico foi recebida com sucesso.<br>
            Clique no botão abaixo para confirmar o seu email e activar a inscrição.
          </p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${linkConfirmacao}"
               style="display: inline-block; background: #1D9E75; color: #fff; text-decoration: none;
                      padding: 13px 32px; border-radius: 8px; font-size: 15px; font-weight: 500;">
              Confirmar inscrição
            </a>
          </div>
          <p style="margin: 0; font-size: 12px; color: #888; text-align: center;">
            Este link expira em 48 horas.<br>
            Se não se inscreveu, ignore este email.
          </p>
        </div>
        <div style="background: #0F2D5A; padding: 12px 24px; border-radius: 0 0 8px 8px; text-align: center;">
          <p style="color: #4a6fa0; font-size: 11px; margin: 0;">
            inscricoes.inp.co.ao · Instituto Nacional de Petróleos, Angola
          </p>
        </div>
      </div>
    `,
  })
}

async function enviarEmailBoasVindas({ email, nome }: { email: string; nome: string }) {
  await enviarEmail({
    to: email,
    subject: 'Inscrição confirmada — Teste Psicotécnico INP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
        <div style="background: #0F2D5A; padding: 20px 24px; border-radius: 8px 8px 0 0;">
          <h1 style="color: #fff; margin: 0; font-size: 18px; font-weight: 500;">Instituto Nacional de Petróleos</h1>
          <p style="color: #85B7EB; margin: 4px 0 0; font-size: 13px;">Teste Psicotécnico 2025</p>
        </div>
        <div style="background: #f9f9f9; padding: 28px 24px; border: 1px solid #e5e5e5; border-top: none;">
          <p style="margin: 0 0 16px; color: #333;">Olá, <strong>${nome}</strong>,</p>
          <p style="margin: 0 0 8px; color: #555; line-height: 1.6;">
            A sua inscrição foi <strong style="color: #1D9E75;">confirmada com sucesso</strong>.
          </p>
          <p style="margin: 0 0 16px; color: #555; line-height: 1.6;">
            Receberá em breve a convocatória com data, hora e local do teste. Fique atento ao seu email.
          </p>
        </div>
        <div style="background: #0F2D5A; padding: 12px 24px; border-radius: 0 0 8px 8px; text-align: center;">
          <p style="color: #4a6fa0; font-size: 11px; margin: 0;">
            inscricoes.inp.co.ao · Instituto Nacional de Petróleos, Angola
          </p>
        </div>
      </div>
    `,
  })
}
