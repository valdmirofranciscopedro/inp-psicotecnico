'use client'
// src/app/admin/auditoria/page.tsx
import { useEffect, useState } from 'react'
import AdminShell from '@/components/admin/AdminShell'
import { getAuditLogs } from '@/lib/api'
import { Shield, ChevronLeft, ChevronRight } from 'lucide-react'

const ACCAO_LABEL: Record<string, { label: string; cls: string }> = {
  CONFIRMOU_INSCRICAO: { label: 'Confirmou inscrição', cls: 'text-emerald-700' },
  REVOGOU_INSCRICAO: { label: 'Revogou inscrição', cls: 'text-red-600' },
  REENVIOU_EMAIL: { label: 'Reenviou email', cls: 'text-blue-600' },
  EXPORTOU_DADOS: { label: 'Exportou dados', cls: 'text-purple-600' },
}

export default function AuditoriaPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [paginacao, setPaginacao] = useState({ total: 0, pagina: 1 })
  const [loading, setLoading] = useState(true)

  async function carregar(pagina = 1) {
    setLoading(true)
    const data = await getAuditLogs(pagina)
    setLogs(data.logs)
    setPaginacao(data.paginacao)
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  return (
    <AdminShell>
      <div className="max-w-4xl mx-auto space-y-4">
        <div>
          <h1 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <Shield size={18} className="text-gray-400" /> Auditoria
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">Registo de todas as acções realizadas pelos administradores</p>
        </div>

        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm" style={{ tableLayout: 'fixed' }}>
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-[30%]">Acção</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-[22%]">Administrador</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-[28%]">Detalhes</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-[20%]">Data/hora</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="text-center py-8 text-gray-400 text-sm">A carregar...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8 text-gray-400 text-sm">Nenhum registo encontrado.</td></tr>
              ) : logs.map((log, i) => {
                const info = ACCAO_LABEL[log.accao] || { label: log.accao, cls: 'text-gray-600' }
                return (
                  <tr key={log.id} className={`border-b border-gray-100 ${i % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                    <td className={`px-4 py-3 text-xs font-medium ${info.cls}`}>{info.label}</td>
                    <td className="px-4 py-3 text-xs text-gray-600 truncate">{log.admin?.nome || '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-400 font-mono truncate">
                      {log.detalhes ? JSON.stringify(log.detalhes).slice(0, 60) : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(log.createdAt).toLocaleString('pt-AO')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {paginacao.total > 50 && (
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-400">Página {paginacao.pagina}</p>
              <div className="flex gap-2">
                <button onClick={() => carregar(paginacao.pagina - 1)} disabled={paginacao.pagina <= 1}
                  className="btn-secondary text-xs px-2 py-1.5 disabled:opacity-40"><ChevronLeft size={14} /></button>
                <button onClick={() => carregar(paginacao.pagina + 1)} disabled={logs.length < 50}
                  className="btn-secondary text-xs px-2 py-1.5 disabled:opacity-40"><ChevronRight size={14} /></button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  )
}
