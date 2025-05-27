-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "humanVerificationStatus" TEXT NOT NULL DEFAULT 'NOT_VERIFIED',
ADD COLUMN     "ocrVerificationStatus" TEXT NOT NULL DEFAULT 'NOT_VERIFIED';

-- AlterTable
ALTER TABLE "LoanRequest" ADD COLUMN     "isLowQuality" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isSpam" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "CompanyNotificationSetting" (
    "companyId" TEXT NOT NULL,
    "emailNotificationTypes" TEXT[],
    "webhookNotificationTypes" TEXT[],
    "emailNotificationsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "webhookNotificationsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "emails" TEXT[],
    "webhooks" TEXT[],
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyNotificationSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompanyNotificationSetting_companyId_key" ON "CompanyNotificationSetting"("companyId");

-- AddForeignKey
ALTER TABLE "CompanyNotificationSetting" ADD CONSTRAINT "CompanyNotificationSetting_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
