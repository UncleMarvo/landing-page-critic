-- AlterTable
ALTER TABLE "public"."AIInsight" ADD COLUMN     "historyId" INTEGER;

-- AlterTable
ALTER TABLE "public"."History" ADD COLUMN     "cumulativeLayoutShift" DOUBLE PRECISION,
ADD COLUMN     "fcp" DOUBLE PRECISION,
ADD COLUMN     "firstInputDelay" DOUBLE PRECISION,
ADD COLUMN     "largestContentfulPaint" DOUBLE PRECISION,
ADD COLUMN     "siteId" TEXT,
ADD COLUMN     "speedIndex" DOUBLE PRECISION,
ADD COLUMN     "totalBlockingTime" DOUBLE PRECISION,
ADD COLUMN     "ttfb" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "public"."AnalysisData" (
    "id" TEXT NOT NULL,
    "historyId" INTEGER NOT NULL,
    "opportunities" JSONB NOT NULL,
    "recommendations" JSONB NOT NULL,
    "accessibility" JSONB NOT NULL,
    "bestPractices" JSONB NOT NULL,
    "seo" JSONB NOT NULL,
    "performanceDetails" JSONB NOT NULL,
    "platforms" JSONB NOT NULL,
    "consolidatedData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalysisData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AnalysisData_historyId_key" ON "public"."AnalysisData"("historyId");

-- CreateIndex
CREATE INDEX "AnalysisData_historyId_idx" ON "public"."AnalysisData"("historyId");

-- CreateIndex
CREATE INDEX "AIInsight_historyId_idx" ON "public"."AIInsight"("historyId");

-- CreateIndex
CREATE INDEX "History_url_idx" ON "public"."History"("url");

-- CreateIndex
CREATE INDEX "History_userId_idx" ON "public"."History"("userId");

-- CreateIndex
CREATE INDEX "History_analyzedAt_idx" ON "public"."History"("analyzedAt");

-- CreateIndex
CREATE INDEX "History_siteId_idx" ON "public"."History"("siteId");

-- AddForeignKey
ALTER TABLE "public"."AIInsight" ADD CONSTRAINT "AIInsight_historyId_fkey" FOREIGN KEY ("historyId") REFERENCES "public"."History"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AnalysisData" ADD CONSTRAINT "AnalysisData_historyId_fkey" FOREIGN KEY ("historyId") REFERENCES "public"."History"("id") ON DELETE CASCADE ON UPDATE CASCADE;
