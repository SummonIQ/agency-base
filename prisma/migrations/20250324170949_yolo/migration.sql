-- CreateEnum
CREATE TYPE "CompanySize" AS ENUM ('ENTERPRISE', 'MID_SIZE', 'SMALL');

-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('ENTRY_LEVEL', 'MID_LEVEL', 'SENIOR_LEVEL');

-- CreateEnum
CREATE TYPE "JobBoard" AS ENUM ('CAREER_BUILDER', 'GOOGLE');

-- CreateEnum
CREATE TYPE "JobFitAnalysisStatus" AS ENUM ('ANALYZING', 'COMPLETED', 'FAILED', 'QUEUED');

-- CreateEnum
CREATE TYPE "JobLeadStatus" AS ENUM ('ADDED', 'APPLIED', 'DISMISSED', 'INTERVIEW_SCHEDULED', 'INTERVIEWED', 'OFFER_ACCEPTED', 'OFFER_MADE', 'OFFER_REJECTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "JobLeadOptimizationStatus" AS ENUM ('ANALYZING', 'COMPLETED', 'FAILED', 'OPTIMIZING', 'QUEUED');

-- CreateEnum
CREATE TYPE "JobListingStatus" AS ENUM ('ADDED_TO_LEADS', 'DISMISSED', 'UNREVIEWED');

-- CreateEnum
CREATE TYPE "JobSearchStatus" AS ENUM ('COMPLETED', 'FAILED', 'PROCESSING', 'QUEUED');

-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('CONTRACT', 'FULL_TIME', 'FULL_TIME_AND_PART_TIME', 'INTERNSHIP', 'PART_TIME', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "ResumeAnalysisStatus" AS ENUM ('ANALYZING', 'COMPLETED', 'PROCESSING', 'FAILED', 'QUEUED');

-- CreateEnum
CREATE TYPE "ResumeFormat" AS ENUM ('PDF', 'WORD');

-- CreateEnum
CREATE TYPE "ResumeOptimizationStatus" AS ENUM ('ANALYZING', 'COMPLETED', 'FAILED', 'OPTIMIZING', 'PROCESSING', 'QUEUED', 'REFINING');

-- CreateEnum
CREATE TYPE "ResumeRefinementStatus" AS ENUM ('ANALYZING', 'COMPLETED', 'FAILED', 'PROCESSING', 'REFINING', 'QUEUED');

-- CreateEnum
CREATE TYPE "ResumeRevisionType" AS ENUM ('JOB_LEAD', 'NEW_RESUME');

-- CreateEnum
CREATE TYPE "ResumeType" AS ENUM ('ORIGINAL', 'REVISION');

-- CreateTable
CREATE TABLE "CoverLetter" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "id" TEXT NOT NULL,
    "json" JSONB,
    "leadId" TEXT,
    "markdown" TEXT,
    "name" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "CoverLetter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobFitAnalysis" (
    "additionalMetrics" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "educationRelevanceScore" INTEGER NOT NULL,
    "experienceRelevanceScore" INTEGER NOT NULL,
    "summary" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "jobLeadId" TEXT,
    "jobListingId" TEXT,
    "keywordMatch" JSONB NOT NULL,
    "missingKeywords" TEXT[],
    "overallMatchScore" INTEGER NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "recommendations" TEXT[],
    "resumeId" TEXT,
    "resumeRevisionId" TEXT,
    "skillsAlignment" JSONB NOT NULL,
    "status" "JobFitAnalysisStatus" NOT NULL DEFAULT 'QUEUED',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "JobFitAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobLead" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id" TEXT NOT NULL,
    "jobListingId" TEXT NOT NULL,
    "jobSearchId" TEXT,
    "status" "JobLeadStatus" NOT NULL DEFAULT 'ADDED',
    "title" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "JobLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobLeadOptimization" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id" TEXT NOT NULL,
    "jobFitAnalysisId" TEXT,
    "jobLeadId" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "resumeRevisionId" TEXT,
    "status" "JobLeadOptimizationStatus" NOT NULL DEFAULT 'QUEUED',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "JobLeadOptimization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobListing" (
    "applyOptions" JSONB,
    "benefits" TEXT[],
    "company" TEXT,
    "companyLogoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dentalCoverage" BOOLEAN,
    "description" TEXT,
    "detectedExtensions" JSONB,
    "extendedDetailsCollected" BOOLEAN DEFAULT false,
    "extensions" TEXT[],
    "healthInsurance" BOOLEAN,
    "id" TEXT NOT NULL,
    "jobBoard" "JobBoard",
    "jobBoardUrl" TEXT,
    "jobId" TEXT NOT NULL,
    "jobSearchId" TEXT,
    "jobType" "JobType",
    "location" TEXT,
    "paidTimeOff" BOOLEAN,
    "postedAt" TIMESTAMP(3),
    "qualifications" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "remote" BOOLEAN,
    "requirements" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "responsibilities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "salary" TEXT,
    "saved" BOOLEAN NOT NULL DEFAULT false,
    "scheduleType" TEXT,
    "source" TEXT,
    "status" "JobListingStatus" NOT NULL DEFAULT 'UNREVIEWED',
    "title" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "workFromHome" BOOLEAN,

    CONSTRAINT "JobListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobSearch" (
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "id" TEXT NOT NULL,
    "jobBoard" "JobBoard",
    "jobBoardUrl" TEXT,
    "location" TEXT,
    "nextToken" TEXT,
    "pageDelay" INTEGER,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "remote" BOOLEAN,
    "searchTerm" TEXT NOT NULL,
    "status" "JobSearchStatus" NOT NULL DEFAULT 'QUEUED',
    "totalJobs" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "JobSearch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeAnalysis" (
    "achievements" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "formatting" JSONB,
    "grammar" JSONB,
    "id" TEXT NOT NULL,
    "keywords" JSONB,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "readability" JSONB,
    "recommendations" JSONB,
    "score" INTEGER,
    "sections" JSONB,
    "resumeId" TEXT,
    "resumeRevisionId" TEXT,
    "spelling" JSONB,
    "status" "ResumeAnalysisStatus" NOT NULL DEFAULT 'QUEUED',
    "strengths" TEXT[],
    "summary" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "weaknesses" TEXT[],

    CONSTRAINT "ResumeAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeOptimization" (
    "analysisId" TEXT,
    "changelog" TEXT[],
    "estimatedVisibilityBoost" TEXT,
    "projectedShortlistProbability" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id" TEXT NOT NULL,
    "jobFitAnalysisId" TEXT,
    "jobLeadId" TEXT,
    "optimizationStrategy" TEXT,
    "scoreImprovement" DOUBLE PRECISION,
    "score" DOUBLE PRECISION,
    "status" "ResumeOptimizationStatus" NOT NULL DEFAULT 'QUEUED',
    "previousScore" INTEGER,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "resumeId" TEXT,
    "resumeRevisionId" TEXT,
    "scoreDelta" DOUBLE PRECISION,
    "scorePercentChange" DOUBLE PRECISION,
    "significantImprovements" TEXT[],
    "summary" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "ResumeOptimization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resume" (
    "analysisId" TEXT,
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "defaultRevisionId" TEXT,
    "description" TEXT,
    "format" "ResumeFormat",
    "json" JSONB,
    "markdown" TEXT,
    "name" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "url" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Resume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "id" TEXT NOT NULL,
    "ipAddress" TEXT,
    "token" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeRevision" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "format" "ResumeFormat",
    "jobLeadId" TEXT,
    "json" JSONB,
    "markdown" TEXT,
    "name" TEXT NOT NULL,
    "pdfDocumentUrl" TEXT,
    "resumeAnalysisId" TEXT,
    "resumeId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "wordDocumentUrl" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ResumeRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "id" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "stripeCustomerId" TEXT NOT NULL,
    "stripeSubscriptionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "defaultResumeId" TEXT,
    "defaultRevisionId" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "firstName" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "image" TEXT DEFAULT '/user.png',
    "lastName" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "phoneVerified" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserJobPreferences" (
    "city" TEXT,
    "companySize" "CompanySize",
    "companyType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "experienceLevel" "ExperienceLevel",
    "id" TEXT NOT NULL,
    "jobTitles" TEXT[],
    "preferRemote" BOOLEAN,
    "remoteOnly" BOOLEAN,
    "state" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "zipCode" TEXT,

    CONSTRAINT "UserJobPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "city" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "educationDegree" TEXT,
    "educationEndMonth" INTEGER,
    "educationEndYear" INTEGER,
    "educationInstitution" TEXT,
    "educationInstitutionLocation" TEXT,
    "educationStartMonth" INTEGER,
    "educationStartYear" INTEGER,
    "emailAddress" TEXT,
    "firstName" TEXT,
    "githubUrl" TEXT,
    "id" TEXT NOT NULL,
    "lastName" TEXT,
    "linkedinUrl" TEXT,
    "phoneNumber" TEXT,
    "state" TEXT,
    "streetAddress" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,
    "websiteUrl" TEXT,
    "zipCode" TEXT,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "expires" TIMESTAMP(3),
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "account" (
    "accessToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "accountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id" TEXT NOT NULL,
    "idToken" TEXT,
    "password" TEXT,
    "providerId" TEXT NOT NULL,
    "refreshToken" TEXT,
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JobFitAnalysis_jobLeadId_key" ON "JobFitAnalysis"("jobLeadId");

-- CreateIndex
CREATE UNIQUE INDEX "JobFitAnalysis_resumeRevisionId_key" ON "JobFitAnalysis"("resumeRevisionId");

-- CreateIndex
CREATE UNIQUE INDEX "JobLead_jobListingId_key" ON "JobLead"("jobListingId");

-- CreateIndex
CREATE UNIQUE INDEX "JobLeadOptimization_jobFitAnalysisId_key" ON "JobLeadOptimization"("jobFitAnalysisId");

-- CreateIndex
CREATE UNIQUE INDEX "JobLeadOptimization_jobLeadId_key" ON "JobLeadOptimization"("jobLeadId");

-- CreateIndex
CREATE UNIQUE INDEX "JobLeadOptimization_resumeRevisionId_key" ON "JobLeadOptimization"("resumeRevisionId");

-- CreateIndex
CREATE UNIQUE INDEX "JobListing_jobId_key" ON "JobListing"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "ResumeAnalysis_resumeId_key" ON "ResumeAnalysis"("resumeId");

-- CreateIndex
CREATE UNIQUE INDEX "ResumeAnalysis_resumeRevisionId_key" ON "ResumeAnalysis"("resumeRevisionId");

-- CreateIndex
CREATE UNIQUE INDEX "ResumeOptimization_analysisId_key" ON "ResumeOptimization"("analysisId");

-- CreateIndex
CREATE UNIQUE INDEX "ResumeOptimization_jobFitAnalysisId_key" ON "ResumeOptimization"("jobFitAnalysisId");

-- CreateIndex
CREATE UNIQUE INDEX "ResumeOptimization_resumeId_key" ON "ResumeOptimization"("resumeId");

-- CreateIndex
CREATE UNIQUE INDEX "ResumeOptimization_resumeRevisionId_key" ON "ResumeOptimization"("resumeRevisionId");

-- CreateIndex
CREATE UNIQUE INDEX "Resume_analysisId_key" ON "Resume"("analysisId");

-- CreateIndex
CREATE UNIQUE INDEX "Resume_defaultRevisionId_key" ON "Resume"("defaultRevisionId");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "ResumeRevision_jobLeadId_key" ON "ResumeRevision"("jobLeadId");

-- CreateIndex
CREATE UNIQUE INDEX "ResumeRevision_resumeAnalysisId_key" ON "ResumeRevision"("resumeAnalysisId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeCustomerId_key" ON "Subscription"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "user_defaultResumeId_key" ON "user"("defaultResumeId");

-- CreateIndex
CREATE UNIQUE INDEX "user_defaultRevisionId_key" ON "user"("defaultRevisionId");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_phone_key" ON "user"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "UserJobPreferences_userId_key" ON "UserJobPreferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- AddForeignKey
ALTER TABLE "CoverLetter" ADD CONSTRAINT "CoverLetter_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "JobLead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoverLetter" ADD CONSTRAINT "CoverLetter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobFitAnalysis" ADD CONSTRAINT "JobFitAnalysis_jobLeadId_fkey" FOREIGN KEY ("jobLeadId") REFERENCES "JobLead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobFitAnalysis" ADD CONSTRAINT "JobFitAnalysis_jobListingId_fkey" FOREIGN KEY ("jobListingId") REFERENCES "JobListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobFitAnalysis" ADD CONSTRAINT "JobFitAnalysis_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobFitAnalysis" ADD CONSTRAINT "JobFitAnalysis_resumeRevisionId_fkey" FOREIGN KEY ("resumeRevisionId") REFERENCES "ResumeRevision"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobFitAnalysis" ADD CONSTRAINT "JobFitAnalysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobLead" ADD CONSTRAINT "JobLead_jobListingId_fkey" FOREIGN KEY ("jobListingId") REFERENCES "JobListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobLead" ADD CONSTRAINT "JobLead_jobSearchId_fkey" FOREIGN KEY ("jobSearchId") REFERENCES "JobSearch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobLead" ADD CONSTRAINT "JobLead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobLeadOptimization" ADD CONSTRAINT "JobLeadOptimization_jobFitAnalysisId_fkey" FOREIGN KEY ("jobFitAnalysisId") REFERENCES "JobFitAnalysis"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobLeadOptimization" ADD CONSTRAINT "JobLeadOptimization_jobLeadId_fkey" FOREIGN KEY ("jobLeadId") REFERENCES "JobLead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobLeadOptimization" ADD CONSTRAINT "JobLeadOptimization_resumeRevisionId_fkey" FOREIGN KEY ("resumeRevisionId") REFERENCES "ResumeRevision"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobLeadOptimization" ADD CONSTRAINT "JobLeadOptimization_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobListing" ADD CONSTRAINT "JobListing_jobSearchId_fkey" FOREIGN KEY ("jobSearchId") REFERENCES "JobSearch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobListing" ADD CONSTRAINT "JobListing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSearch" ADD CONSTRAINT "JobSearch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeAnalysis" ADD CONSTRAINT "ResumeAnalysis_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeAnalysis" ADD CONSTRAINT "ResumeAnalysis_resumeRevisionId_fkey" FOREIGN KEY ("resumeRevisionId") REFERENCES "ResumeRevision"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeAnalysis" ADD CONSTRAINT "ResumeAnalysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeOptimization" ADD CONSTRAINT "ResumeOptimization_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "ResumeAnalysis"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeOptimization" ADD CONSTRAINT "ResumeOptimization_jobFitAnalysisId_fkey" FOREIGN KEY ("jobFitAnalysisId") REFERENCES "JobFitAnalysis"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeOptimization" ADD CONSTRAINT "ResumeOptimization_jobLeadId_fkey" FOREIGN KEY ("jobLeadId") REFERENCES "JobLead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeOptimization" ADD CONSTRAINT "ResumeOptimization_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeOptimization" ADD CONSTRAINT "ResumeOptimization_resumeRevisionId_fkey" FOREIGN KEY ("resumeRevisionId") REFERENCES "ResumeRevision"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeOptimization" ADD CONSTRAINT "ResumeOptimization_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resume" ADD CONSTRAINT "Resume_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeRevision" ADD CONSTRAINT "ResumeRevision_jobLeadId_fkey" FOREIGN KEY ("jobLeadId") REFERENCES "JobLead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeRevision" ADD CONSTRAINT "ResumeRevision_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeRevision" ADD CONSTRAINT "ResumeRevision_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserJobPreferences" ADD CONSTRAINT "UserJobPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationToken" ADD CONSTRAINT "VerificationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
