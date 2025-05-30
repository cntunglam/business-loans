-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "applogs";

-- CreateTable
CREATE TABLE "public"."ActivityLog" (
    "userId" TEXT,
    "loanRequestId" TEXT,
    "activityType" TEXT NOT NULL,
    "targetType" TEXT,
    "targetId" TEXT,
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AffiliateLink" (
    "id" TEXT NOT NULL,
    "targetUrl" TEXT NOT NULL,
    "utmSource" TEXT,
    "utmCampaign" TEXT NOT NULL,
    "referralCode" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "shortUrlId" TEXT,

    CONSTRAINT "AffiliateLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AffiliateVisitor" (
    "id" TEXT NOT NULL,
    "affiliateLinkId" TEXT NOT NULL,
    "userId" TEXT,
    "loanRequestId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AffiliateVisitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ApplicantInfo" (
    "borrowAmount" DOUBLE PRECISION,
    "borrowPeriod" INTEGER,
    "borrowPurpose" TEXT,
    "fullName" TEXT,
    "cccdNumber" TEXT,
    "phoneNumber" TEXT,
    "email" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "currentAddress" TEXT,
    "monthlyIncome" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "employmentType" TEXT,
    "hasLaborContract" BOOLEAN,
    "residencyStatus" TEXT,
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicantInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Company" (
    "name" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "country" VARCHAR(2) NOT NULL,
    "salesPhoneNumber" TEXT,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "description" TEXT,
    "commission" DOUBLE PRECISION NOT NULL DEFAULT 0.05,
    "zohoCustomerId" TEXT,
    "isFrozenAt" TIMESTAMP(3),
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CompanyStore" (
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "email" TEXT,
    "mapsUrl" TEXT NOT NULL,
    "mapsEmbedUrl" TEXT,
    "imageUrl" TEXT NOT NULL,
    "gPlaceId" TEXT,
    "companyId" TEXT NOT NULL,
    "ratings" INTEGER,
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyStore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OpeningHours" (
    "storeId" TEXT NOT NULL,
    "isOpen" BOOLEAN NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "openHour" TEXT NOT NULL,
    "closeHour" TEXT NOT NULL,
    "maxCustomers" INTEGER NOT NULL,
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpeningHours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CompanyLeadSettings" (
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

-- CreateTable
CREATE TABLE "public"."CompanySettings" (
    "companyId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanySettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LoanRequest" (
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "country" VARCHAR(2) NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'GENERAL',
    "amount" DOUBLE PRECISION NOT NULL,
    "term" INTEGER NOT NULL,
    "purpose" TEXT NOT NULL,
    "applicantInfoId" TEXT,
    "guarantorInfoId" TEXT,
    "userId" TEXT NOT NULL,
    "customerSupportId" TEXT,
    "deletionReason" TEXT,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "isSpam" BOOLEAN NOT NULL DEFAULT false,
    "isLowQuality" BOOLEAN NOT NULL DEFAULT false,
    "approvedAt" TIMESTAMP(3),
    "publicNote" TEXT,
    "privateNote" TEXT,
    "supportData" JSONB,
    "referrer" TEXT,
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "affiliateVisitorId" TEXT,
    "isAutoReapply" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "LoanRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LoanResponse" (
    "loanRequestId" TEXT NOT NULL,
    "lenderId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "comment" TEXT,
    "isAuto" BOOLEAN,
    "outcomeStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "rejectionReasons" TEXT[],
    "disbursementDate" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "contactedByBorrowerAt" TIMESTAMP(3),
    "contactedByLenderAt" TIMESTAMP(3),
    "supportData" JSONB,
    "invoiceId" TEXT,
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoanResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Appointment" (
    "openingHoursId" TEXT,
    "scheduledTime" TIMESTAMP(3),
    "loanResponseId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'REQUESTED_BY_BORROWER',
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cancelledAt" TIMESTAMP(3),

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LoanOffer" (
    "loanResponseId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "term" INTEGER NOT NULL,
    "monthlyInterestRate" DOUBLE PRECISION NOT NULL,
    "fixedUpfrontFees" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "variableUpfrontFees" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "closedLoanResponseId" TEXT,
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoanOffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."InvoicesData" (
    "zohoInvoiceData" JSONB,
    "sentAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvoicesData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Document" (
    "filename" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "applicantInfoId" TEXT NOT NULL,
    "humanVerificationStatus" TEXT NOT NULL DEFAULT 'NOT_VERIFIED',
    "ocrVerificationStatus" TEXT NOT NULL DEFAULT 'NOT_VERIFIED',
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applogs"."AppLogs" (
    "source" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "stack" TEXT,
    "request" JSONB,
    "id" TEXT NOT NULL,
    "errorType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppLogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WaUser" (
    "waName" TEXT,
    "phone" TEXT NOT NULL,
    "userId" TEXT,
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WaUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WaMessage" (
    "waId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "imageUrl" TEXT,
    "repliedId" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "sourceWaPhone" TEXT NOT NULL,
    "targetWaPhone" TEXT,
    "targetGroupId" TEXT,
    "deliveryStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "isAuto" BOOLEAN NOT NULL DEFAULT false,
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "WaMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WaGroup" (
    "waId" TEXT NOT NULL,
    "name" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WaGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Notification" (
    "transport" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "uniqueKey" TEXT NOT NULL,
    "recipientEmail" VARCHAR(255),
    "recipientTelegramChatId" VARCHAR(255),
    "webhookUrl" VARCHAR(500),
    "phoneNumber" TEXT,
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
CREATE TABLE "public"."CompanyNotificationSetting" (
    "companyId" TEXT NOT NULL,
    "emailNotificationTypes" TEXT[],
    "webhookNotificationTypes" TEXT[],
    "telegramNotificationTypes" TEXT[],
    "emailNotificationsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "webhookNotificationsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "telegramNotificationsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "emails" TEXT[],
    "webhooks" TEXT[],
    "telegramChatIds" TEXT[],
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyNotificationSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(32),
    "name" VARCHAR(255),
    "role" TEXT NOT NULL,
    "companyId" TEXT,
    "isAssignableToLoanRequest" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "cccd" TEXT,
    "lastLoginAt" TIMESTAMP(3),
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RefreshToken" (
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."APIToken" (
    "name" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "APIToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ShortUrl" (
    "code" VARCHAR(32) NOT NULL,
    "targetUrl" TEXT,
    "type" VARCHAR(32) NOT NULL,
    "allowedPaths" TEXT[],
    "userId" TEXT,
    "expiresAt" TIMESTAMP(3),
    "useCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" TIMESTAMP(3),
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShortUrl_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OTP" (
    "otp" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OTP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserSettings" (
    "userEmail" TEXT NOT NULL,
    "emailNotificationsDisabled" BOOLEAN NOT NULL DEFAULT false,
    "autoReapplyDisabled" BOOLEAN NOT NULL DEFAULT false,
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VisitorData" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "loanRequestType" TEXT NOT NULL,
    "currentStep" TEXT,
    "referrer" TEXT,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "borrowAmount" DOUBLE PRECISION,
    "borrowPeriod" INTEGER,
    "borrowPurpose" TEXT,
    "fullName" TEXT,
    "cccdNumber" TEXT,
    "phoneNumber" TEXT,
    "email" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "currentAddress" TEXT,
    "monthlyIncome" DOUBLE PRECISION DEFAULT 0,
    "employmentType" TEXT,
    "hasLaborContract" BOOLEAN,
    "residencyStatus" TEXT,
    "lastActiveAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VisitorData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_WaGroupToWaUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "ApplicantInfo_cccdNumber_idx" ON "public"."ApplicantInfo"("cccdNumber");

-- CreateIndex
CREATE INDEX "ApplicantInfo_phoneNumber_idx" ON "public"."ApplicantInfo"("phoneNumber");

-- CreateIndex
CREATE INDEX "ApplicantInfo_email_idx" ON "public"."ApplicantInfo"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyLeadSettings_companyId_key" ON "public"."CompanyLeadSettings"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanySettings_companyId_key_key" ON "public"."CompanySettings"("companyId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "LoanRequest_applicantInfoId_key" ON "public"."LoanRequest"("applicantInfoId");

-- CreateIndex
CREATE UNIQUE INDEX "LoanRequest_guarantorInfoId_key" ON "public"."LoanRequest"("guarantorInfoId");

-- CreateIndex
CREATE UNIQUE INDEX "LoanResponse_lenderId_loanRequestId_key" ON "public"."LoanResponse"("lenderId", "loanRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_loanResponseId_key" ON "public"."Appointment"("loanResponseId");

-- CreateIndex
CREATE UNIQUE INDEX "LoanOffer_loanResponseId_key" ON "public"."LoanOffer"("loanResponseId");

-- CreateIndex
CREATE UNIQUE INDEX "LoanOffer_closedLoanResponseId_key" ON "public"."LoanOffer"("closedLoanResponseId");

-- CreateIndex
CREATE UNIQUE INDEX "Document_filename_key" ON "public"."Document"("filename");

-- CreateIndex
CREATE INDEX "AppLogs_source_level_idx" ON "applogs"."AppLogs"("source", "level");

-- CreateIndex
CREATE UNIQUE INDEX "WaUser_phone_key" ON "public"."WaUser"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "WaUser_userId_key" ON "public"."WaUser"("userId");

-- CreateIndex
CREATE INDEX "WaUser_phone_idx" ON "public"."WaUser"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "WaMessage_waId_key" ON "public"."WaMessage"("waId");

-- CreateIndex
CREATE INDEX "WaMessage_waId_idx" ON "public"."WaMessage"("waId");

-- CreateIndex
CREATE UNIQUE INDEX "WaGroup_waId_key" ON "public"."WaGroup"("waId");

-- CreateIndex
CREATE INDEX "WaGroup_waId_idx" ON "public"."WaGroup"("waId");

-- CreateIndex
CREATE UNIQUE INDEX "Notification_transport_uniqueKey_key" ON "public"."Notification"("transport", "uniqueKey");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyNotificationSetting_companyId_key" ON "public"."CompanyNotificationSetting"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "public"."User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "public"."RefreshToken"("token");

-- CreateIndex
CREATE INDEX "RefreshToken_token_idx" ON "public"."RefreshToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "APIToken_token_key" ON "public"."APIToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "ShortUrl_code_key" ON "public"."ShortUrl"("code");

-- CreateIndex
CREATE UNIQUE INDEX "OTP_email_key" ON "public"."OTP"("email");

-- CreateIndex
CREATE INDEX "OTP_email_idx" ON "public"."OTP"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_userEmail_key" ON "public"."UserSettings"("userEmail");

-- CreateIndex
CREATE UNIQUE INDEX "_WaGroupToWaUser_AB_unique" ON "public"."_WaGroupToWaUser"("A", "B");

-- CreateIndex
CREATE INDEX "_WaGroupToWaUser_B_index" ON "public"."_WaGroupToWaUser"("B");

-- AddForeignKey
ALTER TABLE "public"."ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ActivityLog" ADD CONSTRAINT "ActivityLog_loanRequestId_fkey" FOREIGN KEY ("loanRequestId") REFERENCES "public"."LoanRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AffiliateLink" ADD CONSTRAINT "AffiliateLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AffiliateLink" ADD CONSTRAINT "AffiliateLink_shortUrlId_fkey" FOREIGN KEY ("shortUrlId") REFERENCES "public"."ShortUrl"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AffiliateVisitor" ADD CONSTRAINT "AffiliateVisitor_affiliateLinkId_fkey" FOREIGN KEY ("affiliateLinkId") REFERENCES "public"."AffiliateLink"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AffiliateVisitor" ADD CONSTRAINT "AffiliateVisitor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AffiliateVisitor" ADD CONSTRAINT "AffiliateVisitor_loanRequestId_fkey" FOREIGN KEY ("loanRequestId") REFERENCES "public"."LoanRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CompanyStore" ADD CONSTRAINT "CompanyStore_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OpeningHours" ADD CONSTRAINT "OpeningHours_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "public"."CompanyStore"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CompanyLeadSettings" ADD CONSTRAINT "CompanyLeadSettings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CompanySettings" ADD CONSTRAINT "CompanySettings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LoanRequest" ADD CONSTRAINT "LoanRequest_applicantInfoId_fkey" FOREIGN KEY ("applicantInfoId") REFERENCES "public"."ApplicantInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LoanRequest" ADD CONSTRAINT "LoanRequest_guarantorInfoId_fkey" FOREIGN KEY ("guarantorInfoId") REFERENCES "public"."ApplicantInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LoanRequest" ADD CONSTRAINT "LoanRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LoanRequest" ADD CONSTRAINT "LoanRequest_customerSupportId_fkey" FOREIGN KEY ("customerSupportId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LoanResponse" ADD CONSTRAINT "LoanResponse_loanRequestId_fkey" FOREIGN KEY ("loanRequestId") REFERENCES "public"."LoanRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LoanResponse" ADD CONSTRAINT "LoanResponse_lenderId_fkey" FOREIGN KEY ("lenderId") REFERENCES "public"."Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LoanResponse" ADD CONSTRAINT "LoanResponse_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "public"."InvoicesData"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Appointment" ADD CONSTRAINT "Appointment_openingHoursId_fkey" FOREIGN KEY ("openingHoursId") REFERENCES "public"."OpeningHours"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Appointment" ADD CONSTRAINT "Appointment_loanResponseId_fkey" FOREIGN KEY ("loanResponseId") REFERENCES "public"."LoanResponse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LoanOffer" ADD CONSTRAINT "LoanOffer_loanResponseId_fkey" FOREIGN KEY ("loanResponseId") REFERENCES "public"."LoanResponse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LoanOffer" ADD CONSTRAINT "LoanOffer_closedLoanResponseId_fkey" FOREIGN KEY ("closedLoanResponseId") REFERENCES "public"."LoanResponse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Document" ADD CONSTRAINT "Document_applicantInfoId_fkey" FOREIGN KEY ("applicantInfoId") REFERENCES "public"."ApplicantInfo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WaUser" ADD CONSTRAINT "WaUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WaMessage" ADD CONSTRAINT "WaMessage_sourceWaPhone_fkey" FOREIGN KEY ("sourceWaPhone") REFERENCES "public"."WaUser"("phone") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WaMessage" ADD CONSTRAINT "WaMessage_targetWaPhone_fkey" FOREIGN KEY ("targetWaPhone") REFERENCES "public"."WaUser"("phone") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WaMessage" ADD CONSTRAINT "WaMessage_targetGroupId_fkey" FOREIGN KEY ("targetGroupId") REFERENCES "public"."WaGroup"("waId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WaMessage" ADD CONSTRAINT "WaMessage_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_loanRequestId_fkey" FOREIGN KEY ("loanRequestId") REFERENCES "public"."LoanRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CompanyNotificationSetting" ADD CONSTRAINT "CompanyNotificationSetting_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."APIToken" ADD CONSTRAINT "APIToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ShortUrl" ADD CONSTRAINT "ShortUrl_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserSettings" ADD CONSTRAINT "UserSettings_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "public"."User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VisitorData" ADD CONSTRAINT "VisitorData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_WaGroupToWaUser" ADD CONSTRAINT "_WaGroupToWaUser_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."WaGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_WaGroupToWaUser" ADD CONSTRAINT "_WaGroupToWaUser_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."WaUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
