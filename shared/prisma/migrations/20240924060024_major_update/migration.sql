-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "salesPhoneNumber" TEXT;

-- AlterTable
ALTER TABLE "LoanRequest" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "deletionReason" TEXT,
ADD COLUMN     "privateNote" TEXT,
ADD COLUMN     "publicNote" TEXT,
ADD COLUMN     "supportData" JSONB,
ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- Simplify status logic
UPDATE "LoanRequest" SET "approvedAt" = to_timestamp(0)::DATE WHERE "status" = 'SUBMITTED';
UPDATE "LoanRequest" SET "status" = 'ACTIVE' WHERE "status" = 'DRAFT' OR "status" = 'SUBMITTED';
UPDATE "LoanRequest" SET "status" = 'DELETED', "deletionReason" = 'WITHDRAWN_BY_USER' WHERE "status" = 'CLOSED' OR "status" = 'DELETED_BY_USER';

-- AlterTable
ALTER TABLE "LoanResponse" ADD COLUMN     "acceptedAt" TIMESTAMP(3),
ADD COLUMN     "contactedByBorrowerAt" TIMESTAMP(3),
ADD COLUMN     "contactedByLenderAt" TIMESTAMP(3);

UPDATE "LoanResponse"
SET "acceptedAt" = (
    SELECT "createdAt"
    FROM "Appointment"
    WHERE "loanResponseId" = "LoanResponse".id
    LIMIT 1
)
WHERE id IN (
    SELECT "loanResponseId"
    FROM "Appointment"
    WHERE "loanResponseId" IS NOT NULL
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "userId" TEXT NOT NULL,
    "loanRequestId" TEXT,
    "activityType" TEXT NOT NULL,
    "targetType" TEXT,
    "targetId" TEXT,
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_loanRequestId_fkey" FOREIGN KEY ("loanRequestId") REFERENCES "LoanRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
