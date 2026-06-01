-- CreateTable
CREATE TABLE "MobileResponsivenessAudit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "score" INTEGER NOT NULL,
    "highSeverityIssues" INTEGER NOT NULL,
    "mediumSeverityIssues" INTEGER NOT NULL,
    "lowSeverityIssues" INTEGER NOT NULL,
    "totalIssues" INTEGER NOT NULL,
    "auditData" JSONB,

    CONSTRAINT "MobileResponsivenessAudit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MobileResponsivenessAudit_userId_idx" ON "MobileResponsivenessAudit"("userId");

-- AddForeignKey
ALTER TABLE "MobileResponsivenessAudit" ADD CONSTRAINT "MobileResponsivenessAudit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
