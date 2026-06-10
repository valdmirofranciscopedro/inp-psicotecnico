// src/lib/api.ts
import axios from 'axios'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
})

// Injectar token JWT em todas as chamadas autenticadas
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('inp_admin_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Redirecionar para login se o token expirar
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      const isAdminRoute = window.location.pathname.startsWith('/admin')
      if (isAdminRoute && window.location.pathname !== '/admin/login') {
        localStorage.removeItem('inp_admin_token')
        window.location.href = '/admin/login'
      }
    }
    return Promise.reject(err)
  }
)

// ─── Funções da API ─────────────────────────────────────

// Público
export const getStatsPublicas = () =>
  api.get('/public/stats').then((r) => r.data)

// Inscrição
export const verificarDuplicado = (data: { numeroProcesso?: string; bilheteIdentidade?: string }) =>
  api.post('/inscricao/verificar-duplicado', data).then((r) => r.data)

export const submeterInscricao = (formData: FormData) =>
  api.post('/inscricao/submeter', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data)

export const confirmarEmailToken = (token: string) =>
  api.get(`/inscricao/confirmar/${token}`).then((r) => r.data)

export const reenviarConfirmacao = (email: string) =>
  api.post('/inscricao/reenviar-confirmacao', { email }).then((r) => r.data)

// Auth admin
export const loginAdmin = (email: string, password: string) =>
  api.post('/auth/login', { email, password }).then((r) => r.data)

export const logoutAdmin = () =>
  api.post('/auth/logout').then((r) => r.data)

export const getMeAdmin = () =>
  api.get('/auth/me').then((r) => r.data)

// Admin — dashboard
export const getDashboard = () =>
  api.get('/admin/dashboard').then((r) => r.data)

// Admin — candidatos
export const listarCandidatos = (params: Record<string, string>) =>
  api.get('/admin/candidatos', { params }).then((r) => r.data)

export const getCandidato = (id: string) =>
  api.get(`/admin/candidatos/${id}`).then((r) => r.data)

export const confirmarInscricao = (id: string) =>
  api.patch(`/admin/candidatos/${id}/confirmar`).then((r) => r.data)

export const revogarInscricao = (id: string, motivo?: string) =>
  api.patch(`/admin/candidatos/${id}/revogar`, { motivo }).then((r) => r.data)

export const reenviarEmailAdmin = (id: string) =>
  api.post(`/admin/candidatos/${id}/reenviar-email`).then((r) => r.data)

export const exportarCandidatos = (params: Record<string, string>) =>
  api.get('/admin/exportar', { params, responseType: 'blob' }).then((r) => r.data)

export const getAuditLogs = (pagina = 1) =>
  api.get('/admin/auditoria', { params: { pagina } }).then((r) => r.data)
