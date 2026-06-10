'use client'
// src/app/admin/exportar/page.tsx
import { useState } from 'react'
import AdminShell from '@/components/admin/AdminShell'
import { exportarCandidatos } from '@/lib/api'
import { Download, FileSpreadsheet } from 'lucide-react'
import { PROVINCIAS } from '@/lib/constants'

export default function ExportarPage() {
  const [estado, setEstado] = useState('')
  const [provincia, setProvincia] = useState('')
  const [localTeste, setLocalTeste] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleExportar() {
    setLoading(true)
    try {
      const params: Record<string, string> = {}
      if (estado) params.estado = estado
      if (provincia) params.provincia = provincia
      if (localTeste) params.localTeste = localTeste

      const blob = await exportarCandidatos(params)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `candidatos-inp-${new Date().toISOString().slice(0, 10)}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminShell>
      <div className="max-w-xl mx-auto">
        <div className="mb-6">
          <h1 className="text-lg font-medium text-gray-900">Exportar dados</h1>
          <p className="text-xs text-gray-400 mt-0.5">Gera um ficheiro Excel com os candidatos filtrados</p>
        </div>

        <div className="card space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <FileSpreadsheet size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">Exportação para Excel (.xlsx)</p>
              <p className="text-xs text-gray-400">Inclui todos os campos excepto dados sensíveis</p>
            </div>
          </div>

          <div>
            <label className="form-label">Estado da inscrição</label>
            <select className="form-input" value={estado} onChange={(e) => setEstado(e.target.value)}>
              <option value="">Todos</option>
              <option value="CONFIRMADO">Confirmados</option>
              <option value="PENDENTE">Pendentes</option>
              <option value="REVOGADO">Revogados</option>
            </select>
          </div>

          <div>
            <label className="form-label">Província</label>
            <select className="form-input" value={provincia} onChange={(e) => setProvincia(e.target.value)}>
              <option value="">Todas</option>
              {PROVINCIAS.map((p) => <option key={p.valor} value={p.valor}>{p.nome}</option>)}
            </select>
          </div>

          <div>
            <label className="form-label">Local de teste preferido</label>
            <select className="form-input" value={localTeste} onChange={(e) => setLocalTeste(e.target.value)}>
              <option value="">Ambos</option>
              <option value="LUANDA">Luanda</option>
              <option value="SUMBE">Sumbe</option>
            </select>
          </div>

          <button onClick={handleExportar} disabled={loading} className="btn-success w-full justify-center">
            <Download size={16} />
            {loading ? 'A gerar ficheiro...' : 'Exportar Excel'}
          </button>
        </div>
      </div>
    </AdminShell>
  )
}
