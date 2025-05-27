-- AlterTable
ALTER TABLE "public"."Company" ADD COLUMN     "zohoCustomerId" TEXT;

-- AlterTable
ALTER TABLE "public"."LoanRequest" ADD COLUMN     "invoiceId" TEXT;

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

-- AddForeignKey
ALTER TABLE "public"."LoanRequest" ADD CONSTRAINT "LoanRequest_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "public"."InvoicesData"("id") ON DELETE SET NULL ON UPDATE CASCADE;
