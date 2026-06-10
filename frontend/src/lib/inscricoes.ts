// src/lib/inscricoes.ts
import { api } from './api'

export interface PeriodoInscricao {
  dataInicio: string
  dataTermino: string
}

export type EstadoInscricao = 'antes' | 'aberta' | 'encerrada' | 'sem_configuracao'

export async function getPeriodoInscricao(): Promise<PeriodoInscricao | null> {
  try {
    const data = await api.get('/configuracoes').then((r) => r.data)
    if (!data.dataInicio || !data.dataTermino) return null
    return data
  } catch {
    return null
  }
}

export function getEstadoInscricao(periodo: PeriodoInscricao | null): EstadoInscricao {
  if (!periodo) return 'sem_configuracao'
  const agora = new Date()
  const inicio = new Date(periodo.dataInicio)
  const termino = new Date(periodo.dataTermino)
  if (agora < inicio) return 'antes'
  if (agora > termino) return 'encerrada'
  return 'aberta'
}