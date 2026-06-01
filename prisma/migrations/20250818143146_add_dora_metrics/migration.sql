-- CreateEnum
CREATE TYPE "DeploymentStatus" AS ENUM ('SUCCESS', 'FAILED', 'ROLLBACK', 'IN_PROGRESS');

-- CreateEnum
CREATE TYPE "IncidentSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "CodeReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'CHANGES_REQUESTED', 'MERGED', 'CLOSED');

-- CreateTable
CREATE TABLE "DeploymentMetric" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "teamId" TEXT,
    "deploymentId" TEXT NOT NULL,
    "environment" TEXT NOT NULL,
    "status" "DeploymentStatus" NOT NULL,
    "deployedAt" TIMESTAMP(3) NOT NULL,
    "deploymentDuration" INTEGER,
    "commitSha" TEXT NOT NULL,
    "commitMessage" TEXT,
    "pullRequestId" TEXT,
    "branchName" TEXT,
    "linesAdded" INTEGER,
    "linesRemoved" INTEGER,
    "filesChanged" INTEGER,
    "commitDate" TIMESTAMP(3) NOT NULL,
    "mergeDate" TIMESTAMP(3),
    "leadTimeHours" DOUBLE PRECISION,
    "isRollback" BOOLEAN NOT NULL DEFAULT false,
    "failureReason" TEXT,
    "recoveryTimeMinutes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeploymentMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodeMetric" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "teamId" TEXT,
    "pullRequestId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" "CodeReviewStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "mergedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "reviewTimeHours" DOUBLE PRECISION,
    "timeToMergeHours" DOUBLE PRECISION,
    "numberOfReviewers" INTEGER NOT NULL DEFAULT 0,
    "numberOfComments" INTEGER NOT NULL DEFAULT 0,
    "numberOfApprovals" INTEGER NOT NULL DEFAULT 0,
    "numberOfChanges" INTEGER NOT NULL DEFAULT 0,
    "testCoverage" DOUBLE PRECISION,
    "complexityScore" DOUBLE PRECISION,
    "duplicateLines" INTEGER,
    "codeSmells" INTEGER,
    "securityIssues" INTEGER,
    "linesAdded" INTEGER NOT NULL DEFAULT 0,
    "linesRemoved" INTEGER NOT NULL DEFAULT 0,
    "filesChanged" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CodeMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncidentMetric" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "teamId" TEXT,
    "incidentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "severity" "IncidentSeverity" NOT NULL,
    "detectedAt" TIMESTAMP(3) NOT NULL,
    "acknowledgedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "timeToDetectMinutes" INTEGER,
    "timeToAckMinutes" INTEGER,
    "timeToResolveMinutes" INTEGER,
    "usersAffected" INTEGER,
    "servicesAffected" TEXT[],
    "deploymentId" TEXT,
    "rootCause" TEXT,
    "postMortemUrl" TEXT,
    "actionItems" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IncidentMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductivityMetric" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "teamId" TEXT,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "periodType" TEXT NOT NULL,
    "storyPointsCompleted" DOUBLE PRECISION,
    "tasksCompleted" INTEGER NOT NULL DEFAULT 0,
    "bugsFixed" INTEGER NOT NULL DEFAULT 0,
    "featuresDelivered" INTEGER NOT NULL DEFAULT 0,
    "cycleTimeHours" DOUBLE PRECISION,
    "workInProgress" DOUBLE PRECISION,
    "flowEfficiency" DOUBLE PRECISION,
    "focusTimeHours" DOUBLE PRECISION,
    "meetingTimeHours" DOUBLE PRECISION,
    "contextSwitches" INTEGER,
    "defectRate" DOUBLE PRECISION,
    "reworkRate" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductivityMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeveloperMetric" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "buildTimeSeconds" DOUBLE PRECISION,
    "ciPipelineMinutes" DOUBLE PRECISION,
    "testExecutionMinutes" DOUBLE PRECISION,
    "setupTimeHours" DOUBLE PRECISION,
    "environmentIssues" INTEGER NOT NULL DEFAULT 0,
    "toolingSatisfaction" DOUBLE PRECISION,
    "docsContributed" INTEGER NOT NULL DEFAULT 0,
    "docsConsumed" INTEGER NOT NULL DEFAULT 0,
    "documentationQuality" DOUBLE PRECISION,
    "onboardingDays" DOUBLE PRECISION,
    "mentorshipHours" DOUBLE PRECISION,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeveloperMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DORABenchmark" (
    "id" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "deployFrequency" TEXT NOT NULL,
    "deployFrequencyValue" DOUBLE PRECISION,
    "leadTime" TEXT NOT NULL,
    "leadTimeHours" DOUBLE PRECISION,
    "mttr" TEXT NOT NULL,
    "mttrMinutes" DOUBLE PRECISION,
    "changeFailureRate" TEXT NOT NULL,
    "changeFailurePercent" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DORABenchmark_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeploymentMetric_deploymentId_key" ON "DeploymentMetric"("deploymentId");

-- CreateIndex
CREATE INDEX "DeploymentMetric_userId_deployedAt_idx" ON "DeploymentMetric"("userId", "deployedAt");

-- CreateIndex
CREATE INDEX "DeploymentMetric_teamId_deployedAt_idx" ON "DeploymentMetric"("teamId", "deployedAt");

-- CreateIndex
CREATE INDEX "DeploymentMetric_environment_idx" ON "DeploymentMetric"("environment");

-- CreateIndex
CREATE INDEX "DeploymentMetric_status_idx" ON "DeploymentMetric"("status");

-- CreateIndex
CREATE UNIQUE INDEX "CodeMetric_pullRequestId_key" ON "CodeMetric"("pullRequestId");

-- CreateIndex
CREATE INDEX "CodeMetric_userId_createdAt_idx" ON "CodeMetric"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "CodeMetric_teamId_createdAt_idx" ON "CodeMetric"("teamId", "createdAt");

-- CreateIndex
CREATE INDEX "CodeMetric_status_idx" ON "CodeMetric"("status");

-- CreateIndex
CREATE UNIQUE INDEX "IncidentMetric_incidentId_key" ON "IncidentMetric"("incidentId");

-- CreateIndex
CREATE INDEX "IncidentMetric_teamId_detectedAt_idx" ON "IncidentMetric"("teamId", "detectedAt");

-- CreateIndex
CREATE INDEX "IncidentMetric_severity_idx" ON "IncidentMetric"("severity");

-- CreateIndex
CREATE INDEX "IncidentMetric_deploymentId_idx" ON "IncidentMetric"("deploymentId");

-- CreateIndex
CREATE INDEX "ProductivityMetric_teamId_periodStart_idx" ON "ProductivityMetric"("teamId", "periodStart");

-- CreateIndex
CREATE UNIQUE INDEX "ProductivityMetric_userId_periodStart_periodType_key" ON "ProductivityMetric"("userId", "periodStart", "periodType");

-- CreateIndex
CREATE INDEX "DeveloperMetric_userId_createdAt_idx" ON "DeveloperMetric"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "DeveloperMetric_userId_periodStart_key" ON "DeveloperMetric"("userId", "periodStart");

-- CreateIndex
CREATE UNIQUE INDEX "DORABenchmark_level_year_key" ON "DORABenchmark"("level", "year");

-- AddForeignKey
ALTER TABLE "DeploymentMetric" ADD CONSTRAINT "DeploymentMetric_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeMetric" ADD CONSTRAINT "CodeMetric_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncidentMetric" ADD CONSTRAINT "IncidentMetric_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncidentMetric" ADD CONSTRAINT "IncidentMetric_deploymentId_fkey" FOREIGN KEY ("deploymentId") REFERENCES "DeploymentMetric"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductivityMetric" ADD CONSTRAINT "ProductivityMetric_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeveloperMetric" ADD CONSTRAINT "DeveloperMetric_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
