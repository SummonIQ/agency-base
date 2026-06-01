-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ApplicationStatus" ADD VALUE 'INTERVIEW_SCHEDULED';
ALTER TYPE "ApplicationStatus" ADD VALUE 'INTERVIEW_COMPLETED';
ALTER TYPE "ApplicationStatus" ADD VALUE 'OFFER_RECEIVED';
ALTER TYPE "ApplicationStatus" ADD VALUE 'OFFER_ACCEPTED';
ALTER TYPE "ApplicationStatus" ADD VALUE 'OFFER_REJECTED';
ALTER TYPE "ApplicationStatus" ADD VALUE 'WITHDRAWN';
ALTER TYPE "ApplicationStatus" ADD VALUE 'NOT_SELECTED';

-- AlterTable
ALTER TABLE "ApplicationSubmission" ADD COLUMN     "daysSinceSubmission" INTEGER,
ADD COLUMN     "daysToFinalOutcome" INTEGER,
ADD COLUMN     "daysToResponse" INTEGER,
ADD COLUMN     "finalOutcomeAt" TIMESTAMP(3),
ADD COLUMN     "interviewCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastStatusChangeAt" TIMESTAMP(3),
ADD COLUMN     "responseReceivedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "ApplicationOutcomeEvent" (
    "id" TEXT NOT NULL,
    "applicationSubmissionId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "previousStatus" "ApplicationStatus",
    "newStatus" "ApplicationStatus" NOT NULL,
    "metadata" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,

    CONSTRAINT "ApplicationOutcomeEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomationSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "requireUserApproval" BOOLEAN NOT NULL DEFAULT true,
    "preventDuplicateApplications" BOOLEAN NOT NULL DEFAULT true,
    "enableCompanyBlacklist" BOOLEAN NOT NULL DEFAULT false,
    "companyBlacklist" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "enableKeywordBlacklist" BOOLEAN NOT NULL DEFAULT false,
    "keywordBlacklist" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "enableSalaryThreshold" BOOLEAN NOT NULL DEFAULT false,
    "minSalaryThreshold" INTEGER NOT NULL DEFAULT 50000,
    "maxApplicationsPerCompany" INTEGER NOT NULL DEFAULT 3,
    "pauseOnConsecutiveFailures" BOOLEAN NOT NULL DEFAULT true,
    "consecutiveFailureThreshold" INTEGER NOT NULL DEFAULT 3,
    "applicationsPerHour" INTEGER NOT NULL DEFAULT 10,
    "applicationsPerDay" INTEGER NOT NULL DEFAULT 50,
    "minIntervalMinutes" INTEGER NOT NULL DEFAULT 5,
    "respectJobBoardLimits" BOOLEAN NOT NULL DEFAULT true,
    "enableSmartScheduling" BOOLEAN NOT NULL DEFAULT true,
    "scheduleWeekdaysOnly" BOOLEAN NOT NULL DEFAULT true,
    "scheduleBusinessHoursOnly" BOOLEAN NOT NULL DEFAULT true,
    "preferredStartHour" INTEGER NOT NULL DEFAULT 9,
    "preferredEndHour" INTEGER NOT NULL DEFAULT 17,
    "userTimezone" TEXT NOT NULL DEFAULT 'America/New_York',
    "prioritizeNewListings" BOOLEAN NOT NULL DEFAULT true,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "isPaused" BOOLEAN NOT NULL DEFAULT false,
    "pausedAt" TIMESTAMP(3),
    "pauseReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AutomationSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomationAuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "metadata" JSONB,
    "jobLeadId" TEXT,
    "applicationSubmissionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AutomationAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomationScheduledApplication" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobLeadId" TEXT NOT NULL,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "lastAttemptAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AutomationScheduledApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumePerformanceMetric" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resumeId" TEXT,
    "resumeRevisionId" TEXT,
    "totalApplications" INTEGER NOT NULL DEFAULT 0,
    "totalResponses" INTEGER NOT NULL DEFAULT 0,
    "totalInterviews" INTEGER NOT NULL DEFAULT 0,
    "totalOffers" INTEGER NOT NULL DEFAULT 0,
    "responseRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "interviewRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "offerRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "atsScore" INTEGER,
    "atsScoreHistory" JSONB,
    "optimizationScore" INTEGER,
    "optimizationHistory" JSONB,
    "avgResponseTime" DOUBLE PRECISION,
    "avgInterviewTime" DOUBLE PRECISION,
    "avgOfferTime" DOUBLE PRECISION,
    "keywordEffectiveness" JSONB,
    "sectionEffectiveness" JSONB,
    "lengthOptimal" BOOLEAN,
    "industryBenchmark" JSONB,
    "personalBest" BOOLEAN NOT NULL DEFAULT false,
    "improvementFromPrevious" DOUBLE PRECISION,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataRange" JSONB,
    "sampleSize" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResumePerformanceMetric_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AutomationSettings_userId_key" ON "AutomationSettings"("userId");

-- CreateIndex
CREATE INDEX "AutomationSettings_userId_idx" ON "AutomationSettings"("userId");

-- CreateIndex
CREATE INDEX "AutomationAuditLog_userId_createdAt_idx" ON "AutomationAuditLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AutomationAuditLog_action_idx" ON "AutomationAuditLog"("action");

-- CreateIndex
CREATE INDEX "AutomationScheduledApplication_userId_status_scheduledFor_idx" ON "AutomationScheduledApplication"("userId", "status", "scheduledFor");

-- CreateIndex
CREATE INDEX "AutomationScheduledApplication_scheduledFor_idx" ON "AutomationScheduledApplication"("scheduledFor");

-- CreateIndex
CREATE INDEX "AutomationScheduledApplication_status_idx" ON "AutomationScheduledApplication"("status");

-- CreateIndex
CREATE INDEX "ResumePerformanceMetric_userId_calculatedAt_idx" ON "ResumePerformanceMetric"("userId", "calculatedAt");

-- CreateIndex
CREATE INDEX "ResumePerformanceMetric_resumeId_idx" ON "ResumePerformanceMetric"("resumeId");

-- CreateIndex
CREATE INDEX "ResumePerformanceMetric_resumeRevisionId_idx" ON "ResumePerformanceMetric"("resumeRevisionId");

-- CreateIndex
CREATE INDEX "ResumePerformanceMetric_personalBest_idx" ON "ResumePerformanceMetric"("personalBest");

-- AddForeignKey
ALTER TABLE "ApplicationOutcomeEvent" ADD CONSTRAINT "ApplicationOutcomeEvent_applicationSubmissionId_fkey" FOREIGN KEY ("applicationSubmissionId") REFERENCES "ApplicationSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationSettings" ADD CONSTRAINT "AutomationSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationAuditLog" ADD CONSTRAINT "AutomationAuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationScheduledApplication" ADD CONSTRAINT "AutomationScheduledApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationScheduledApplication" ADD CONSTRAINT "AutomationScheduledApplication_jobLeadId_fkey" FOREIGN KEY ("jobLeadId") REFERENCES "JobLead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumePerformanceMetric" ADD CONSTRAINT "ResumePerformanceMetric_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumePerformanceMetric" ADD CONSTRAINT "ResumePerformanceMetric_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumePerformanceMetric" ADD CONSTRAINT "ResumePerformanceMetric_resumeRevisionId_fkey" FOREIGN KEY ("resumeRevisionId") REFERENCES "ResumeRevision"("id") ON DELETE CASCADE ON UPDATE CASCADE;
