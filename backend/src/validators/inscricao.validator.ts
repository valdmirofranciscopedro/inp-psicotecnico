// src/validators/inscricao.validator.ts
import { z } from 'zod'

export const inscricaoSchema = z.object({
  nomeCompleto: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').max(120),
  numeroProcesso: z.string().min(3, 'Nº de processo inválido').max(30),
  email: z.string().email('Email inválido'),
  telefone: z.string().min(9, 'Número de telefone inválido').max(20),
  telefoneAlternativo: z.string().max(20).optional().or(z.literal('')),
  bilheteIdentidade: z.string().min(5, 'BI inválido').max(20),
  genero: z.enum(['MASCULINO', 'FEMININO']),
  provincia: z.enum([
    'BENGO', 'BENGUELA', 'BIE', 'CABINDA', 'CUANDO',
    'CUANZA_NORTE', 'CUANZA_SUL', 'CUBANGO', 'CUNENE', 'HUAMBO',
    'HUILA', 'ICOLO_E_BENGO', 'LUANDA', 'LUNDA_NORTE', 'LUNDA_SUL',
    'MALANJE', 'MOXICO', 'MOXICO_LESTE', 'NAMIBE', 'UIGE', 'ZAIRE',
  ]),
  localizacaoActual: z.string().min(2).max(120),
  cursoFrequentado: z.string().min(2).max(120),
  anoConclusao: z.coerce.number().int().min(1990).max(new Date().getFullYear()),
  localTeste: z.enum(['LUANDA', 'SUMBE']),
})

export const reenviarSchema = z.object({
  email: z.string().email('Email inválido'),
})

export type InscricaoInput = z.infer<typeof inscricaoSchema>
