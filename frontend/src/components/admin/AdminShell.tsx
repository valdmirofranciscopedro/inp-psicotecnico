'use client'
// src/components/admin/AdminShell.tsx
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Users, BarChart2, Mail, Download,
  Shield, Settings, LogOut, Menu, X, ChevronRight,
} from 'lucide-react'

const NAV = [
  { grupo: 'Geral', items: [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/candidatos', label: 'Candidatos', icon: Users },
    { href: '/admin/estatisticas', label: 'Estatísticas', icon: BarChart2 },
  ]},
  { grupo: 'Gestão', items: [
    { href: '/admin/emails', label: 'Emails', icon: Mail },
    { href: '/admin/exportar', label: 'Exportar dados', icon: Download },
    { href: '/admin/auditoria', label: 'Auditoria', icon: Shield },
  ]},
  { grupo: 'Sistema', items: [
    { href: '/admin/configuracoes', label: 'Configurações', icon: Settings },
  ]},
]

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarAberta, setSidebarAberta] = useState(false)
  const [admin, setAdmin] = useState<{ nome: string; email: string } | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('inp_admin_token')
    if (!token) { router.push('/admin/login'); return }
    const user = localStorage.getItem('inp_admin_user')
    if (user) setAdmin(JSON.parse(user))
  }, [router])

  function sair() {
    localStorage.removeItem('inp_admin_token')
    localStorage.removeItem('inp_admin_user')
    router.push('/admin/login')
  }

  if (!admin) return null

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-white/10">
        <p className="text-white text-sm font-medium">INP · Admin</p>
        <p className="text-blue-400 text-xs mt-0.5">Painel administrativo</p>
        <span className="inline-block mt-1.5 bg-white/10 text-emerald-300 text-[10px] rounded px-1.5 py-0.5 tracking-wide">
          RESTRITO
        </span>
      </div>

      {/* Navegação */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {NAV.map((grupo) => (
          <div key={grupo.grupo} className="mb-1">
            <p className="text-[10px] text-blue-500/70 uppercase tracking-wider px-4 py-2 font-medium">
              {grupo.grupo}
            </p>
            {grupo.items.map((item) => {
              const activo = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarAberta(false)}
                  className={`flex items-center gap-2.5 px-4 py-2 text-sm transition-colors mx-2 rounded-lg
                    ${activo
                      ? 'bg-white/10 text-white font-medium'
                      : 'text-blue-300 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  <item.icon size={16} />
                  {item.label}
                  {activo && <ChevronRight size={12} className="ml-auto" />}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Utilizador + sair */}
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-7 h-7 rounded-full bg-inp-blue flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
            {admin.nome.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-medium truncate">{admin.nome}</p>
            <p className="text-blue-400 text-[10px] truncate">{admin.email}</p>
          </div>
        </div>
        <button
          onClick={sair}
          className="flex items-center gap-2 text-blue-400 hover:text-white text-xs transition-colors w-full"
        >
          <LogOut size={14} /> Terminar sessão
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex w-52 flex-col bg-inp-navyDk flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Sidebar mobile (drawer) */}
      {sidebarAberta && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarAberta(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-56 bg-inp-navyDk flex flex-col">
            <div className="flex justify-end p-3">
              <button onClick={() => setSidebarAberta(false)} className="text-white">
                <X size={20} />
              </button>
            </div>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="bg-inp-navy px-4 py-2.5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden text-white"
              onClick={() => setSidebarAberta(true)}
              aria-label="Abrir menu"
            >
              <Menu size={20} />
            </button>
            <p className="text-white text-sm font-medium hidden md:block">
              INP · Painel Administrativo
            </p>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-blue-300 text-xs hidden sm:block">{admin.email}</p>
            <div className="w-7 h-7 rounded-full bg-inp-blue flex items-center justify-center text-white text-xs font-medium">
              {admin.nome.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Área de conteúdo */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
