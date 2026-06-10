-- CreateEnum
CREATE TYPE "Genero" AS ENUM ('MASCULINO', 'FEMININO', 'OUTRO', 'PREFIRO_NAO_INFORMAR');

-- CreateEnum
CREATE TYPE "Provincia" AS ENUM ('BENGO', 'BENGUELA', 'BIE', 'CABINDA', 'CUANDO_CUBANGO', 'CUANZA_NORTE', 'CUANZA_SUL', 'CUNENE', 'HUAMBO', 'HUILA', 'LUANDA', 'LUNDA_NORTE', 'LUNDA_SUL', 'MALANJE', 'MOXICO', 'NAMIBE', 'UIGE', 'ZAIRE');

-- CreateEnum
CREATE TYPE "LocalTeste" AS ENUM ('LUANDA', 'SUMBE');

-- CreateEnum
CREATE TYPE "EstadoInscricao" AS ENUM ('PENDENTE', 'CONFIRMADO', 'REVOGADO');

-- CreateEnum
CREATE TYPE "TipoDocumento" AS ENUM ('BILHETE_IDENTIDADE', 'CERTIFICADO_HABILITACOES', 'CURRICULUM_VITAE');

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidatos" (
    "id" TEXT NOT NULL,
    "nomeCompleto" TEXT NOT NULL,
    "numeroProcesso" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "telefoneAlternativo" TEXT,
    "bilheteIdentidade" TEXT NOT NULL,
    "genero" "Genero" NOT NULL,
    "provincia" "Provincia" NOT NULL,
    "localizacaoActual" TEXT NOT NULL,
    "cursoFrequentado" TEXT NOT NULL,
    "anoConclusao" INTEGER NOT NULL,
    "localTeste" "LocalTeste" NOT NULL,
    "estado" "EstadoInscricao" NOT NULL DEFAULT 'PENDENTE',
    "emailConfirmado" BOOLEAN NOT NULL DEFAULT false,
    "tokenConfirmacao" TEXT,
    "tokenExpiracao" TIMESTAMP(3),
    "emailConfirmadoEm" TIMESTAMP(3),
    "biHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidatos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentos" (
    "id" TEXT NOT NULL,
    "candidatoId" TEXT NOT NULL,
    "tipo" "TipoDocumento" NOT NULL,
    "nomeOriginal" TEXT NOT NULL,
    "nomeFicheiro" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "tamanhoBytes" INTEGER NOT NULL,
    "caminho" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "accao" TEXT NOT NULL,
    "detalhes" JSONB,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "candidatos_numeroProcesso_key" ON "candidatos"("numeroProcesso");

-- CreateIndex
CREATE UNIQUE INDEX "candidatos_email_key" ON "candidatos"("email");

-- CreateIndex
CREATE UNIQUE INDEX "candidatos_bilheteIdentidade_key" ON "candidatos"("bilheteIdentidade");

-- CreateIndex
CREATE UNIQUE INDEX "candidatos_tokenConfirmacao_key" ON "candidatos"("tokenConfirmacao");

-- CreateIndex
CREATE UNIQUE INDEX "candidatos_biHash_key" ON "candidatos"("biHash");

-- CreateIndex
CREATE INDEX "candidatos_provincia_idx" ON "candidatos"("provincia");

-- CreateIndex
CREATE INDEX "candidatos_estado_idx" ON "candidatos"("estado");

-- CreateIndex
CREATE INDEX "candidatos_localTeste_idx" ON "candidatos"("localTeste");

-- CreateIndex
CREATE INDEX "candidatos_cursoFrequentado_idx" ON "candidatos"("cursoFrequentado");

-- CreateIndex
CREATE INDEX "audit_logs_adminId_idx" ON "audit_logs"("adminId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_candidatoId_fkey" FOREIGN KEY ("candidatoId") REFERENCES "candidatos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
