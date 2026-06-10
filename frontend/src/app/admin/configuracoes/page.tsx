'use client'
import AdminShell from '@/components/admin/AdminShell'
import { useState, useEffect } from 'react'
import { getMeAdmin } from '@/lib/api'
import { Settings, User, Shield } from 'lucide-react'

export default function ConfiguracoesPage() {
  const [admin, setAdmin] = useState<any>(null)

  useEffect(() => {
    getMeAdmin().then(setAdmin)
  }, [])

  return (
    <AdminShell>
      <div className="max-w-xl mx-auto space-y-5">
        <div>
          <h1 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <Settings size={18} className="text-gray-400" /> Configurações
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">Informações da conta e do sistema</p>
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

        <div className="card bg-amber-50 border-amber-200">
          <p className="text-xs text-amber-700 font-medium mb-1">⚠️ Alterar password</p>
          <p className="text-xs text-amber-600">Para alterar a password do administrador, acede directamente à base de dados ou contacta o suporte técnico.</p>
        </div>
      </div>
    </AdminShell>
  )
}