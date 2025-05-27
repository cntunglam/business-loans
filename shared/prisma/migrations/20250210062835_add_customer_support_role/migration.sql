-- AlterTable
ALTER TABLE "public"."LoanRequest" ADD COLUMN     "customerSupportId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."LoanRequest" ADD CONSTRAINT "LoanRequest_customerSupportId_fkey" FOREIGN KEY ("customerSupportId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Update LoanRequest to replace "Kathy" (case-insensitive) and assign corresponding user ID
UPDATE "public"."LoanRequest"
SET "privateNote" = REGEXP_REPLACE("privateNote", '(?i)Steffanie', '', 'g'),
    "customerSupportId" = (SELECT id FROM "public"."User" WHERE LOWER(email) = 'steffanie@roshi.sg')
WHERE "privateNote" ILIKE '%Steffanie%';

-- Update LoanRequest to replace "Kathy" (case-insensitive) and assign corresponding user ID
UPDATE "public"."LoanRequest"
SET "privateNote" = REGEXP_REPLACE("privateNote", '(?i)Kathy', '', 'g'),
    "customerSupportId" = (SELECT id FROM "public"."User" WHERE LOWER(email) = 'kathy@roshi.sg')
WHERE "privateNote" ILIKE '%Kathy%';