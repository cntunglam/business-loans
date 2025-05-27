/*
  Warnings:

  - You are about to drop the column `applicationData` on the `VisitorData` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ApplicantInfo" ADD COLUMN     "singpassData" JSONB;

-- AlterTable
ALTER TABLE "VisitorData" DROP COLUMN "applicationData";
