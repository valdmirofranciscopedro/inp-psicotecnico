'use client'
// src/app/admin/candidatos/[id]/page.tsx
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AdminShell from '@/components/admin/AdminShell'
import { getCandidato, confirmarInscricao, revogarInscricao, reenviarEmailAdmin } from '@/lib/api'
import {
  ArrowLeft, CheckCircle, XCircle, Mail, FileText,
  User, MapPin, GraduationCap, Phone, Calendar,
} from 'lucide-react'
import Link from 'next/link'

const TIPO_DOC_LABEL: Record<string, string> = {
  BILHETE_IDENTIDADE: 'Bilhete de Identidade',
  CERTIFICADO_HABILITACOES: 'Certificado de Habilitações',
  CURRICULUM_VITAE: 'Curriculum Vitae',
}

const ESTADO_INFO: Record<string, { label: string; cls: string }> = {
  CONFIRMADO: { label: 'Confirmado', cls: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  PENDENTE: { label: 'Pendente de confirmação', cls: 'bg-amber-50 text-amber-800 border-amber-200' },
  REVOGADO: { label: 'Revogado', cls: 'bg-red-50 text-red-700 border-red-200' },
}

export default function CandidatoDetalhePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [candidato, setCandidato] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [acaoLoading, setAcaoLoading] = useState(false)

  useEffect(() => {
    getCandidato(id).then(setCandidato).finally(() => setLoading(false))
  }, [id])

  async function acaoConfirmar() {
    if (!confirm('Confirmar esta inscrição manualmente?')) return
    setAcaoLoading(true)
    await confirmarInscricao(id)
    setCandidato((prev: any) => ({ ...prev, estado: 'CONFIRMADO', emailConfirmado: true }))
    setAcaoLoading(false)
  }

  async function acaoRevogar() {
    const motivo = prompt('Motivo da revogação (opcional):')
    if (motivo === null) return
    setAcaoLoading(true)
    await revogarInscricao(id, motivo)
    setCandidato((prev: any) => ({ ...prev, estado: 'REVOGADO' }))
    setAcaoLoading(false)
  }

  async function acaoReenviar() {
    setAcaoLoading(true)
    await reenviarEmailAdmin(id)
    alert('Email de confirmação reenviado.')
    setAcaoLoading(false)
  }

  if (loading) return (
    <AdminShell>
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">A carregar...</div>
    </AdminShell>
  )

  if (!candidato) return (
    <AdminShell>
      <div className="text-center text-gray-400 py-12">Candidato não encontrado.</div>
    </AdminShell>
  )

  const estado = ESTADO_INFO[candidato.estado] || { label: candidato.estado, cls: 'bg-gray-50 text-gray-700 border-gray-200' }

  return (
    <AdminShell>
      <div className="max-w-3xl mx-auto space-y-5">

        {/* Nav */}
        <div className="flex items-center gap-3">
          <Link href="/admin/candidatos" className="text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-lg font-medium text-gray-900">{candidato.nomeCompleto}</h1>
          <span className={`inline-flex items-center border rounded-full px-2.5 py-0.5 text-xs font-medium ${estado.cls}`}>
            {estado.label}
          </span>
        </div>

        {/* Acções */}
        <div className="flex gap-2 flex-wrap">
          {candidato.estado === 'PENDENTE' && (
            <button onClick={acaoConfirmar} disabled={acaoLoading} className="btn-success text-xs px-3 py-2">
              <CheckCircle size={14} /> Confirmar inscrição
            </button>
          )}
          <button onClick={acaoReenviar} disabled={acaoLoading} className="btn-secondary text-xs px-3 py-2">
            <Mail size={14} /> Reenviar email
          </button>
          {candidato.estado !== 'REVOGADO' && (
            <button onClick={acaoRevogar} disabled={acaoLoading}
              className="btn-secondary text-xs px-3 py-2 text-red-600 border-red-200 hover:bg-red-50">
              <XCircle size={14} /> Revogar inscrição
            </button>
          )}
        </div>

        {/* Dados */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Dados pessoais */}
          <div className="card space-y-3">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
              <User size={12} /> Dados pessoais
            </p>
            {[
              { label: 'Nome completo', valor: candidato.nomeCompleto },
              { label: 'Nº de processo', valor: candidato.numeroProcesso },
              { label: 'Bilhete de Identidade', valor: candidato.bilheteIdentidade },
              { label: 'Género', valor: candidato.genero },
            ].map((f) => (
              <div key={f.label} className="flex justify-between items-start gap-2">
                <span className="text-xs text-gray-400">{f.label}</span>
                <span className="text-xs font-medium text-gray-800 text-right">{f.valor}</span>
              </div>
            ))}
          </div>

          {/* Contacto */}
          <div className="card space-y-3">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
              <Phone size={12} /> Contacto
            </p>
            {[
              { label: 'Email', valor: candidato.email },
              { label: 'Telefone', valor: candidato.telefone },
              { label: 'Tel. alternativo', valor: candidato.telefoneAlternativo || '—' },
              { label: 'Província', valor: candidato.provincia.replace(/_/g, ' ') },
              { label: 'Localização actual', valor: candidato.localizacaoActual },
            ].map((f) => (
              <div key={f.label} className="flex justify-between items-start gap-2">
                <span className="text-xs text-gray-400">{f.label}</span>
                <span className="text-xs font-medium text-gray-800 text-right">{f.valor}</span>
              </div>
            ))}
          </div>

          {/* Dados académicos */}
          <div className="card space-y-3">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
              <GraduationCap size={12} /> Dados académicos
            </p>
            {[
              { label: 'Curso', valor: candidato.cursoFrequentado },
              { label: 'Ano de conclusão', valor: candidato.anoConclusao },
              { label: 'Preferência de local', valor: candidato.localTeste },
            ].map((f) => (
              <div key={f.label} className="flex justify-between items-start gap-2">
                <span className="text-xs text-gray-400">{f.label}</span>
                <span className="text-xs font-medium text-gray-800 text-right">{f.valor}</span>
              </div>
            ))}
          </div>

          {/* Histórico */}
          <div className="card space-y-3">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
              <Calendar size={12} /> Histórico
            </p>
            {[
              { label: 'Data de inscrição', valor: new Date(candidato.createdAt).toLocaleString('pt-AO') },
              { label: 'Email confirmado', valor: candidato.emailConfirmado ? 'Sim' : 'Não' },
              { label: 'Data confirmação', valor: candidato.emailConfirmadoEm ? new Date(candidato.emailConfirmadoEm).toLocaleString('pt-AO') : '—' },
              { label: 'Estado actual', valor: candidato.estado },
            ].map((f) => (
              <div key={f.label} className="flex justify-between items-start gap-2">
                <span className="text-xs text-gray-400">{f.label}</span>
                <span className="text-xs font-medium text-gray-800 text-right">{f.valor}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Documentos */}
        <div className="card">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide flex items-center gap-1.5 mb-4">
            <FileText size={12} /> Documentos enviados
          </p>
          {candidato.documentos?.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhum documento encontrado.</p>
          ) : (
            <div className="space-y-2">
              {candidato.documentos?.map((doc: any) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <FileText size={16} className="text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        {TIPO_DOC_LABEL[doc.tipo] || doc.tipo}
                      </p>
                      <p className="text-xs text-gray-400">
                        {doc.nomeOriginal} · {(doc.tamanhoBytes / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <a
                    href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/uploads/${doc.nomeFicheiro}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary text-xs px-3 py-1.5"
                  >
                    Ver
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  )
}
