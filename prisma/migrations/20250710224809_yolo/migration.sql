-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'SUBMITTED', 'FAILED', 'REJECTED', 'UNDER_REVIEW', 'INTERVIEW_REQUESTED');

-- CreateTable
CREATE TABLE "ApplicationSubmission" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "errorMessage" TEXT,
    "id" TEXT NOT NULL,
    "jobLeadId" TEXT NOT NULL,
    "metadata" JSONB,
    "resumeId" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "submissionUrl" TEXT,
    "submittedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "userAgent" TEXT,
    "wasAutomated" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ApplicationSubmission_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ApplicationSubmission" ADD CONSTRAINT "ApplicationSubmission_jobLeadId_fkey" FOREIGN KEY ("jobLeadId") REFERENCES "JobLead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationSubmission" ADD CONSTRAINT "ApplicationSubmission_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationSubmission" ADD CONSTRAINT "ApplicationSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
