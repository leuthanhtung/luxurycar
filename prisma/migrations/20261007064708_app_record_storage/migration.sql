-- CreateTable
CREATE TABLE "app_records" (
    "collection" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "payload" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_records_pkey" PRIMARY KEY ("collection","id")
);

-- CreateIndex
CREATE INDEX "app_records_collection_position_idx" ON "app_records"("collection", "position");
