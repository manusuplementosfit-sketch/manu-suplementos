-- A recuperação de senha pelo login foi retirada: saem as colunas do código
-- AlterTable
ALTER TABLE "Admin" DROP COLUMN "recoveryAttempts",
DROP COLUMN "recoveryCodeCreatedAt",
DROP COLUMN "recoveryCodeExpiresAt",
DROP COLUMN "recoveryCodeHash";
