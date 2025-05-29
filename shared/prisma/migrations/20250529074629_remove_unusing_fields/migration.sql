/*
  Warnings:

  - You are about to drop the column `bankDebt` on the `ApplicantInfo` table. All the data in the column will be lost.
  - You are about to drop the column `lenderDebt` on the `ApplicantInfo` table. All the data in the column will be lost.
  - You are about to drop the `LoanRequestGrading` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."LoanRequestGrading" DROP CONSTRAINT "LoanRequestGrading_loanRequestId_fkey";

-- AlterTable
ALTER TABLE "public"."ApplicantInfo" DROP COLUMN "bankDebt",
DROP COLUMN "lenderDebt";

-- DropTable
DROP TABLE "public"."LoanRequestGrading";
