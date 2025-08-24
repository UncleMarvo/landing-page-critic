-- CreateTable
CREATE TABLE "public"."AIInsight" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "actionable" BOOLEAN NOT NULL DEFAULT true,
    "estimatedImpact" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 5,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIInsight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AIInsight_url_idx" ON "public"."AIInsight"("url");

-- CreateIndex
CREATE INDEX "AIInsight_status_idx" ON "public"."AIInsight"("status");

-- CreateIndex
CREATE INDEX "AIInsight_severity_idx" ON "public"."AIInsight"("severity");

-- CreateIndex
CREATE INDEX "AIInsight_category_idx" ON "public"."AIInsight"("category");
