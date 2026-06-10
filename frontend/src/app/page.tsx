// src/app/page.tsx
import Link from 'next/link'
import { ClipboardList, Mail, Clock, GraduationCap, MapPin, Calendar, Users } from 'lucide-react'
import ContadorRegressivo from '@/components/public/ContadorRegressivo'
import Image from 'next/image'


async function getStats() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/stats`, {
      next: { revalidate: 300 },
    })
    if (!res.ok) return { totalInscritos: 0, totalProvincias: 0 }
    return res.json()
  } catch {
    return { totalInscritos: 0, totalProvincias: 0 }
  }
}

async function getConfiguracoes() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/configuracoes`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default async function HomePage() {
  const [stats, config] = await Promise.all([getStats(), getConfiguracoes()])

  const agora = new Date()
  const dataInicio = config?.dataInicio ? new Date(config.dataInicio) : null
  const dataTermino = config?.dataTermino ? new Date(config.dataTermino) : null

  const inscricoesAbertas = dataInicio && dataTermino
    ? agora >= dataInicio && agora <= dataTermino
    : true

  const inscricoesEncerradas = dataTermino ? agora > dataTermino : false
  const inscricoesAntesDoInicio = dataInicio ? agora < dataInicio : false

  return (
    <div className="min-h-screen flex flex-col">
      {/* Topbar */}

      <header className="bg-inp-navy px-6 py-3 flex items-center justify-between">
        <div>
          <Image src="/logo-inp.png" alt="Logo INP" width={200} height={200} className="object-contain" />
        </div>
        <div className="flex items-center gap-4">
          {inscricoesAbertas && (
            <Link href="/inscricao" className="btn-success text-xs px-4 py-2">
              Inscrever-me
            </Link>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="bg-inp-navy pb-12 pt-10 px-6 text-center">
        {inscricoesAbertas && (
          <p className="text-emerald-400 text-xs uppercase tracking-widest mb-3">Inscrições abertas</p>
        )}
        {inscricoesEncerradas && (
          <p className="text-red-400 text-xs uppercase tracking-widest mb-3">Inscrições encerradas</p>
        )}
        {inscricoesAntesDoInicio && (
          <p className="text-amber-400 text-xs uppercase tracking-widest mb-3">Inscrições em breve</p>
        )}

        <h1 className="text-white text-2xl md:text-3xl font-medium mb-3 leading-tight">
          Teste psicotécnico<br />para ex-estudantes INP
        </h1>
        <p className="text-blue-300 text-sm leading-relaxed max-w-md mx-auto mb-7">
          Processo de avaliação exclusivo para diplomados do Instituto Nacional de Petróleos.
          Inscreva-se, confirme o seu email e aguarde a convocatória.
        </p>

        {/* Contador regressivo */}
        {dataInicio && dataTermino && (
          <ContadorRegressivo
            dataInicio={dataInicio.toISOString()}
            dataTermino={dataTermino.toISOString()}
          />
        )}

        {inscricoesAbertas && (
          <Link href="/inscricao" className="btn-success mx-auto mt-6 inline-flex">
            <ClipboardList size={16} />
            Iniciar inscrição
          </Link>
        )}

        <div className="flex justify-center gap-3 mt-6 flex-wrap">
          <span className="bg-white/10 text-emerald-300 border border-white/20 rounded-full px-3 py-1 text-xs flex items-center gap-1">
            <MapPin size={10} /> Luanda e Sumbe
          </span>
          {dataTermino && !inscricoesEncerradas && (
            <span className="bg-white/10 text-emerald-300 border border-white/20 rounded-full px-3 py-1 text-xs flex items-center gap-1">
              <Calendar size={10} /> Prazo: {dataTermino.toLocaleDateString('pt-AO')}
            </span>
          )}
          <span className="bg-white/10 text-emerald-300 border border-white/20 rounded-full px-3 py-1 text-xs flex items-center gap-1">
            <Users size={10} /> Acesso nacional
          </span>
        </div>
      </section>

      {/* Stats bar */}
      <div className="bg-white border-b border-gray-200 grid grid-cols-3 divide-x divide-gray-200">
        <div className="py-3 px-2 text-center">
          <p className="text-xl font-medium text-gray-900">{stats.totalInscritos.toLocaleString('pt-AO')}</p>
          <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">Inscritos confirmados</p>
        </div>
        <div className="py-3 px-2 text-center">
          <p className="text-xl font-medium text-gray-900">{stats.totalProvincias}</p>
          <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">Províncias</p>
        </div>
        <div className="py-3 px-2 text-center">
          <p className="text-xl font-medium text-gray-900">
            {inscricoesAbertas && dataTermino
              ? Math.max(0, Math.ceil((dataTermino.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24)))
              : '—'}
          </p>
          <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">Dias restantes</p>
        </div>
      </div>

      {/* Como funciona */}
      <section className="px-6 py-10 max-w-2xl mx-auto w-full">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-5">Como funciona</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: ClipboardList, title: 'Preenche o formulário', sub: 'Dados pessoais, académicos e documentos' },
            { icon: Mail, title: 'Confirma o email', sub: 'Link enviado imediatamente' },
            { icon: Clock, title: 'Aguarda a convocatória', sub: 'Notificado por email' },
            { icon: GraduationCap, title: 'Realiza o teste', sub: 'Em Luanda ou Sumbe' },
          ].map((item) => (
            <div key={item.title} className="card flex gap-3 items-start">
              <div className="w-8 h-8 rounded-md bg-inp-blueLt flex items-center justify-center flex-shrink-0">
                <item.icon size={16} className="text-inp-blue" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{item.title}</p>
                <p className="text-xs text-gray-500">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {inscricoesAbertas && (
        <section className="px-6 pb-12 text-center">
          <Link href="/inscricao" className="btn-primary mx-auto">
            Fazer a minha inscrição agora
          </Link>
        </section>
      )}

      <footer className="mt-auto bg-inp-navy py-4 text-center">
        <p className="text-blue-400 text-xs">
          © 2025 Instituto Nacional de Petróleos · inscricoes.inp.co.ao
        </p>
      </footer>
    </div>
  )
}