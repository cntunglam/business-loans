-- AlterTable
ALTER TABLE "public"."LoanRequest" ADD COLUMN     "isAutoReapply" BOOLEAN NOT NULL DEFAULT false;
