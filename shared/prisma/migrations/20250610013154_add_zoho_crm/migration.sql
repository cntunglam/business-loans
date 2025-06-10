/*
  Warnings:

  - A unique constraint covering the columns `[applicantInfoId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "applicantInfoId" TEXT;

-- CreateTable
CREATE TABLE "public"."ZohoCrm" (
    "id" TEXT NOT NULL,
    "zohoId" TEXT NOT NULL,
    "applicantInfoId" TEXT,

    CONSTRAINT "ZohoCrm_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ZohoCrm_zohoId_key" ON "public"."ZohoCrm"("zohoId");

-- CreateIndex
CREATE UNIQUE INDEX "ZohoCrm_applicantInfoId_key" ON "public"."ZohoCrm"("applicantInfoId");

-- CreateIndex
CREATE UNIQUE INDEX "User_applicantInfoId_key" ON "public"."User"("applicantInfoId");

-- AddForeignKey
ALTER TABLE "public"."ZohoCrm" ADD CONSTRAINT "ZohoCrm_applicantInfoId_fkey" FOREIGN KEY ("applicantInfoId") REFERENCES "public"."ApplicantInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_applicantInfoId_fkey" FOREIGN KEY ("applicantInfoId") REFERENCES "public"."ApplicantInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
