'use client'
// src/app/admin/candidatos/page.tsx
import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import AdminShell from '@/components/admin/AdminShell'
import { listarCandidatos, confirmarInscricao, revogarInscricao, reenviarEmailAdmin, exportarCandidatos } from '@/lib/api'
import { Search, Download, CheckCircle, XCircle, Mail, ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import { PROVINCIAS } from '@/lib/constants'
import Link from 'next/link'

const ESTADO_BADGE: Record<string, { label: string; cls: string }> = {
  CONFIRMADO: { label: 'Confirmado', cls: 'bg-emerald-50 text-emerald-800' },
  PENDENTE: { label: 'Pendente', cls: 'bg-amber-50 text-amber-800' },
  REVOGADO: { label: 'Revogado', cls: 'bg-red-50 text-red-700' },
}

export default function CandidatosPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [candidatos, setCandidatos] = useState<any[]>([])
  const [paginacao, setPaginacao] = useState({ total: 0, pagina: 1, totalPaginas: 1 })
  const [loading, setLoading] = useState(true)
  const [acaoId, setAcaoId] = useState<string | null>(null)

  const [filtros, setFiltros] = useState({
    busca: searchParams.get('busca') || '',
    estado: searchParams.get('estado') || '',
    provincia: searchParams.get('provincia') || '',
    localTeste: searchParams.get('localTeste') || '',
    pagina: searchParams.get('pagina') || '1',
  })

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = {}
      if (filtros.busca) params.busca = filtros.busca
      if (filtros.estado) params.estado = filtros.estado
      if (filtros.provincia) params.provincia = filtros.provincia
      if (filtros.localTeste) params.localTeste = filtros.localTeste
      params.pagina = filtros.pagina

      const data = await listarCandidatos(params)
      setCandidatos(data.candidatos)
      setPaginacao(data.paginacao)
    } finally {
      setLoading(false)
    }
  }, [filtros])

  useEffect(() => { carregar() }, [carregar])

  async function acaoConfirmar(id: string) {
    if (!confirm('Confirmar esta inscrição manualmente?')) return
    setAcaoId(id)
    await confirmarInscricao(id)
    await carregar()
    setAcaoId(null)
  }

  async function acaoRevogar(id: string) {
    const motivo = prompt('Motivo da revogação (opcional):')
    if (motivo === null) return
    setAcaoId(id)
    await revogarInscricao(id, motivo)
    await carregar()
    setAcaoId(null)
  }

  async function acaoReenviarEmail(id: string) {
    setAcaoId(id)
    await reenviarEmailAdmin(id)
    alert('Email reenviado com sucesso.')
    setAcaoId(null)
  }

  async function acaoExportar() {
    const params: Record<string, string> = {}
    if (filtros.estado) params.estado = filtros.estado
    if (filtros.provincia) params.provincia = filtros.provincia
    if (filtros.localTeste) params.localTeste = filtros.localTeste

    const blob = await exportarCandidatos(params)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `candidatos-inp-${Date.now()}.xlsx`
    a.click()
    URL.revokeObjectURL(url)
  }

  function mudarFiltro(campo: string, valor: string) {
    setFiltros((prev) => ({ ...prev, [campo]: valor, pagina: '1' }))
  }

  return (
    <AdminShell>
      <div className="max-w-5xl mx-auto space-y-4">

        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-medium text-gray-900">Candidatos</h1>
            <p className="text-xs text-gray-400 mt-0.5">{paginacao.total} registos encontrados</p>
          </div>
          <button onClick={acaoExportar} className="btn-secondary text-xs px-3 py-2">
            <Download size={14} /> Exportar Excel
          </button>
        </div>

        {/* Filtros */}
        <div className="card">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="relative md:col-span-2">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome, processo ou email..."
                className="form-input pl-8"
                value={filtros.busca}
                onChange={(e) => mudarFiltro('busca', e.target.value)}
              />
            </div>
            <select
              className="form-input"
              value={filtros.estado}
              onChange={(e) => mudarFiltro('estado', e.target.value)}
            >
              <option value="">Todos os estados</option>
              <option value="CONFIRMADO">Confirmado</option>
              <option value="PENDENTE">Pendente</option>
              <option value="REVOGADO">Revogado</option>
            </select>
            <select
              className="form-input"
              value={filtros.provincia}
              onChange={(e) => mudarFiltro('provincia', e.target.value)}
            >
              <option value="">Todas as províncias</option>
              {PROVINCIAS.map((p) => (
                <option key={p.valor} value={p.valor}>{p.nome}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabela */}
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ tableLayout: 'fixed' }}>
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-[22%]">Nome</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-[16%]">Nº Processo</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-[12%]">Província</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-[10%]">Local</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-[11%]">Estado</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-[11%]">Data</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-[18%]">Acções</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-8 text-gray-400 text-sm">A carregar...</td></tr>
                ) : candidatos.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-8 text-gray-400 text-sm">Nenhum candidato encontrado.</td></tr>
                ) : candidatos.map((c, i) => {
                  const badge = ESTADO_BADGE[c.estado] || { label: c.estado, cls: 'bg-gray-100 text-gray-600' }
                  return (
                    <tr key={c.id} className={`border-b border-gray-100 ${i % 2 === 1 ? 'bg-gray-50/50' : ''} hover:bg-inp-blueLt/30 transition-colors`}>
                      <td className="px-4 py-3 font-medium text-gray-800 truncate">{c.nomeCompleto}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs font-mono truncate">{c.numeroProcesso}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs truncate">{c.provincia.replace('_', ' ')}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{c.localTeste}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {new Date(c.createdAt).toLocaleDateString('pt-AO')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <Link
                            href={`/admin/candidatos/${c.id}`}
                            className="p-1.5 rounded text-gray-400 hover:text-inp-blue hover:bg-inp-blueLt transition-colors"
                            title="Ver detalhes"
                          >
                            <Eye size={14} />
                          </Link>
                          {c.estado === 'PENDENTE' && (
                            <button
                              onClick={() => acaoConfirmar(c.id)}
                              disabled={acaoId === c.id}
                              className="p-1.5 rounded text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                              title="Confirmar inscrição"
                            >
                              <CheckCircle size={14} />
                            </button>
                          )}
                          {c.estado !== 'REVOGADO' && (
                            <button
                              onClick={() => acaoReenviarEmail(c.id)}
                              disabled={acaoId === c.id}
                              className="p-1.5 rounded text-gray-400 hover:text-inp-blue hover:bg-inp-blueLt transition-colors"
                              title="Reenviar email"
                            >
                              <Mail size={14} />
                            </button>
                          )}
                          {c.estado !== 'REVOGADO' && (
                            <button
                              onClick={() => acaoRevogar(c.id)}
                              disabled={acaoId === c.id}
                              className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Revogar inscrição"
                            >
                              <XCircle size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          {paginacao.totalPaginas > 1 && (
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                Página {paginacao.pagina} de {paginacao.totalPaginas}
              </p>
              <div className="flex gap-2">
                <button
                  disabled={paginacao.pagina <= 1}
                  onClick={() => mudarFiltro('pagina', String(paginacao.pagina - 1))}
                  className="btn-secondary text-xs px-2 py-1.5 disabled:opacity-40"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  disabled={paginacao.pagina >= paginacao.totalPaginas}
                  onClick={() => mudarFiltro('pagina', String(paginacao.pagina + 1))}
                  className="btn-secondary text-xs px-2 py-1.5 disabled:opacity-40"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  )
}
