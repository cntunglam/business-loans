-- CreateTable
CREATE TABLE "public"."LoanRequestGrading" (
    "loanRequestId" TEXT NOT NULL,
    "mlcbGrade" TEXT,
    "leadTier" TEXT,
    "mlcbReport" JSONB,
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoanRequestGrading_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LoanRequestGrading_loanRequestId_key" ON "public"."LoanRequestGrading"("loanRequestId");

-- AddForeignKey
ALTER TABLE "public"."LoanRequestGrading" ADD CONSTRAINT "LoanRequestGrading_loanRequestId_fkey" FOREIGN KEY ("loanRequestId") REFERENCES "public"."LoanRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
