/*
  Warnings:

  - You are about to drop the column `outcomeComment` on the `LoanResponse` table. All the data in the column will be lost.

*/
-- AlterTable
UPDATE "public"."LoanResponse"
SET comment = "outcomeComment"
WHERE "outcomeComment" IS NOT NULL;

-- AlterTable
ALTER TABLE "public"."LoanResponse" DROP COLUMN "outcomeComment";
