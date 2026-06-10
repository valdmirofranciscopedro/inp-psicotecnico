// src/lib/constants.ts

export const PROVINCIAS = [
  { valor: 'BENGO', nome: 'Bengo' },
  { valor: 'BENGUELA', nome: 'Benguela' },
  { valor: 'BIE', nome: 'Bié' },
  { valor: 'CABINDA', nome: 'Cabinda' },
  { valor: 'CUANDO', nome: 'Cuando' },
  { valor: 'CUANZA_NORTE', nome: 'Cuanza Norte' },
  { valor: 'CUANZA_SUL', nome: 'Cuanza Sul' },
  { valor: 'CUBANGO', nome: 'Cubango' },
  { valor: 'CUNENE', nome: 'Cunene' },
  { valor: 'HUAMBO', nome: 'Huambo' },
  { valor: 'HUILA', nome: 'Huíla' },
  { valor: 'ICOLO_E_BENGO', nome: 'Icolo e Bengo' },
  { valor: 'LUANDA', nome: 'Luanda' },
  { valor: 'LUNDA_NORTE', nome: 'Lunda Norte' },
  { valor: 'LUNDA_SUL', nome: 'Lunda Sul' },
  { valor: 'MALANJE', nome: 'Malanje' },
  { valor: 'MOXICO', nome: 'Moxico' },
  { valor: 'MOXICO_LESTE', nome: 'Moxico Leste' },
  { valor: 'NAMIBE', nome: 'Namibe' },
  { valor: 'UIGE', nome: 'Uíge' },
  { valor: 'ZAIRE', nome: 'Zaire' },
]

export const CURSOS = [
  'Electromecânica',
  'Geologia de Petróleo',
  'Instrumentação',
  'Laboratório de Química',
  'Mecânica Industrial',
  'Minas',
  'Perfuração e Produção',
  'Refinação e Gás',
]

export const ANOS_CONCLUSAO = Array.from(
  { length: new Date().getFullYear() - 1989 },
  (_, i) => String(new Date().getFullYear() - i)
)