-- AlterTable
ALTER TABLE "public"."AIInsight" ADD COLUMN     "costBenefit" TEXT,
ADD COLUMN     "expectedTimeline" TEXT,
ADD COLUMN     "historicalContext" TEXT,
ADD COLUMN     "implementationSteps" JSONB,
ADD COLUMN     "platformSpecific" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "platforms" JSONB;

-- CreateTable
CREATE TABLE "public"."UserAction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "insightId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "impact" TEXT,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserAction_userId_idx" ON "public"."UserAction"("userId");

-- CreateIndex
CREATE INDEX "UserAction_insightId_idx" ON "public"."UserAction"("insightId");

-- CreateIndex
CREATE INDEX "UserAction_url_idx" ON "public"."UserAction"("url");

-- CreateIndex
CREATE INDEX "UserAction_action_idx" ON "public"."UserAction"("action");

-- CreateIndex
CREATE INDEX "UserAction_createdAt_idx" ON "public"."UserAction"("createdAt");

-- CreateIndex
CREATE INDEX "AIInsight_userId_idx" ON "public"."AIInsight"("userId");

-- AddForeignKey
ALTER TABLE "public"."UserAction" ADD CONSTRAINT "UserAction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserAction" ADD CONSTRAINT "UserAction_insightId_fkey" FOREIGN KEY ("insightId") REFERENCES "public"."AIInsight"("id") ON DELETE CASCADE ON UPDATE CASCADE;
