/*
  Warnings:

  - You are about to drop the column `invoiceId` on the `LoanRequest` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."LoanRequest" DROP CONSTRAINT "LoanRequest_invoiceId_fkey";

-- AlterTable
ALTER TABLE "public"."LoanRequest" DROP COLUMN "invoiceId";

-- AlterTable
ALTER TABLE "public"."LoanResponse" ADD COLUMN     "invoiceId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."LoanResponse" ADD CONSTRAINT "LoanResponse_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "public"."InvoicesData"("id") ON DELETE SET NULL ON UPDATE CASCADE;
