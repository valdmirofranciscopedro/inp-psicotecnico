'use client'
import AdminShell from '@/components/admin/AdminShell'
import { useEffect, useState } from 'react'
import { getDashboard } from '@/lib/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { PROVINCIAS } from '@/lib/constants'

const CORES = ['#185FA5','#378ADD','#85B7EB','#B5D4F4','#D5E9F9','#E6F1FB']

export default function EstatisticasPage() {
  const [dados, setDados] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboard().then(setDados).finally(() => setLoading(false))
  }, [])

  if (loading || !dados) return (
    <AdminShell>
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">A carregar...</div>
    </AdminShell>
  )

  const { porGenero, porProvincia, porLocalTeste, porCurso, inscricoesPorDia } = dados

  const nomesProvincia: Record<string, string> = Object.fromEntries(
    PROVINCIAS.map((p) => [p.valor, p.nome])
  )

  return (
    <AdminShell>
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-lg font-medium text-gray-900">Estatísticas detalhadas</h1>
          <p className="text-xs text-gray-400 mt-0.5">Visão completa de todas as inscrições</p>
        </div>

        {/* Inscrições por dia */}
        <div className="card">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">Inscrições por dia — últimos 30 dias</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={inscricoesPorDia} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
              <XAxis dataKey="data" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: number) => [v, 'Inscrições']} contentStyle={{ fontSize: 11 }} />
              <Bar dataKey="total" fill="#185FA5" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Género e Local */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">Por género</p>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={porGenero} dataKey="total" nameKey="genero" cx="50%" cy="50%" outerRadius={65} innerRadius={35}>
                  {porGenero.map((_: any, i: number) => <Cell key={i} fill={CORES[i]} />)}
                </Pie>
                <Legend formatter={(v) => v === 'MASCULINO' ? 'Masculino' : 'Feminino'} iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => [v, 'candidatos']} contentStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">Preferência de local de teste</p>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={porLocalTeste} dataKey="total" nameKey="local" cx="50%" cy="50%" outerRadius={65} innerRadius={35}>
                  <Cell fill="#1D9E75" />
                  <Cell fill="#9FE1CB" />
                </Pie>
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => [v, 'candidatos']} contentStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Províncias */}
        <div className="card">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">Por província</p>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={porProvincia} layout="vertical" margin={{ top: 0, right: 24, left: 80, bottom: 0 }}>
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="provincia" tick={{ fontSize: 11 }} width={78}
                tickFormatter={(v) => nomesProvincia[v] || v.replace(/_/g, ' ')} />
              <Tooltip formatter={(v: number) => [v, 'inscrições']} contentStyle={{ fontSize: 11 }} />
              <Bar dataKey="total" radius={[0, 3, 3, 0]}>
                {porProvincia.map((_: any, i: number) => <Cell key={i} fill={CORES[Math.min(i, CORES.length - 1)]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cursos */}
        <div className="card">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">Por curso</p>
          <div className="space-y-3">
            {porCurso.map((c: any, i: number) => {
              const max = porCurso[0]?.total || 1
              const pct = Math.round((c.total / max) * 100)
              return (
                <div key={c.curso} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-48 truncate">{c.curso}</span>
                  <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-inp-blue transition-all" style={{ width: `${pct}%`, opacity: 1 - i * 0.08 }} />
                  </div>
                  <span className="text-xs font-medium text-gray-700 w-8 text-right">{c.total}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </AdminShell>
  )
}