-- "Esqueci minha senha" com código de 6 números enviado por e-mail: validade e tentativas
-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "recoveryAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "recoveryCodeExpiresAt" TIMESTAMP(3);
