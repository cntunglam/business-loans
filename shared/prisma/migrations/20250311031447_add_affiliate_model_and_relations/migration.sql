-- AlterTable
ALTER TABLE "public"."LoanRequest" ADD COLUMN     "affiliateVisitorId" TEXT;

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
    "loanRequestClosedAt" TIMESTAMP(3),
    "completedApplicationAt" TIMESTAMP(3),
    "applicationType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AffiliateVisitor_pkey" PRIMARY KEY ("id")
);

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
