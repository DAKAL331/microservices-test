-- CreateTable
CREATE TABLE "alert" (
    "id" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "region_code" TEXT NOT NULL,
    "aqi" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "dominant_pollutant" TEXT NOT NULL,
    "pm25" DOUBLE PRECISION NOT NULL,
    "pm10" DOUBLE PRECISION NOT NULL,
    "color" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "alert_timestamp_idx" ON "alert"("timestamp");
