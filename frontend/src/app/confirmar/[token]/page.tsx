// src/app/confirmar/[token]/page.tsx
import { CheckCircle, XCircle, Clock } from 'lucide-react'
import Link from 'next/link'

interface Props {
  params: { token: string }
}

async function confirmarToken(token: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/inscricao/confirmar/${token}`,
      { cache: 'no-store' }
    )
    const data = await res.json()
    if (!res.ok) return { sucesso: false, mensagem: data.error || 'Erro desconhecido.' }
    return { sucesso: true, mensagem: data.message }
  } catch {
    return { sucesso: false, mensagem: 'Não foi possível ligar ao servidor. Tente novamente.' }
  }
}

export default async function ConfirmarPage({ params }: Props) {
  const resultado = await confirmarToken(params.token)

  const isExpirado = resultado.mensagem?.toLowerCase().includes('expirou')
  const isJaConfirmado = resultado.mensagem?.toLowerCase().includes('já foi confirmada')

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-inp-navy px-6 py-3">
        <p className="text-white text-sm font-medium">INP · Teste Psicotécnico 2025</p>
        <p className="text-blue-300 text-xs">Instituto Nacional de Petróleos</p>
      </header>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="card max-w-md w-full text-center">

          {resultado.sucesso ? (
            <>
              <div className="w-16 h-16 rounded-full bg-inp-greenLt flex items-center justify-center mx-auto mb-5">
                <CheckCircle size={32} className="text-inp-green" />
              </div>
              <h1 className="text-xl font-medium text-gray-900 mb-2">
                Inscrição confirmada!
              </h1>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                O seu email foi verificado e a inscrição está activa.
                Receberá a convocatória para o teste psicotécnico no seu email em breve.
              </p>
              <div className="bg-inp-greenLt rounded-lg p-4 text-left mb-6">
                <p className="text-xs font-medium text-emerald-800 mb-1">O que acontece a seguir?</p>
                <ul className="text-xs text-emerald-700 space-y-1">
                  <li>✓ Inscrição registada no sistema INP</li>
                  <li>✓ Os seus documentos estão em análise</li>
                  <li>→ Aguarde a convocatória por email</li>
                </ul>
              </div>
              <Link href="/" className="btn-secondary mx-auto">
                Voltar à página inicial
              </Link>
            </>
          ) : isExpirado ? (
            <>
              <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-5">
                <Clock size={32} className="text-amber-500" />
              </div>
              <h1 className="text-xl font-medium text-gray-900 mb-2">Link expirado</h1>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                Este link de confirmação expirou (validade de 48 horas).
                Solicite um novo email de confirmação abaixo.
              </p>
              <ReenviarForm />
            </>
          ) : isJaConfirmado ? (
            <>
              <div className="w-16 h-16 rounded-full bg-inp-blueLt flex items-center justify-center mx-auto mb-5">
                <CheckCircle size={32} className="text-inp-blue" />
              </div>
              <h1 className="text-xl font-medium text-gray-900 mb-2">
                Já confirmado anteriormente
              </h1>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                Esta inscrição já foi confirmada. Não é necessária nenhuma acção adicional.
              </p>
              <Link href="/" className="btn-secondary mx-auto">
                Voltar à página inicial
              </Link>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
                <XCircle size={32} className="text-red-500" />
              </div>
              <h1 className="text-xl font-medium text-gray-900 mb-2">Link inválido</h1>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                {resultado.mensagem}
              </p>
              <ReenviarForm />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Componente de reenvio (client component embutido) ──
function ReenviarForm() {
  return (
    <div className="text-left">
      <p className="text-xs text-gray-500 mb-3 text-center">
        Introduza o email com que se inscreveu para receber um novo link:
      </p>
      {/* O formulário de reenvio é gerido no client — componente separado */}
      <ReenviarFormClient />
    </div>
  )
}

// Este bloco seria extraído para um componente 'use client' num ficheiro separado.
// Por simplicidade está aqui como placeholder — ver ReenviarEmailForm component.
function ReenviarFormClient() {
  return (
    <div className="bg-gray-50 rounded-lg p-4 text-center">
      <p className="text-xs text-gray-500 mb-3">
        Vá à página de inscrição e utilize a opção "Reenviar email de confirmação".
      </p>
      <a href="/inscricao" className="btn-secondary text-sm">
        Ir para a página de inscrição
      </a>
    </div>
  )
}
