-- AlterTable
ALTER TABLE "public"."WaMessage" ADD COLUMN     "createdById" TEXT;

-- AddForeignKey
ALTER TABLE "public"."WaMessage" ADD CONSTRAINT "WaMessage_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
