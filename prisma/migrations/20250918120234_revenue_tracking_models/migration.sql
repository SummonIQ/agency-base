-- CreateEnum
CREATE TYPE "public"."RevenueType" AS ENUM ('CONSULTING', 'RETAINER', 'PROJECT', 'SUBSCRIPTION', 'COMMISSION', 'BONUS', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."RevenueStatus" AS ENUM ('PENDING', 'RECEIVED', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."RecurringPeriod" AS ENUM ('WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY');

-- CreateTable
CREATE TABLE "public"."RevenueRecord" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "type" "public"."RevenueType" NOT NULL,
    "status" "public"."RevenueStatus" NOT NULL DEFAULT 'PENDING',
    "description" TEXT,
    "category" TEXT,
    "source" TEXT,
    "recurringPeriod" "public"."RecurringPeriod",
    "recordedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "clientId" TEXT,
    "projectId" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RevenueRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RevenueForecast" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "type" "public"."RevenueType" NOT NULL,
    "description" TEXT,
    "source" TEXT,
    "forecastDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expectedDate" TIMESTAMP(3) NOT NULL,
    "monthYear" TEXT NOT NULL,
    "clientId" TEXT,
    "projectId" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RevenueForecast_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RevenueRecord_userId_idx" ON "public"."RevenueRecord"("userId");

-- CreateIndex
CREATE INDEX "RevenueRecord_type_idx" ON "public"."RevenueRecord"("type");

-- CreateIndex
CREATE INDEX "RevenueRecord_status_idx" ON "public"."RevenueRecord"("status");

-- CreateIndex
CREATE INDEX "RevenueRecord_periodStart_idx" ON "public"."RevenueRecord"("periodStart");

-- CreateIndex
CREATE INDEX "RevenueRecord_periodEnd_idx" ON "public"."RevenueRecord"("periodEnd");

-- CreateIndex
CREATE INDEX "RevenueRecord_clientId_idx" ON "public"."RevenueRecord"("clientId");

-- CreateIndex
CREATE INDEX "RevenueRecord_projectId_idx" ON "public"."RevenueRecord"("projectId");

-- CreateIndex
CREATE INDEX "RevenueForecast_userId_idx" ON "public"."RevenueForecast"("userId");

-- CreateIndex
CREATE INDEX "RevenueForecast_expectedDate_idx" ON "public"."RevenueForecast"("expectedDate");

-- CreateIndex
CREATE INDEX "RevenueForecast_monthYear_idx" ON "public"."RevenueForecast"("monthYear");

-- CreateIndex
CREATE INDEX "RevenueForecast_clientId_idx" ON "public"."RevenueForecast"("clientId");

-- CreateIndex
CREATE INDEX "RevenueForecast_projectId_idx" ON "public"."RevenueForecast"("projectId");

-- AddForeignKey
ALTER TABLE "public"."RevenueRecord" ADD CONSTRAINT "RevenueRecord_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RevenueRecord" ADD CONSTRAINT "RevenueRecord_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RevenueRecord" ADD CONSTRAINT "RevenueRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RevenueForecast" ADD CONSTRAINT "RevenueForecast_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RevenueForecast" ADD CONSTRAINT "RevenueForecast_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RevenueForecast" ADD CONSTRAINT "RevenueForecast_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
