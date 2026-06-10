// src/services/excel.service.ts
// Usa ExcelJS para gerar ficheiro .xlsx sem dependências pesadas
// npm install exceljs
import ExcelJS from 'exceljs'

export async function gerarExcelCandidatos(candidatos: any[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'INP Psicotécnico'
  workbook.created = new Date()

  const sheet = workbook.addWorksheet('Candidatos', {
    pageSetup: { paperSize: 9, orientation: 'landscape' },
  })

  // Cabeçalhos
  sheet.columns = [
    { header: 'Nome Completo', key: 'nomeCompleto', width: 30 },
    { header: 'Nº Processo', key: 'numeroProcesso', width: 18 },
    { header: 'Email', key: 'email', width: 28 },
    { header: 'Telefone', key: 'telefone', width: 16 },
    { header: 'Género', key: 'genero', width: 14 },
    { header: 'Província', key: 'provincia', width: 16 },
    { header: 'Localização Actual', key: 'localizacaoActual', width: 20 },
    { header: 'Curso', key: 'cursoFrequentado', width: 24 },
    { header: 'Ano Conclusão', key: 'anoConclusao', width: 14 },
    { header: 'Local Teste', key: 'localTeste', width: 12 },
    { header: 'Estado', key: 'estado', width: 14 },
    { header: 'Data Inscrição', key: 'createdAt', width: 18 },
  ]

  // Estilo do cabeçalho
  sheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F2D5A' } }
    cell.alignment = { vertical: 'middle', horizontal: 'center' }
    cell.border = {
      bottom: { style: 'thin', color: { argb: 'FF1D9E75' } },
    }
  })
  sheet.getRow(1).height = 22

  // Dados
  candidatos.forEach((c, i) => {
    const row = sheet.addRow({
      ...c,
      createdAt: new Date(c.createdAt).toLocaleDateString('pt-AO'),
    })
    if (i % 2 === 0) {
      row.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F7FA' } }
      })
    }
  })

  // Auto filter
  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: sheet.columns.length },
  }

  sheet.views = [{ state: 'frozen', ySplit: 1 }]

  const buffer = await workbook.xlsx.writeBuffer()
  return buffer as Buffer
}
