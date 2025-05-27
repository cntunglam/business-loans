/*
  Warnings:

  - Made the column `userId` on table `LoanRequest` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "LoanRequest" DROP CONSTRAINT "LoanRequest_userId_fkey";

-- AlterTable
ALTER TABLE "LoanRequest" ALTER COLUMN "userId" SET NOT NULL;

-- CreateTable
CREATE TABLE "Notification" (
    "transport" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "uniqueKey" TEXT NOT NULL,
    "recipientEmail" VARCHAR(255),
    "webhookUrl" VARCHAR(500),
    "payload" JSONB NOT NULL,
    "responsePayload" JSONB,
    "errorMessage" TEXT,
    "sentAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "targetType" TEXT,
    "notificationType" TEXT NOT NULL,
    "batchId" TEXT,
    "loanRequestId" TEXT,
    "companyId" TEXT,
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyLeadSettings" (
    "minMonthlyIncomeForeigner" INTEGER,
    "minMonthlyIncomeLocal" INTEGER,
    "minLoanAmount" INTEGER,
    "maxDebtIncomeRatio" DOUBLE PRECISION,
    "employmentStatus" TEXT[],
    "employmentTime" TEXT[],
    "residencyStatus" TEXT[],
    "propertyOwnerships" TEXT[],
    "documents" TEXT[],
    "documentCount" INTEGER,
    "isApprovedByRoshi" BOOLEAN NOT NULL DEFAULT false,
    "companyId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyLeadSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Notification_transport_uniqueKey_key" ON "Notification"("transport", "uniqueKey");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyLeadSettings_companyId_key" ON "CompanyLeadSettings"("companyId");

-- AddForeignKey
ALTER TABLE "LoanRequest" ADD CONSTRAINT "LoanRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_loanRequestId_fkey" FOREIGN KEY ("loanRequestId") REFERENCES "LoanRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyLeadSettings" ADD CONSTRAINT "CompanyLeadSettings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
