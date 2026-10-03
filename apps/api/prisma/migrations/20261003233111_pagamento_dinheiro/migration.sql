-- Pagamento em dinheiro, com "troco para quanto?" opcional
-- AlterEnum
ALTER TYPE "PaymentMethod" ADD VALUE 'DINHEIRO';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "changeForCents" INTEGER;
