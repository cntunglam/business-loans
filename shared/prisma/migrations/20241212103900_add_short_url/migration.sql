-- CreateTable
CREATE TABLE "public"."ShortUrl" (
    "code" VARCHAR(32) NOT NULL,
    "targetUrl" TEXT,
    "type" VARCHAR(32) NOT NULL,
    "allowedPaths" TEXT[],
    "userId" TEXT,
    "expiresAt" TIMESTAMP(3),
    "useCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" TIMESTAMP(3),
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShortUrl_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShortUrl_code_key" ON "public"."ShortUrl"("code");

-- AddForeignKey
ALTER TABLE "public"."ShortUrl" ADD CONSTRAINT "ShortUrl_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
