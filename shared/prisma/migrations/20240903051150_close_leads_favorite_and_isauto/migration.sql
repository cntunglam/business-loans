/*
  Warnings:

  - You are about to drop the column `status` on the `LoanOffer` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[closedLoanResponseId]` on the table `LoanOffer` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "LoanOffer" DROP COLUMN "status",
ADD COLUMN     "closedLoanResponseId" TEXT,
ALTER COLUMN "loanResponseId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "LoanRequest" ADD COLUMN     "isFavorite" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "LoanResponse" ADD COLUMN     "isAuto" BOOLEAN,
ADD COLUMN     "outcomeComment" TEXT,
ADD COLUMN     "outcomeStatus" TEXT NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "status" SET DEFAULT 'SUBMITTED';

-- CreateIndex
CREATE UNIQUE INDEX "LoanOffer_closedLoanResponseId_key" ON "LoanOffer"("closedLoanResponseId");

-- AddForeignKey
ALTER TABLE "LoanOffer" ADD CONSTRAINT "LoanOffer_closedLoanResponseId_fkey" FOREIGN KEY ("closedLoanResponseId") REFERENCES "LoanResponse"("id") ON DELETE SET NULL ON UPDATE CASCADE;
