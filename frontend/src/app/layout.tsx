// src/app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Inscrição — Teste Psicotécnico INP',
  description: 'Plataforma de inscrição para o teste psicotécnico exclusivo para ex-estudantes do Instituto Nacional de Petróleos de Angola.',
  metadataBase: new URL('https://inscricoes.inp.co.ao'),
  openGraph: {
    title: 'Teste Psicotécnico INP 2025',
    description: 'Inscrições abertas para ex-estudantes do INP.',
    locale: 'pt_AO',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body>{children}</body>
    </html>
  )
}
