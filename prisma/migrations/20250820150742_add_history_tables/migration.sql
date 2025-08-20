-- CreateTable
CREATE TABLE "public"."History" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "analyzedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "performance" INTEGER NOT NULL,
    "accessibility" INTEGER NOT NULL,
    "seo" INTEGER NOT NULL,
    "bestPractices" INTEGER NOT NULL,

    CONSTRAINT "History_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HistoryDetails" (
    "id" SERIAL NOT NULL,
    "historyId" INTEGER NOT NULL,
    "lhr" JSONB NOT NULL,

    CONSTRAINT "HistoryDetails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HistoryDetails_historyId_key" ON "public"."HistoryDetails"("historyId");

-- AddForeignKey
ALTER TABLE "public"."HistoryDetails" ADD CONSTRAINT "HistoryDetails_historyId_fkey" FOREIGN KEY ("historyId") REFERENCES "public"."History"("id") ON DELETE CASCADE ON UPDATE CASCADE;
