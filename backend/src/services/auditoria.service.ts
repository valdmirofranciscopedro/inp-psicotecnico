// src/services/auditoria.service.ts
import { prisma } from '../config/database'

export async function logAuditoria(
  adminId: string,
  accao: string,
  detalhes?: object,
  ip?: string
) {
  await prisma.auditLog.create({
    data: { adminId, accao, detalhes, ip },
  })
}
