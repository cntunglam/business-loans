/*
  Warnings:

  - You are about to drop the column `applicationType` on the `AffiliateVisitor` table. All the data in the column will be lost.
  - You are about to drop the column `completedApplicationAt` on the `AffiliateVisitor` table. All the data in the column will be lost.
  - You are about to drop the column `loanRequestClosedAt` on the `AffiliateVisitor` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."AffiliateVisitor" DROP COLUMN "applicationType",
DROP COLUMN "completedApplicationAt",
DROP COLUMN "loanRequestClosedAt";
