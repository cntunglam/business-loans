-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "applogs";

-- CreateTable
CREATE TABLE "applogs"."AppLogs" (
    "source" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "stack" TEXT,
    "request" JSONB,
    "id" TEXT NOT NULL,
    "errorType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppLogs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AppLogs_source_level_idx" ON "applogs"."AppLogs"("source", "level");
