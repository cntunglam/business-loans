/*
  Warnings:

  - You are about to drop the column `imageCaption` on the `WaMessage` table. All the data in the column will be lost.
  - You are about to drop the column `source` on the `WaMessage` table. All the data in the column will be lost.
  - You are about to drop the column `waUserId` on the `WaMessage` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `WaUser` table. All the data in the column will be lost.
  - You are about to drop the column `waId` on the `WaUser` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[waId]` on the table `WaMessage` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone]` on the table `WaUser` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sourceWaPhone` to the `WaMessage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `targetWaPhone` to the `WaMessage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `WaUser` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "WaMessage" DROP CONSTRAINT "WaMessage_waUserId_fkey";

-- DropForeignKey
ALTER TABLE "WaUser" DROP CONSTRAINT "WaUser_userId_fkey";

-- DropIndex
DROP INDEX "WaMessage_waId_idx";

-- DropIndex
DROP INDEX "WaUser_userId_key";

-- DropIndex
DROP INDEX "WaUser_waId_key";

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "phoneNumber" TEXT;

-- AlterTable
ALTER TABLE "WaMessage" DROP COLUMN "imageCaption",
DROP COLUMN "source",
DROP COLUMN "waUserId",
ADD COLUMN     "deliveryStatus" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "isAuto" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sourceWaPhone" TEXT NOT NULL,
ADD COLUMN     "targetWaPhone" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "WaUser" DROP COLUMN "userId",
DROP COLUMN "waId",
ADD COLUMN     "phone" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "WaMessage_waId_key" ON "WaMessage"("waId");

-- CreateIndex
CREATE UNIQUE INDEX "WaUser_phone_key" ON "WaUser"("phone");

-- CreateIndex
CREATE INDEX "WaUser_phone_idx" ON "WaUser"("phone");

-- AddForeignKey
ALTER TABLE "WaUser" ADD CONSTRAINT "WaUser_phone_fkey" FOREIGN KEY ("phone") REFERENCES "User"("phone") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaMessage" ADD CONSTRAINT "WaMessage_sourceWaPhone_fkey" FOREIGN KEY ("sourceWaPhone") REFERENCES "WaUser"("phone") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaMessage" ADD CONSTRAINT "WaMessage_targetWaPhone_fkey" FOREIGN KEY ("targetWaPhone") REFERENCES "WaUser"("phone") ON DELETE RESTRICT ON UPDATE CASCADE;
