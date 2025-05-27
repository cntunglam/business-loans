/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `WaUser` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "WaUser" DROP CONSTRAINT "WaUser_phone_fkey";

-- AlterTable
ALTER TABLE "WaUser" ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "WaUser_userId_key" ON "WaUser"("userId");

-- AddForeignKey
ALTER TABLE "WaUser" ADD CONSTRAINT "WaUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
