// src/app/page.tsx
import Link from 'next/link'
import { ClipboardList, Mail, Clock, GraduationCap, MapPin, Calendar, Users } from 'lucide-react'

async function getStats() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/stats`, {
      next: { revalidate: 300 }, // cache 5 min
    })
    if (!res.ok) return { totalInscritos: 0, totalProvincias: 0 }
    return res.json()
  } catch {
    return { totalInscritos: 0, totalProvincias: 0 }
  }
}

function diasRestantes() {
  const prazo = new Date('2025-06-30')
  const hoje = new Date()
  const diff = Math.ceil((prazo.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
}

export default async function HomePage() {
  const stats = await getStats()
  const dias = diasRestantes()

  return (
    <div className="min-h-screen flex flex-col">
      {/* Topbar */}
      <header className="bg-inp-navy px-6 py-3 flex items-center justify-between">
        <div>
          <p className="text-white text-sm font-medium">INP · Teste Psicotécnico 2025</p>
          <p className="text-blue-300 text-xs">Instituto Nacional de Petróleos</p>
        </div>
        <Link href="/inscricao" className="btn-success text-xs px-4 py-2">
          Inscrever-me
        </Link>
      </header>

      {/* Hero */}
      <section className="bg-inp-navy pb-12 pt-10 px-6 text-center">
        <p className="text-emerald-400 text-xs uppercase tracking-widest mb-3">Inscrições abertas</p>
        <h1 className="text-white text-2xl md:text-3xl font-medium mb-3 leading-tight">
          Teste psicotécnico<br />para ex-estudantes INP
        </h1>
        <p className="text-blue-300 text-sm leading-relaxed max-w-md mx-auto mb-7">
          Processo de avaliação exclusivo para diplomados do Instituto Nacional de Petróleos.
          Inscreva-se, confirme o seu email e aguarde a convocatória.
        </p>
        <Link href="/inscricao" className="btn-success mx-auto">
          <ClipboardList size={16} />
          Iniciar inscrição
        </Link>
        <div className="flex justify-center gap-3 mt-6 flex-wrap">
          <span className="bg-white/10 text-emerald-300 border border-white/20 rounded-full px-3 py-1 text-xs flex items-center gap-1">
            <MapPin size={10} /> Luanda e Sumbe
          </span>
          <span className="bg-white/10 text-emerald-300 border border-white/20 rounded-full px-3 py-1 text-xs flex items-center gap-1">
            <Calendar size={10} /> Prazo: 30 Jun 2025
          </span>
          <span className="bg-white/10 text-emerald-300 border border-white/20 rounded-full px-3 py-1 text-xs flex items-center gap-1">
            <Users size={10} /> Acesso nacional
          </span>
        </div>
      </section>

      {/* Stats bar */}
      <div className="bg-white border-b border-gray-200 grid grid-cols-3">
        <div className="py-4 text-center border-r border-gray-200">
          <p className="text-2xl font-medium text-gray-900">{stats.totalInscritos.toLocaleString('pt-AO')}</p>
          <p className="text-xs text-gray-500 mt-0.5">Inscritos confirmados</p>
        </div>
        <div className="py-4 text-center border-r border-gray-200">
          <p className="text-2xl font-medium text-gray-900">{stats.totalProvincias}</p>
          <p className="text-xs text-gray-500 mt-0.5">Províncias representadas</p>
        </div>
        <div className="py-4 text-center">
          <p className="text-2xl font-medium text-gray-900">{dias}</p>
          <p className="text-xs text-gray-500 mt-0.5">Dias restantes</p>
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

      {/* CTA final */}
      <section className="px-6 pb-12 text-center">
        <Link href="/inscricao" className="btn-primary mx-auto">
          Fazer a minha inscrição agora
        </Link>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-inp-navy py-4 text-center">
        <p className="text-blue-400 text-xs">
          © 2025 Instituto Nacional de Petróleos · inscricoes.inp.co.ao
        </p>
      </footer>
    </div>
  )
}
