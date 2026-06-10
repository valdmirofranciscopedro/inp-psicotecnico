'use client'
// src/app/inscricao/page.tsx
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { CheckCircle, ChevronRight, ChevronLeft, Upload, X, FileText } from 'lucide-react'
import axios from 'axios'
import { PROVINCIAS, CURSOS, ANOS_CONCLUSAO } from '@/lib/constants'
import { getPeriodoInscricao, getEstadoInscricao } from '@/lib/inscricoes'

// ─── Schema de validação ────────────────────────────────
const schema = z.object({
  // Passo 1
  nomeCompleto: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  numeroProcesso: z.string().min(3, 'Nº de processo inválido'),
  bilheteIdentidade: z.string().min(5, 'BI inválido'),
  genero: z.enum(['MASCULINO', 'FEMININO', 'OUTRO', 'PREFIRO_NAO_INFORMAR'], { required_error: 'Seleccione o género' }),
  email: z.string().email('Email inválido'),
  telefone: z.string().min(9, 'Número inválido'),
  telefoneAlternativo: z.string().optional(),
  provincia: z.string().min(1, 'Seleccione a província'),
  localizacaoActual: z.string().min(2, 'Indique a localização actual'),
  // Passo 2
  cursoFrequentado: z.string().min(1, 'Seleccione o curso'),
  anoConclusao: z.string().min(1, 'Seleccione o ano'),
  localTeste: z.enum(['LUANDA', 'SUMBE'], { required_error: 'Seleccione o local' }),
})

type FormData = z.infer<typeof schema>

interface Ficheiro {
  file: File
  nome: string
  tamanho: string
}

// ─── Componente de upload de ficheiro ──────────────────
function UploadFicheiro({
  label,
  obrigatorio,
  ficheiro,
  onFicheiro,
  onRemover,
}: {
  label: string
  obrigatorio?: boolean
  ficheiro: Ficheiro | null
  onFicheiro: (f: Ficheiro) => void
  onRemover: () => void
}) {
  const maxMB = 10
  const TIPOS = ['application/pdf', 'image/jpeg', 'image/png']

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!TIPOS.includes(file.type)) {
      alert('Apenas PDF, JPG ou PNG são aceites.')
      return
    }
    if (file.size > maxMB * 1024 * 1024) {
      alert(`O ficheiro não pode exceder ${maxMB}MB.`)
      return
    }
    onFicheiro({
      file,
      nome: file.name,
      tamanho: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
    })
    e.target.value = ''
  }

  if (ficheiro) {
    return (
      <div className="border border-inp-green bg-inp-greenLt rounded-lg px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-inp-green flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-emerald-800 truncate max-w-[200px]">{ficheiro.nome}</p>
            <p className="text-xs text-emerald-600">{ficheiro.tamanho}</p>
          </div>
        </div>
        <button type="button" onClick={onRemover} className="text-emerald-700 hover:text-red-500 transition-colors ml-2">
          <X size={16} />
        </button>
      </div>
    )
  }

  return (
    <label className="border-2 border-dashed border-gray-300 rounded-lg px-4 py-5 flex flex-col items-center justify-center cursor-pointer hover:border-inp-blue hover:bg-inp-blueLt/40 transition-colors group">
      <Upload size={20} className="text-gray-400 group-hover:text-inp-blue mb-2" />
      <p className="text-sm text-gray-600 text-center">
        <span className="font-medium text-inp-blue">{label}</span>
        {obrigatorio && <span className="text-red-500 ml-1">*</span>}
      </p>
      <p className="text-xs text-gray-400 mt-1">PDF, JPG ou PNG · máx. {maxMB}MB</p>
      <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleChange} />
    </label>
  )
}

// ─── Wizard steps indicator ─────────────────────────────
function StepIndicator({ passo }: { passo: number }) {
  const passos = ['Dados pessoais', 'Dados académicos', 'Documentos']
  return (
    <div className="flex items-center gap-0">
      {passos.map((label, i) => {
        const num = i + 1
        const done = passo > num
        const active = passo === num
        return (
          <div key={label} className="flex items-center">
            <div className={`flex items-center gap-1.5 text-xs ${active ? 'text-inp-blue font-medium' : done ? 'text-inp-green' : 'text-gray-400'}`}>
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-medium flex-shrink-0
                ${active ? 'bg-inp-blueLt border-inp-blue text-inp-blue' : done ? 'bg-inp-greenLt border-inp-green text-inp-green' : 'border-gray-300 text-gray-400'}`}>
                {done ? <CheckCircle size={12} /> : num}
              </div>
              <span className="hidden sm:inline">{label}</span>
            </div>
            {i < passos.length - 1 && (
              <div className={`h-px w-6 sm:w-10 mx-1.5 ${done ? 'bg-inp-green' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Página principal ────────────────────────────────────
export default function InscricaoPage() {
  const [passo, setPasso] = useState(1)
  const [submetido, setSubmetido] = useState(false)
  const [erroBD, setErroBD] = useState('')
  const [loading, setLoading] = useState(false)
  const [estadoPeriodo, setEstadoPeriodo] = useState<string | null>(null)
  const [periodo, setPeriodo] = useState<any>(null)

  const [docBI, setDocBI] = useState<Ficheiro | null>(null)
  const [docCert, setDocCert] = useState<Ficheiro | null>(null)
  const [docCV, setDocCV] = useState<Ficheiro | null>(null)

  const router = useRouter()

  const { register, handleSubmit, formState: { errors }, watch, trigger } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    getPeriodoInscricao().then((p) => {
      setPeriodo(p)
      setEstadoPeriodo(getEstadoInscricao(p))
    })
  }, [])

  // Mostrar ecrã de bloqueio se fora do período
  if (estadoPeriodo === 'antes' && periodo) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-inp-navy px-6 py-3">
          <p className="text-white text-sm font-medium">INP · Inscrição no teste psicotécnico</p>
        </header>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="card max-w-md w-full text-center">
            <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⏳</span>
            </div>
            <h2 className="text-lg font-medium text-gray-900 mb-2">Inscrições ainda não abertas</h2>
            <p className="text-sm text-gray-500 mb-4">
              As inscrições abrem a{' '}
              <strong>{new Date(periodo.dataInicio).toLocaleDateString('pt-AO', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong>.
            </p>
            <a href="/" className="btn-secondary mx-auto">Voltar à página inicial</a>
          </div>
        </div>
      </div>
    )
  }

  if (estadoPeriodo === 'encerrada') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-inp-navy px-6 py-3">
          <p className="text-white text-sm font-medium">INP · Inscrição no teste psicotécnico</p>
        </header>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="card max-w-md w-full text-center">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔒</span>
            </div>
            <h2 className="text-lg font-medium text-gray-900 mb-2">Inscrições encerradas</h2>
            <p className="text-sm text-gray-500 mb-4">
              O prazo de inscrição terminou a{' '}
              <strong>{new Date(periodo.dataTermino).toLocaleDateString('pt-AO', { day: '2-digit', month: 'long', year: 'numeric' })}</strong>.
            </p>
            <a href="/" className="btn-secondary mx-auto">Voltar à página inicial</a>
          </div>
        </div>
      </div>
    )
  }

  async function irParaPasso2() {
    const valido = await trigger(['nomeCompleto', 'numeroProcesso', 'bilheteIdentidade', 'genero', 'email', 'telefone', 'provincia', 'localizacaoActual'])
    if (valido) setPasso(2)
  }

  async function irParaPasso3() {
    const valido = await trigger(['cursoFrequentado', 'anoConclusao', 'localTeste'])
    if (valido) setPasso(3)
  }

  async function onSubmit(dados: FormData) {
    if (!docBI) { setErroBD('O Bilhete de Identidade é obrigatório.'); return }
    if (!docCert) { setErroBD('O Certificado de Habilitações é obrigatório.'); return }
    if (!docCV) { setErroBD('O Curriculum Vitae é obrigatório.'); return }

    setLoading(true)
    setErroBD('')

    const formData = new FormData()
    Object.entries(dados).forEach(([k, v]) => { if (v) formData.append(k, v) })
    formData.append('bilheteIdentidade', docBI.file)
    formData.append('certificadoHabilitacoes', docCert.file)
    formData.append('curriculumVitae', docCV.file)

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/inscricao/submeter`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setSubmetido(true)
    } catch (err: any) {
      setErroBD(err.response?.data?.error || 'Erro ao submeter. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (submetido) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-inp-navy px-6 py-3">
          <p className="text-white text-sm font-medium">INP · Inscrição no teste psicotécnico</p>
        </header>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="card max-w-md w-full text-center">
            <div className="w-14 h-14 rounded-full bg-inp-greenLt flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={28} className="text-inp-green" />
            </div>
            <h2 className="text-lg font-medium text-gray-900 mb-2">Verifique o seu email</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Enviámos um link de confirmação para o seu email. Clique no link para activar a sua inscrição.
            </p>
            <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 rounded-full px-3 py-1 text-xs mt-4">
              ⏱ Pendente de confirmação
            </span>
            <div className="mt-5 bg-gray-50 rounded-lg p-4 text-left">
              <p className="text-xs text-gray-500 mb-2">Não recebeu o email?</p>
              <button className="text-sm text-inp-blue flex items-center gap-1.5 hover:underline">
                Reenviar email de confirmação
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-4">O link expira em 48 horas.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-inp-navy px-6 py-3">
        <p className="text-white text-sm font-medium">INP · Inscrição no teste psicotécnico</p>
      </header>

      <div className="flex-1 flex items-start justify-center p-4 md:p-8">
        <div className="w-full max-w-xl">
          {/* Indicador de passos */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
            <StepIndicator passo={passo} />
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="card">
              {/* ─── PASSO 1: Dados pessoais ─────────────── */}
              {passo === 1 && (
                <div>
                  <h2 className="text-base font-medium text-gray-900 mb-4">Dados pessoais</h2>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="col-span-2">
                      <label className="form-label">Nome completo <span className="text-red-500">*</span></label>
                      <input className={`form-input ${errors.nomeCompleto ? 'form-input-error' : ''}`} {...register('nomeCompleto')} placeholder="Ex: João Manuel Ferreira" />
                      {errors.nomeCompleto && <p className="form-error">{errors.nomeCompleto.message}</p>}
                    </div>
                    <div>
                      <label className="form-label">Nº de processo <span className="text-red-500">*</span></label>
                      <input className={`form-input ${errors.numeroProcesso ? 'form-input-error' : ''}`} {...register('numeroProcesso')} placeholder="Ex. 4321" />
                      {errors.numeroProcesso && <p className="form-error">{errors.numeroProcesso.message}</p>}
                    </div>
                    <div>
                      <label className="form-label">Bilhete de Identidade <span className="text-red-500">*</span></label>
                      <input className={`form-input ${errors.bilheteIdentidade ? 'form-input-error' : ''}`} {...register('bilheteIdentidade')} placeholder="Ex: 005421897LA041" />
                      {errors.bilheteIdentidade && <p className="form-error">{errors.bilheteIdentidade.message}</p>}
                    </div>
                    <div>
                      <label className="form-label">Género <span className="text-red-500">*</span></label>
                      <select className={`form-input ${errors.genero ? 'form-input-error' : ''}`} {...register('genero')}>
                        <option value="">Seleccione...</option>
                        <option value="MASCULINO">Masculino</option>
                        <option value="FEMININO">Feminino</option>
                      </select>
                      {errors.genero && <p className="form-error">{errors.genero.message}</p>}
                    </div>
                    <div>
                      <label className="form-label">Email <span className="text-red-500">*</span></label>
                      <input type="email" className={`form-input ${errors.email ? 'form-input-error' : ''}`} {...register('email')} placeholder="email@exemplo.com" />
                      {errors.email && <p className="form-error">{errors.email.message}</p>}
                    </div>
                    <div>
                      <label className="form-label">Telefone <span className="text-red-500">*</span></label>
                      <input className={`form-input ${errors.telefone ? 'form-input-error' : ''}`} {...register('telefone')} placeholder="+244 9xx xxx xxx" />
                      {errors.telefone && <p className="form-error">{errors.telefone.message}</p>}
                    </div>
                    <div className="col-span-2">
                      <label className="form-label">Telefone alternativo <span className="text-xs text-gray-400">(opcional)</span></label>
                      <input className="form-input" {...register('telefoneAlternativo')} placeholder="+244 9xx xxx xxx" />
                    </div>
                    <div>
                      <label className="form-label">Província <span className="text-red-500">*</span></label>
                      <select className={`form-input ${errors.provincia ? 'form-input-error' : ''}`} {...register('provincia')}>
                        <option value="">Seleccione...</option>
                        {PROVINCIAS.map((p) => <option key={p.valor} value={p.valor}>{p.nome}</option>)}
                      </select>
                      {errors.provincia && <p className="form-error">{errors.provincia.message}</p>}
                    </div>
                    <div>
                      <label className="form-label">Localização actual <span className="text-red-500">*</span></label>
                      <input className={`form-input ${errors.localizacaoActual ? 'form-input-error' : ''}`} {...register('localizacaoActual')} placeholder="Ex: Luanda, Viana" />
                      {errors.localizacaoActual && <p className="form-error">{errors.localizacaoActual.message}</p>}
                    </div>
                  </div>
                  <div className="flex justify-end pt-3 border-t border-gray-100">
                    <button type="button" className="btn-primary" onClick={irParaPasso2}>
                      Próximo <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* ─── PASSO 2: Dados académicos + preferências ─ */}
              {passo === 2 && (
                <div>
                  <h2 className="text-base font-medium text-gray-900 mb-4">Dados académicos</h2>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="form-label">Curso que frequentou <span className="text-red-500">*</span></label>
                      <select className={`form-input ${errors.cursoFrequentado ? 'form-input-error' : ''}`} {...register('cursoFrequentado')}>
                        <option value="">Seleccione...</option>
                        {CURSOS.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                      {errors.cursoFrequentado && <p className="form-error">{errors.cursoFrequentado.message}</p>}
                    </div>
                    <div>
                      <label className="form-label">Ano de conclusão <span className="text-red-500">*</span></label>
                      <select className={`form-input ${errors.anoConclusao ? 'form-input-error' : ''}`} {...register('anoConclusao')}>
                        <option value="">Seleccione...</option>
                        {ANOS_CONCLUSAO.map((a) => <option key={a} value={a}>{a}</option>)}
                      </select>
                      {errors.anoConclusao && <p className="form-error">{errors.anoConclusao.message}</p>}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label mb-2 block">Preferência de local de teste <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-2 gap-3">
                      {(['LUANDA', 'SUMBE'] as const).map((local) => {
                        const sel = watch('localTeste') === local
                        return (
                          <label key={local} className={`border rounded-lg p-4 cursor-pointer transition-all ${sel ? 'border-inp-blue bg-inp-blueLt' : 'border-gray-200 hover:border-gray-300'}`}>
                            <input type="radio" value={local} {...register('localTeste')} className="hidden" />
                            <div className="flex items-center gap-2 mb-1">
                              <div className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 ${sel ? 'border-inp-blue bg-inp-blue' : 'border-gray-300'}`} />
                              <span className={`text-sm font-medium ${sel ? 'text-inp-blue' : 'text-gray-700'}`}>{local === 'LUANDA' ? 'Luanda' : 'Sumbe'}</span>
                            </div>
                            <p className={`text-xs ${sel ? 'text-blue-600' : 'text-gray-400'}`}>
                              {local === 'LUANDA' ? 'Centro de testes principal' : 'Centro regional — Kwanza Sul'}
                            </p>
                          </label>
                        )
                      })}
                    </div>
                    {errors.localTeste && <p className="form-error mt-1">{errors.localTeste.message}</p>}
                  </div>

                  <div className="flex justify-between pt-3 border-t border-gray-100">
                    <button type="button" className="btn-secondary" onClick={() => setPasso(1)}>
                      <ChevronLeft size={16} /> Anterior
                    </button>
                    <button type="button" className="btn-primary" onClick={irParaPasso3}>
                      Próximo <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* ─── PASSO 3: Upload de documentos ──────────── */}
              {passo === 3 && (
                <div>
                  <h2 className="text-base font-medium text-gray-900 mb-1">Documentos obrigatórios</h2>
                  <p className="text-xs text-gray-400 mb-5">Aceites: PDF, JPG ou PNG · Máx. 10MB por ficheiro</p>

                  <div className="space-y-3 mb-5">
                    <div>
                      <p className="form-label">Bilhete de Identidade <span className="text-red-500">*</span></p>
                      <UploadFicheiro
                        label="Clique para anexar o BI"
                        obrigatorio
                        ficheiro={docBI}
                        onFicheiro={setDocBI}
                        onRemover={() => setDocBI(null)}
                      />
                    </div>
                    <div>
                      <p className="form-label">Certificado de Habilitações (INP) <span className="text-red-500">*</span></p>
                      <UploadFicheiro
                        label="Clique para anexar o Certificado"
                        obrigatorio
                        ficheiro={docCert}
                        onFicheiro={setDocCert}
                        onRemover={() => setDocCert(null)}
                      />
                    </div>
                    <div>
                      <p className="form-label">Curriculum Vitae <span className="text-red-500">*</span></p>
                      <UploadFicheiro
                        label="Clique para anexar o CV"
                        obrigatorio
                        ficheiro={docCV}
                        onFicheiro={setDocCV}
                        onRemover={() => setDocCV(null)}
                      />
                    </div>
                  </div>

                  {erroBD && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 mb-4">
                      {erroBD}
                    </div>
                  )}

                  <div className="flex justify-between pt-3 border-t border-gray-100">
                    <button type="button" className="btn-secondary" onClick={() => setPasso(2)}>
                      <ChevronLeft size={16} /> Anterior
                    </button>
                    <button type="submit" className="btn-success" disabled={loading}>
                      {loading ? 'A enviar...' : 'Submeter inscrição'}
                      {!loading && <ChevronRight size={16} />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
