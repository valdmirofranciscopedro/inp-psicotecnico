// src/lib/constants.ts

export const PROVINCIAS = [
  { valor: 'BENGO', nome: 'Bengo' },
  { valor: 'BENGUELA', nome: 'Benguela' },
  { valor: 'BIE', nome: 'Bié' },
  { valor: 'CABINDA', nome: 'Cabinda' },
  { valor: 'CUANDO_CUBANGO', nome: 'Cuando Cubango' },
  { valor: 'CUANZA_NORTE', nome: 'Cuanza Norte' },
  { valor: 'CUANZA_SUL', nome: 'Cuanza Sul' },
  { valor: 'CUNENE', nome: 'Cunene' },
  { valor: 'HUAMBO', nome: 'Huambo' },
  { valor: 'HUILA', nome: 'Huíla' },
  { valor: 'LUANDA', nome: 'Luanda' },
  { valor: 'LUNDA_NORTE', nome: 'Lunda Norte' },
  { valor: 'LUNDA_SUL', nome: 'Lunda Sul' },
  { valor: 'MALANJE', nome: 'Malanje' },
  { valor: 'MOXICO', nome: 'Moxico' },
  { valor: 'NAMIBE', nome: 'Namibe' },
  { valor: 'UIGE', nome: 'Uíge' },
  { valor: 'ZAIRE', nome: 'Zaire' },
]

export const CURSOS = [
  'Engenharia de Petróleos',
  'Engenharia Química',
  'Engenharia Electrotécnica',
  'Engenharia Mecânica',
  'Engenharia de Minas',
  'Gestão Petrolífera',
  'Informática e Gestão',
  'Contabilidade e Gestão',
  'Geologia',
  'Ambiente e Segurança Industrial',
  'Outro',
]

export const ANOS_CONCLUSAO = Array.from(
  { length: new Date().getFullYear() - 1989 },
  (_, i) => String(new Date().getFullYear() - i)
)
