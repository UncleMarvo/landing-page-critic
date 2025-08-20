-- CreateTable
CREATE TABLE "public"."AuditResult" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "categories" JSONB NOT NULL,
    "webVitals" JSONB NOT NULL,
    "opportunities" JSONB NOT NULL,
    "recommendations" JSONB NOT NULL,
    "accessibility" JSONB NOT NULL,

    CONSTRAINT "AuditResult_pkey" PRIMARY KEY ("id")
);
