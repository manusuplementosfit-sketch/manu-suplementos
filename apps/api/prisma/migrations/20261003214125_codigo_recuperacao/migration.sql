-- Recuperação de senha passa a ser por código (sem e-mail): sai a tabela de links

-- DropForeignKey
ALTER TABLE "PasswordReset" DROP CONSTRAINT "PasswordReset_adminId_fkey";

-- DropTable
DROP TABLE "PasswordReset";

-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "recoveryCodeCreatedAt" TIMESTAMP(3),
ADD COLUMN     "recoveryCodeHash" TEXT;
