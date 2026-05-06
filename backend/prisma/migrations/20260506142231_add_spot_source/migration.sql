-- AlterTable
ALTER TABLE "Spot" ADD COLUMN     "source" TEXT,
ADD COLUMN     "sourceRefreshedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Spot_source_sourceRefreshedAt_idx" ON "Spot"("source", "sourceRefreshedAt");
