'use client'
import AdminShell from '@/components/admin/AdminShell'
import { useEffect, useState } from 'react'
import { getMeAdmin, api } from '@/lib/api'
import { Settings, User, Shield, Calendar, CheckCircle } from 'lucide-react'

export default function ConfiguracoesPage() {
  const [admin, setAdmin] = useState<any>(null)
  const [dataInicio, setDataInicio] = useState('')
  const [dataTermino, setDataTermino] = useState('')
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    Promise.all([
      getMeAdmin(),
      api.get('/configuracoes').then((r) => r.data),
    ]).then(([adminData, config]) => {
      setAdmin(adminData)
      if (config.dataInicio) setDataInicio(config.dataInicio.slice(0, 16))
      if (config.dataTermino) setDataTermino(config.dataTermino.slice(0, 16))
    }).finally(() => setLoading(false))
  }, [])

  async function salvar() {
    if (!dataInicio || !dataTermino) { setErro('Ambas as datas são obrigatórias.'); return }
    if (new Date(dataInicio) >= new Date(dataTermino)) { setErro('A data de início deve ser anterior à data de término.'); return }

    setSalvando(true)
    setErro('')
    setSucesso(false)

    try {
      await api.post('/configuracoes', {
        dataInicio: new Date(dataInicio).toISOString(),
        dataTermino: new Date(dataTermino).toISOString(),
      })
      setSucesso(true)
      setTimeout(() => setSucesso(false), 3000)
    } catch (err: any) {
      setErro(err.response?.data?.error || 'Erro ao guardar.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <AdminShell>
      <div className="max-w-xl mx-auto space-y-5">
        <div>
          <h1 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <Settings size={18} className="text-gray-400" /> Configurações
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">Período de inscrições e informações do sistema</p>
        </div>

        {/* Período de inscrições */}
        <div className="card space-y-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
            <Calendar size={12} /> Período de inscrições
          </p>
          <p className="text-xs text-gray-500">
            Define quando o formulário de inscrição fica disponível e quando encerra automaticamente.
          </p>

          {loading ? (
            <p className="text-xs text-gray-400">A carregar...</p>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="form-label">Data e hora de início</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label">Data e hora de término</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={dataTermino}
                  onChange={(e) => setDataTermino(e.target.value)}
                />
              </div>

              {erro && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700">
                  {erro}
                </div>
              )}

              {sucesso && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-700 flex items-center gap-2">
                  <CheckCircle size={14} /> Configurações guardadas com sucesso.
                </div>
              )}

              <button onClick={salvar} disabled={salvando} className="btn-primary w-full justify-center">
                {salvando ? 'A guardar...' : 'Guardar configurações'}
              </button>
            </div>
          )}
        </div>

        {/* Conta */}
        <div className="card space-y-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
            <User size={12} /> Conta do administrador
          </p>
          {admin ? (
            <div className="space-y-3">
              {[
                { label: 'Nome', valor: admin.nome },
                { label: 'Email', valor: admin.email },
                { label: 'Membro desde', valor: new Date(admin.createdAt).toLocaleDateString('pt-AO') },
              ].map((f) => (
                <div key={f.label} className="flex justify-between">
                  <span className="text-xs text-gray-400">{f.label}</span>
                  <span className="text-xs font-medium text-gray-800">{f.valor}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400">A carregar...</p>
          )}
        </div>

        {/* Sistema */}
        <div className="card space-y-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
            <Shield size={12} /> Sistema
          </p>
          <div className="space-y-3">
            {[
              { label: 'Versão', valor: '1.0.0' },
              { label: 'Ambiente', valor: 'Desenvolvimento' },
              { label: 'Base de dados', valor: 'PostgreSQL 15' },
              { label: 'Cache', valor: 'Redis 5' },
            ].map((f) => (
              <div key={f.label} className="flex justify-between">
                <span className="text-xs text-gray-400">{f.label}</span>
                <span className="text-xs font-medium text-gray-800">{f.valor}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  )
}