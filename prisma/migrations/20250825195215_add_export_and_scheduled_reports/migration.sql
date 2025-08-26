-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "aiInsightsUsed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "analysesUsed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "exportReportsUsed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "scheduledReportsEmail" TEXT,
ADD COLUMN     "scheduledReportsEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "scheduledReportsFrequency" TEXT,
ADD COLUMN     "scheduledReportsUrls" JSONB,
ADD COLUMN     "scheduledReportsUsed" INTEGER NOT NULL DEFAULT 0;
