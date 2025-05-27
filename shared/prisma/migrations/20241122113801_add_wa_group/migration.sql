-- DropForeignKey
ALTER TABLE "public"."WaMessage" DROP CONSTRAINT "WaMessage_targetWaPhone_fkey";

-- AlterTable
ALTER TABLE "public"."WaMessage" ADD COLUMN     "targetGroupId" TEXT,
ALTER COLUMN "targetWaPhone" DROP NOT NULL;

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
CREATE TABLE "public"."_WaGroupToWaUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "WaGroup_waId_key" ON "public"."WaGroup"("waId");

-- CreateIndex
CREATE INDEX "WaGroup_waId_idx" ON "public"."WaGroup"("waId");

-- CreateIndex
CREATE UNIQUE INDEX "_WaGroupToWaUser_AB_unique" ON "public"."_WaGroupToWaUser"("A", "B");

-- CreateIndex
CREATE INDEX "_WaGroupToWaUser_B_index" ON "public"."_WaGroupToWaUser"("B");

-- CreateIndex
CREATE INDEX "WaMessage_waId_idx" ON "public"."WaMessage"("waId");

-- AddForeignKey
ALTER TABLE "public"."WaMessage" ADD CONSTRAINT "WaMessage_targetWaPhone_fkey" FOREIGN KEY ("targetWaPhone") REFERENCES "public"."WaUser"("phone") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WaMessage" ADD CONSTRAINT "WaMessage_targetGroupId_fkey" FOREIGN KEY ("targetGroupId") REFERENCES "public"."WaGroup"("waId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_WaGroupToWaUser" ADD CONSTRAINT "_WaGroupToWaUser_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."WaGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_WaGroupToWaUser" ADD CONSTRAINT "_WaGroupToWaUser_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."WaUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
