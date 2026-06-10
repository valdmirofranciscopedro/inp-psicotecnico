/*
  Warnings:

  - The values [OUTRO,PREFIRO_NAO_INFORMAR] on the enum `Genero` will be removed. If these variants are still used in the database, this will fail.
  - The values [CUANDO_CUBANGO] on the enum `Provincia` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Genero_new" AS ENUM ('MASCULINO', 'FEMININO');
ALTER TABLE "candidatos" ALTER COLUMN "genero" TYPE "Genero_new" USING ("genero"::text::"Genero_new");
ALTER TYPE "Genero" RENAME TO "Genero_old";
ALTER TYPE "Genero_new" RENAME TO "Genero";
DROP TYPE "Genero_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "Provincia_new" AS ENUM ('BENGO', 'BENGUELA', 'BIE', 'CABINDA', 'CUANDO', 'CUANZA_NORTE', 'CUANZA_SUL', 'CUBANGO', 'CUNENE', 'HUAMBO', 'HUILA', 'ICOLO_E_BENGO', 'LUANDA', 'LUNDA_NORTE', 'LUNDA_SUL', 'MALANJE', 'MOXICO', 'MOXICO_LESTE', 'NAMIBE', 'UIGE', 'ZAIRE');
ALTER TABLE "candidatos" ALTER COLUMN "provincia" TYPE "Provincia_new" USING ("provincia"::text::"Provincia_new");
ALTER TYPE "Provincia" RENAME TO "Provincia_old";
ALTER TYPE "Provincia_new" RENAME TO "Provincia";
DROP TYPE "Provincia_old";
COMMIT;
