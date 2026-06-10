'use client'
// src/components/public/ContadorRegressivo.tsx
import { useEffect, useState } from 'react'

interface Props {
  dataInicio: string
  dataTermino: string
}

interface Tempo {
  dias: number
  horas: number
  minutos: number
  segundos: number
}

function calcularTempo(alvo: Date): Tempo {
  const diff = Math.max(0, alvo.getTime() - new Date().getTime())
  return {
    dias: Math.floor(diff / (1000 * 60 * 60 * 24)),
    horas: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutos: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    segundos: Math.floor((diff % (1000 * 60)) / 1000),
  }
}

export default function ContadorRegressivo({ dataInicio, dataTermino }: Props) {
  const [tempo, setTempo] = useState<Tempo>({ dias: 0, horas: 0, minutos: 0, segundos: 0 })
  const [fase, setFase] = useState<'antes' | 'aberta' | 'encerrada'>('antes')

  useEffect(() => {
    const inicio = new Date(dataInicio)
    const termino = new Date(dataTermino)

    function actualizar() {
      const agora = new Date()
      if (agora < inicio) {
        setFase('antes')
        setTempo(calcularTempo(inicio))
      } else if (agora <= termino) {
        setFase('aberta')
        setTempo(calcularTempo(termino))
      } else {
        setFase('encerrada')
        setTempo({ dias: 0, horas: 0, minutos: 0, segundos: 0 })
      }
    }

    actualizar()
    const interval = setInterval(actualizar, 1000)
    return () => clearInterval(interval)
  }, [dataInicio, dataTermino])

  if (fase === 'encerrada') return null

  return (
    <div className="mb-4">
      <p className="text-blue-300 text-xs mb-3">
        {fase === 'antes' ? 'As inscrições abrem em:' : 'As inscrições encerram em:'}
      </p>
      <div className="flex justify-center gap-3">
        {[
          { valor: tempo.dias, label: 'Dias' },
          { valor: tempo.horas, label: 'Horas' },
          { valor: tempo.minutos, label: 'Min' },
          { valor: tempo.segundos, label: 'Seg' },
        ].map((u) => (
          <div key={u.label} className="flex flex-col items-center">
            <div className="bg-white/10 border border-white/20 rounded-lg w-12 h-12 md:w-14 md:h-14 flex items-center justify-center">
                <span className="text-white text-lg md:text-xl font-medium tabular-nums">
                    {String(u.valor).padStart(2, '0')}
                </span>
            </div>
            <span className="text-blue-400 text-[10px] mt-1">{u.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}