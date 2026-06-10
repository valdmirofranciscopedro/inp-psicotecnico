// src/config/upload.ts
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'
import { env } from './env'

// Tipos MIME permitidos
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
]

// Garantir que a pasta de uploads existe
const uploadDir = path.resolve(env.UPLOAD_DIR)
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir)
  },
  filename: (_req, file, cb) => {
    // Usar UUID para evitar nomes previsíveis
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, `${uuidv4()}${ext}`)
  },
})

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error(`Tipo de ficheiro não permitido: ${file.mimetype}. Use PDF, JPG ou PNG.`))
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.UPLOAD_MAX_SIZE_MB * 1024 * 1024,
    files: 3, // BI + Certificado + CV
  },
})

// Middleware para upload dos 3 documentos obrigatórios
export const uploadDocumentos = upload.fields([
  { name: 'bilheteIdentidade', maxCount: 1 },
  { name: 'certificadoHabilitacoes', maxCount: 1 },
  { name: 'curriculumVitae', maxCount: 1 },
])
