-- AlterTable
ALTER TABLE "public"."CompanyNotificationSetting" ADD COLUMN     "telegramChatIds" TEXT[],
ADD COLUMN     "telegramNotificationTypes" TEXT[],
ADD COLUMN     "telegramNotificationsEnabled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."Notification" ADD COLUMN     "recipientTelegramChatId" VARCHAR(255);
