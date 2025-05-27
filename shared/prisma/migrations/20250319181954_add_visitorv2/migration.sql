-- AlterTable
ALTER TABLE "public"."VisitorData" ADD COLUMN     "referer" TEXT;

-- CreateTable
CREATE TABLE "public"."UserSingpassData" (
    "data" JSONB NOT NULL,
    "userId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSingpassData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VisitorDataV2" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "loanRequestType" TEXT NOT NULL,
    "currentStep" TEXT,
    "referer" TEXT,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "singpassData" JSONB,
    "lastActiveAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VisitorDataV2_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StepData" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "stepKey" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "isValid" BOOLEAN NOT NULL DEFAULT true,
    "validatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StepData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StepData_visitorId_stepKey_key" ON "public"."StepData"("visitorId", "stepKey");

-- AddForeignKey
ALTER TABLE "public"."UserSingpassData" ADD CONSTRAINT "UserSingpassData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VisitorDataV2" ADD CONSTRAINT "VisitorDataV2_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StepData" ADD CONSTRAINT "StepData_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "public"."VisitorDataV2"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
