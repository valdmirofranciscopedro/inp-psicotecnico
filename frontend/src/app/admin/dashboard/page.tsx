'use client'
// src/app/admin/dashboard/page.tsx
import { useEffect, useState } from 'react'
import { getDashboard } from '@/lib/api'
import AdminShell from '@/components/admin/AdminShell'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { Users, CheckCircle, Clock, CalendarDays, TrendingUp, Download } from 'lucide-react'
import Link from 'next/link'

const CORES_PROVINCIAS = ['#185FA5', '#378ADD', '#85B7EB', '#B5D4F4', '#D5E9F9', '#E6F1FB']
const CORES_GENERO = ['#185FA5', '#85B7EB', '#B4B2A9']
const CORES_LOCAL = ['#1D9E75', '#9FE1CB']

function KpiCard({ label, valor, sub, subTipo, icon: Icon }: {
  label: string; valor: string | number; sub?: string
  subTipo?: 'up' | 'warn' | 'neutral'; icon: any
}) {
  const subCor = subTipo === 'up' ? 'text-emerald-600' : subTipo === 'warn' ? 'text-amber-600' : 'text-gray-400'
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gray-500">{label}</p>
        <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
          <Icon size={14} className="text-gray-400" />
        </div>
      </div>
      <p className="text-2xl font-medium text-gray-900">{typeof valor === 'number' ? valor.toLocaleString('pt-AO') : valor}</p>
      {sub && <p className={`text-xs mt-1 ${subCor}`}>{sub}</p>}
    </div>
  )
}

export default function DashboardPage() {
  const [dados, setDados] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboard().then(setDados).finally(() => setLoading(false))
  }, [])

  if (loading || !dados) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
          A carregar estatísticas...
        </div>
      </AdminShell>
    )
  }

  const { totais, porGenero, porProvincia, porLocalTeste, porCurso, inscricoesPorDia } = dados

  const taxaConfirmacao = totais.totalInscritos > 0
    ? Math.round((totais.totalConfirmados / totais.totalInscritos) * 100)
    : 0

  // Mapear labels de género para português
  const labelGenero: Record<string, string> = {
    MASCULINO: 'Masculino', FEMININO: 'Feminino',
    OUTRO: 'Outro', PREFIRO_NAO_INFORMAR: 'N/D',
  }
  const labelLocal: Record<string, string> = { LUANDA: 'Luanda', SUMBE: 'Sumbe' }

  return (
    <AdminShell>
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-medium text-gray-900">Dashboard</h1>
            <p className="text-xs text-gray-400 mt-0.5">Dados em tempo real · actualizados agora</p>
          </div>
          <Link href="/admin/candidatos" className="btn-primary text-xs px-3 py-2">
            <Users size={14} /> Ver candidatos
          </Link>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiCard
            label="Total inscritos"
            valor={totais.totalInscritos}
            sub={`+${inscricoesPorDia[inscricoesPorDia.length - 1]?.total ?? 0} hoje`}
            subTipo="up"
            icon={Users}
          />
          <KpiCard
            label="Confirmados"
            valor={totais.totalConfirmados}
            sub={`${taxaConfirmacao}% taxa de confirmação`}
            subTipo="up"
            icon={CheckCircle}
          />
          <KpiCard
            label="Pendentes"
            valor={totais.totalPendentes}
            sub="aguardam confirmação"
            subTipo="warn"
            icon={Clock}
          />
          <KpiCard
            label="Províncias"
            valor={porProvincia.length}
            sub="representadas"
            subTipo="neutral"
            icon={TrendingUp}
          />
        </div>

        {/* Gráficos linha 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Inscrições por dia */}
          <div className="card">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">
              Inscrições — últimos 30 dias
            </p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={inscricoesPorDia} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
                <XAxis dataKey="data" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(v) => [v, 'Inscrições']}
                  labelFormatter={(l) => `Dia ${l}`}
                  contentStyle={{ fontSize: 11 }}
                />
                <Bar dataKey="total" fill="#185FA5" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Distribuição por género + local */}
          <div className="card space-y-4">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
                Por género
              </p>
              <ResponsiveContainer width="100%" height={100}>
                <PieChart>
                  <Pie data={porGenero} dataKey="total" nameKey="genero"
                    cx="50%" cy="50%" outerRadius={42} innerRadius={24}>
                    {porGenero.map((_: any, i: number) => (
                      <Cell key={i} fill={CORES_GENERO[i % CORES_GENERO.length]} />
                    ))}
                  </Pie>
                  <Legend
                    formatter={(v) => labelGenero[v] || v}
                    iconSize={8}
                    wrapperStyle={{ fontSize: 11 }}
                  />
                  <Tooltip formatter={(v) => [v, 'candidatos']} contentStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="border-t border-gray-100 pt-3">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
                Preferência de local
              </p>
              <div className="flex gap-4">
                {porLocalTeste.map((l: any, i: number) => (
                  <div key={l.local} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: CORES_LOCAL[i] }} />
                    <span className="text-xs text-gray-600">{labelLocal[l.local]}</span>
                    <span className="text-sm font-medium text-gray-900">{l.total}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Top províncias */}
        <div className="card">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">
            Inscrições por província (top 10)
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={porProvincia.slice(0, 10)}
              layout="vertical"
              margin={{ top: 0, right: 24, left: 60, bottom: 0 }}
            >
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis
                type="category"
                dataKey="provincia"
                tick={{ fontSize: 11 }}
                width={58}
                tickFormatter={(v) => v.replace('_', ' ')}
              />
              <Tooltip
                formatter={(v) => [v, 'inscrições']}
                contentStyle={{ fontSize: 11 }}
              />
              <Bar dataKey="total" radius={[0, 3, 3, 0]}>
                {porProvincia.slice(0, 10).map((_: any, i: number) => (
                  <Cell key={i} fill={CORES_PROVINCIAS[Math.min(i, CORES_PROVINCIAS.length - 1)]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top cursos */}
        <div className="card">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">
            Inscrições por curso (top 10)
          </p>
          <div className="space-y-2">
            {porCurso.map((c: any, i: number) => {
              const max = porCurso[0]?.total || 1
              const pct = Math.round((c.total / max) * 100)
              return (
                <div key={c.curso} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-44 truncate">{c.curso}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-inp-blue"
                      style={{ width: `${pct}%`, opacity: 1 - i * 0.08 }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-700 w-8 text-right">
                    {c.total}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Acções rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Link href="/admin/candidatos?estado=PENDENTE" className="card flex items-center gap-3 hover:border-inp-blue transition-colors cursor-pointer">
            <Clock size={18} className="text-amber-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-800">Pendentes</p>
              <p className="text-xs text-gray-400">{totais.totalPendentes} a confirmar</p>
            </div>
          </Link>
          <Link href="/admin/exportar" className="card flex items-center gap-3 hover:border-inp-blue transition-colors cursor-pointer">
            <Download size={18} className="text-inp-blue flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-800">Exportar</p>
              <p className="text-xs text-gray-400">Excel com filtros</p>
            </div>
          </Link>
          <Link href="/admin/auditoria" className="card flex items-center gap-3 hover:border-inp-blue transition-colors cursor-pointer">
            <CalendarDays size={18} className="text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-800">Auditoria</p>
              <p className="text-xs text-gray-400">Histórico de acções</p>
            </div>
          </Link>
        </div>
      </div>
    </AdminShell>
  )
}
