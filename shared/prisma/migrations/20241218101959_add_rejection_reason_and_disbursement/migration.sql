-- AlterTable
ALTER TABLE "public"."LoanResponse" ADD COLUMN     "disbursementDate" TIMESTAMP(3),
ADD COLUMN     "rejectionReasons" TEXT[];
