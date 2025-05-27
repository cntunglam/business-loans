-- CreateTable
CREATE TABLE "VisitorData" (
    "singpassData" JSONB,
    "applicationData" JSONB,
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VisitorData_pkey" PRIMARY KEY ("id")
);
