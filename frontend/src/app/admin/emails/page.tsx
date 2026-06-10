'use client'
import AdminShell from '@/components/admin/AdminShell'
import { useEffect, useState } from 'react'
import { listarCandidatos, reenviarEmailAdmin } from '@/lib/api'
import { Mail, Send } from 'lucide-react'

export default function EmailsPage() {
  const [candidatos, setCandidatos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [enviando, setEnviando] = useState<string | null>(null)

  useEffect(() => {
    listarCandidatos({ estado: 'PENDENTE', limite: '100' })
      .then((d) => setCandidatos(d.candidatos))
      .finally(() => setLoading(false))
  }, [])

  async function reenviar(id: string) {
    setEnviando(id)
    await reenviarEmailAdmin(id)
    alert('Email reenviado com sucesso.')
    setEnviando(null)
  }

  async function reenviarTodos() {
    if (!confirm(`Reenviar email de confirmação para todos os ${candidatos.length} candidatos pendentes?`)) return
    for (const c of candidatos) {
      await reenviarEmailAdmin(c.id)
    }
    alert('Emails reenviados para todos os candidatos pendentes.')
  }

  return (
    <AdminShell>
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Mail size={18} className="text-gray-400" /> Gestão de emails
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">Candidatos com confirmação pendente</p>
          </div>
          {candidatos.length > 0 && (
            <button onClick={reenviarTodos} className="btn-primary text-xs px-3 py-2">
              <Send size={14} /> Reenviar para todos ({candidatos.length})
            </button>
          )}
        </div>

        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Nome</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Email</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Data inscrição</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Acção</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="text-center py-8 text-gray-400 text-sm">A carregar...</td></tr>
              ) : candidatos.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8 text-gray-400 text-sm">Nenhum candidato pendente.</td></tr>
              ) : candidatos.map((c, i) => (
                <tr key={c.id} className={`border-b border-gray-100 ${i % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                  <td className="px-4 py-3 font-medium text-gray-800 text-sm truncate max-w-[180px]">{c.nomeCompleto}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs truncate max-w-[200px]">{c.email}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(c.createdAt).toLocaleDateString('pt-AO')}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => reenviar(c.id)}
                      disabled={enviando === c.id}
                      className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5 ml-auto"
                    >
                      <Mail size={12} />
                      {enviando === c.id ? 'A enviar...' : 'Reenviar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  )
}