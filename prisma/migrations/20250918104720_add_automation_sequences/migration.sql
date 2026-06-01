/*
  Warnings:

  - The values [UNREAD] on the enum `NotificationStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `link` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `message` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the `ProjectTask` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `content` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Made the column `type` on table `Notification` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "public"."ActionTaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."ActionTaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "public"."EmailTemplateType" AS ENUM ('RECRUITING', 'LEAD_GEN', 'FOLLOW_UP', 'CLIENT', 'NURTURING', 'NOTIFICATION');

-- CreateEnum
CREATE TYPE "public"."EmailSequenceStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."EmailSendStatus" AS ENUM ('PENDING', 'SENDING', 'SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'BOUNCED', 'FAILED', 'UNSUBSCRIBED');

-- CreateEnum
CREATE TYPE "public"."RecipientStatus" AS ENUM ('ACTIVE', 'UNSUBSCRIBED', 'BOUNCED', 'COMPLAINED', 'PAUSED');

-- CreateEnum
CREATE TYPE "public"."NotificationPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "public"."NotificationCategory" AS ENUM ('APPLICATION_STATUS', 'INTERVIEW_REQUEST', 'NETWORKING_REMINDER', 'SHARE', 'RESUME_FEEDBACK', 'AUTOMATION', 'JOB_SEARCH', 'RESUME_ANALYSIS', 'SYSTEM');

-- CreateEnum
CREATE TYPE "public"."NotificationChannel" AS ENUM ('EMAIL', 'IN_APP', 'BROWSER');

-- CreateEnum
CREATE TYPE "public"."NotificationFrequency" AS ENUM ('IMMEDIATE', 'BATCHED', 'MINIMAL');

-- CreateEnum
CREATE TYPE "public"."LeadDataProvider" AS ENUM ('APOLLO', 'ZOOMINFO', 'MANUAL');

-- CreateEnum
CREATE TYPE "public"."DataQualityScore" AS ENUM ('EXCELLENT', 'GOOD', 'FAIR', 'POOR');

-- CreateEnum
CREATE TYPE "public"."IntentDataSignal" AS ENUM ('TECHNOLOGY_RESEARCH', 'COMPETITOR_RESEARCH', 'HIRING_ACTIVITY', 'FUNDING_ACTIVITY', 'CONTENT_ENGAGEMENT', 'WEBSITE_ACTIVITY', 'SOCIAL_MENTIONS', 'JOB_CHANGE_SIGNALS', 'BUDGET_ALLOCATION', 'PROJECT_INITIATIVES');

-- CreateEnum
CREATE TYPE "public"."LeadIntelligenceCompanySize" AS ENUM ('STARTUP', 'SMALL_BUSINESS', 'MID_MARKET', 'ENTERPRISE', 'LARGE_ENTERPRISE');

-- CreateEnum
CREATE TYPE "public"."LeadIntelligenceStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATING', 'WON', 'LOST', 'NURTURING', 'DISQUALIFIED');

-- CreateEnum
CREATE TYPE "public"."AutomationStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "public"."AutomationTrigger" AS ENUM ('MANUAL', 'LEAD_CREATED', 'PROSPECT_CONNECTED', 'EMAIL_OPENED', 'FORM_SUBMITTED');

-- CreateEnum
CREATE TYPE "public"."AutomationStepType" AS ENUM ('EMAIL', 'LINKEDIN_CONNECTION', 'LINKEDIN_MESSAGE', 'WAIT', 'CONDITION');

-- CreateEnum
CREATE TYPE "public"."LinkedInConnectionStatus" AS ENUM ('PENDING', 'CONNECTED', 'DECLINED', 'WITHDRAWN', 'EXPIRED');

-- CreateEnum
CREATE TYPE "public"."LinkedInProspectStatus" AS ENUM ('NEW', 'CONTACTED', 'CONNECTED', 'QUALIFIED', 'CONVERTED', 'DISQUALIFIED');

-- CreateEnum
CREATE TYPE "public"."LinkedInAutomationStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."LinkedInMessageType" AS ENUM ('CONNECTION_REQUEST', 'FOLLOW_UP', 'NURTURE', 'PITCH', 'THANK_YOU');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."NotificationStatus_new" AS ENUM ('PENDING', 'SENT', 'READ', 'FAILED');
ALTER TABLE "public"."Notification" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."Notification" ALTER COLUMN "status" TYPE "public"."NotificationStatus_new" USING ("status"::text::"public"."NotificationStatus_new");
ALTER TYPE "public"."NotificationStatus" RENAME TO "NotificationStatus_old";
ALTER TYPE "public"."NotificationStatus_new" RENAME TO "NotificationStatus";
DROP TYPE "public"."NotificationStatus_old";
ALTER TABLE "public"."Notification" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."ProjectTask" DROP CONSTRAINT "ProjectTask_projectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TimeEntry" DROP CONSTRAINT "TimeEntry_taskId_fkey";

-- AlterTable
ALTER TABLE "public"."Notification" DROP COLUMN "link",
DROP COLUMN "message",
ADD COLUMN     "batchId" TEXT,
ADD COLUMN     "category" "public"."NotificationCategory" NOT NULL DEFAULT 'SYSTEM',
ADD COLUMN     "channels" "public"."NotificationChannel"[] DEFAULT ARRAY[]::"public"."NotificationChannel"[],
ADD COLUMN     "content" TEXT NOT NULL,
ADD COLUMN     "deliveredAt" TIMESTAMP(3),
ADD COLUMN     "priority" "public"."NotificationPriority" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "recipientEmail" TEXT,
ADD COLUMN     "scheduledFor" TIMESTAMP(3),
ALTER COLUMN "status" SET DEFAULT 'PENDING',
ALTER COLUMN "type" SET NOT NULL;

-- DropTable
DROP TABLE "public"."ProjectTask";

-- CreateTable
CREATE TABLE "public"."NotificationPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "applicationStatusEnabled" BOOLEAN NOT NULL DEFAULT true,
    "interviewRequestsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "networkingRemindersEnabled" BOOLEAN NOT NULL DEFAULT true,
    "shareNotificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "resumeFeedbackEnabled" BOOLEAN NOT NULL DEFAULT true,
    "automationEnabled" BOOLEAN NOT NULL DEFAULT true,
    "jobSearchEnabled" BOOLEAN NOT NULL DEFAULT true,
    "resumeAnalysisEnabled" BOOLEAN NOT NULL DEFAULT true,
    "systemNotificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "inAppEnabled" BOOLEAN NOT NULL DEFAULT true,
    "browserEnabled" BOOLEAN NOT NULL DEFAULT true,
    "notificationFrequency" "public"."NotificationFrequency" NOT NULL DEFAULT 'IMMEDIATE',
    "quietHoursEnabled" BOOLEAN NOT NULL DEFAULT false,
    "quietHoursStart" TEXT,
    "quietHoursEnd" TEXT,
    "dailyDigestEnabled" BOOLEAN NOT NULL DEFAULT false,
    "dailyDigestHour" INTEGER,
    "weeklyDigestEnabled" BOOLEAN NOT NULL DEFAULT false,
    "weeklyDigestDay" INTEGER,
    "weeklyDigestHour" INTEGER,
    "batchWindowMinutes" INTEGER NOT NULL DEFAULT 15,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'TODO',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "estimatedHours" DOUBLE PRECISION,
    "actualHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "projectId" TEXT NOT NULL,
    "assigneeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TeamMember" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT,
    "department" TEXT,
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "availability" TEXT NOT NULL DEFAULT 'available',
    "image" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ActionTask" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "status" "public"."ActionTaskStatus" NOT NULL DEFAULT 'TODO',
    "priority" "public"."ActionTaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "estimatedHours" DOUBLE PRECISION,
    "actualHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "source" TEXT,
    "sourceId" TEXT,
    "assignedToId" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "metadata" JSONB,
    "progressPercentage" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActionTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LeadIntelligenceCompany" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT,
    "website" TEXT,
    "linkedinUrl" TEXT,
    "description" TEXT,
    "industry" TEXT,
    "subIndustry" TEXT,
    "companySize" "public"."LeadIntelligenceCompanySize",
    "employeeCount" INTEGER,
    "foundedYear" INTEGER,
    "headquarters" TEXT,
    "locations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "annualRevenue" TEXT,
    "fundingStage" TEXT,
    "totalFunding" TEXT,
    "technologies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "techStack" JSONB,
    "dataProvider" "public"."LeadDataProvider" NOT NULL DEFAULT 'MANUAL',
    "apolloId" TEXT,
    "zoomInfoId" TEXT,
    "dataQuality" "public"."DataQualityScore" NOT NULL DEFAULT 'FAIR',
    "intentSignals" "public"."IntentDataSignal"[] DEFAULT ARRAY[]::"public"."IntentDataSignal"[],
    "intentScore" DOUBLE PRECISION DEFAULT 0.0,
    "lastEnrichedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadIntelligenceCompany_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EnrichedLead" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "personalEmail" TEXT,
    "phone" TEXT,
    "linkedinUrl" TEXT,
    "jobTitle" TEXT NOT NULL,
    "department" TEXT,
    "seniority" TEXT,
    "isDecisionMaker" BOOLEAN NOT NULL DEFAULT false,
    "companyId" TEXT NOT NULL,
    "status" "public"."LeadIntelligenceStatus" NOT NULL DEFAULT 'NEW',
    "leadScore" DOUBLE PRECISION DEFAULT 0.0,
    "qualificationNotes" TEXT,
    "assignedToUserId" TEXT,
    "dataProvider" "public"."LeadDataProvider" NOT NULL DEFAULT 'MANUAL',
    "apolloPersonId" TEXT,
    "zoomInfoPersonId" TEXT,
    "dataQuality" "public"."DataQualityScore" NOT NULL DEFAULT 'FAIR',
    "lastEnrichedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnrichedLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LeadIntelligenceSearch" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "searchQuery" TEXT NOT NULL,
    "filters" JSONB,
    "status" TEXT NOT NULL DEFAULT 'PROCESSING',
    "totalResults" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "LeadIntelligenceSearch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LeadIntelligenceSearchResult" (
    "id" TEXT NOT NULL,
    "leadSearchId" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "jobTitle" TEXT,
    "companyName" TEXT,
    "companyDomain" TEXT,
    "dataProvider" "public"."LeadDataProvider" NOT NULL,
    "externalId" TEXT NOT NULL,
    "processingStatus" TEXT NOT NULL DEFAULT 'QUEUED',
    "enrichedLeadId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "LeadIntelligenceSearchResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LeadIntelligenceEnrichmentQueue" (
    "id" TEXT NOT NULL,
    "searchResultId" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "dataProvider" "public"."LeadDataProvider",
    "dataQuality" "public"."DataQualityScore",
    "error" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadIntelligenceEnrichmentQueue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LeadIntelligenceActivity" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadIntelligenceActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LeadIntelligenceEmailCampaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "scheduledAt" TIMESTAMP(3),
    "isTemplate" BOOLEAN NOT NULL DEFAULT false,
    "templateVariables" JSONB,
    "targetCriteria" JSONB,
    "estimatedReach" INTEGER,
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "openCount" INTEGER NOT NULL DEFAULT 0,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "replyCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "LeadIntelligenceEmailCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LeadIntelligenceApiUsageTracking" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "public"."LeadDataProvider" NOT NULL,
    "endpoint" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "requestCount" INTEGER NOT NULL DEFAULT 0,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "rateLimitedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadIntelligenceApiUsageTracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LeadIntelligenceDataConsent" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "consentType" TEXT NOT NULL,
    "consentGiven" BOOLEAN NOT NULL,
    "consentDate" TIMESTAMP(3) NOT NULL,
    "consentSource" TEXT NOT NULL,
    "legalBasis" TEXT NOT NULL,
    "withdrawalDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadIntelligenceDataConsent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LeadIntelligenceDataAttribution" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "dataProvider" "public"."LeadDataProvider" NOT NULL,
    "sourceApiEndpoint" TEXT,
    "dataFields" TEXT[],
    "enrichmentDate" TIMESTAMP(3) NOT NULL,
    "termsOfService" TEXT,
    "dataProcessingAgreement" TEXT,
    "complianceNotes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadIntelligenceDataAttribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LeadIntelligenceDataDeletionRequest" (
    "id" TEXT NOT NULL,
    "leadId" TEXT,
    "userEmail" TEXT,
    "requestType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "requestDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completionDate" TIMESTAMP(3),
    "dataTypesToDelete" TEXT[],
    "reason" TEXT,
    "requesterName" TEXT NOT NULL,
    "requesterEmail" TEXT NOT NULL,
    "verificationMethod" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadIntelligenceDataDeletionRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserIntegration" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmailTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "textContent" TEXT,
    "type" "public"."EmailTemplateType" NOT NULL,
    "variables" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT NOT NULL,
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "openCount" INTEGER NOT NULL DEFAULT 0,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "replyCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmailSequence" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "public"."EmailSequenceStatus" NOT NULL DEFAULT 'DRAFT',
    "userId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "maxEmails" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailSequence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmailSequenceStep" (
    "id" TEXT NOT NULL,
    "sequenceId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "delayDays" INTEGER NOT NULL DEFAULT 0,
    "delayHours" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailSequenceStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmailSequenceRecipient" (
    "id" TEXT NOT NULL,
    "sequenceId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "customFields" JSONB,
    "status" "public"."RecipientStatus" NOT NULL DEFAULT 'ACTIVE',
    "currentStep" INTEGER NOT NULL DEFAULT 0,
    "nextSendAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "unsubscribedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailSequenceRecipient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmailSend" (
    "id" TEXT NOT NULL,
    "templateId" TEXT,
    "recipientId" TEXT,
    "toEmail" TEXT NOT NULL,
    "toName" TEXT,
    "fromEmail" TEXT NOT NULL,
    "fromName" TEXT,
    "subject" TEXT NOT NULL,
    "htmlContent" TEXT NOT NULL,
    "textContent" TEXT,
    "status" "public"."EmailSendStatus" NOT NULL DEFAULT 'PENDING',
    "externalId" TEXT,
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "firstOpenedAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),
    "firstClickedAt" TIMESTAMP(3),
    "bouncedAt" TIMESTAMP(3),
    "unsubscribedAt" TIMESTAMP(3),
    "repliedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "errorMessage" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailSend_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LinkedInProspect" (
    "id" TEXT NOT NULL,
    "linkedInId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "headline" TEXT,
    "location" TEXT,
    "industry" TEXT,
    "company" TEXT,
    "profileUrl" TEXT NOT NULL,
    "connectionDegree" TEXT NOT NULL,
    "premium" BOOLEAN NOT NULL DEFAULT false,
    "status" "public"."LinkedInProspectStatus" NOT NULL DEFAULT 'NEW',
    "score" INTEGER NOT NULL DEFAULT 50,
    "notes" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "source" TEXT NOT NULL DEFAULT 'search',
    "email" TEXT,
    "phone" TEXT,
    "lastContact" TIMESTAMP(3),
    "nextFollowUp" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LinkedInProspect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LinkedInConnection" (
    "id" TEXT NOT NULL,
    "prospectId" TEXT NOT NULL,
    "status" "public"."LinkedInConnectionStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LinkedInConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LinkedInMessage" (
    "id" TEXT NOT NULL,
    "prospectId" TEXT NOT NULL,
    "type" "public"."LinkedInMessageType" NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'sent',
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),
    "repliedAt" TIMESTAMP(3),
    "threadId" TEXT,
    "isReply" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LinkedInMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LinkedInAutomationSequence" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "public"."LinkedInAutomationStatus" NOT NULL DEFAULT 'ACTIVE',
    "dailyLimit" INTEGER NOT NULL DEFAULT 50,
    "weeklyLimit" INTEGER NOT NULL DEFAULT 200,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LinkedInAutomationSequence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LinkedInAutomationStep" (
    "id" TEXT NOT NULL,
    "sequenceId" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "type" "public"."LinkedInMessageType" NOT NULL,
    "delayDays" INTEGER NOT NULL DEFAULT 0,
    "content" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LinkedInAutomationStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LinkedInAutomationActivity" (
    "id" TEXT NOT NULL,
    "prospectId" TEXT,
    "sequenceId" TEXT,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "errorMessage" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LinkedInAutomationActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LinkedInSearch" (
    "id" TEXT NOT NULL,
    "searchQuery" TEXT NOT NULL,
    "filters" JSONB,
    "totalResults" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LinkedInSearch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Deal" (
    "id" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "stage" TEXT NOT NULL,
    "probability" INTEGER NOT NULL,
    "expectedCloseDate" TIMESTAMP(3) NOT NULL,
    "source" TEXT NOT NULL,
    "lastActivity" TIMESTAMP(3),
    "notes" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BusinessActivity" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "leadId" TEXT,
    "prospectId" TEXT,
    "dealId" TEXT,
    "metadata" JSONB,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BusinessActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AutomationSequence" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "trigger" "public"."AutomationTrigger" NOT NULL,
    "status" "public"."AutomationStatus" NOT NULL DEFAULT 'DRAFT',
    "targetAudience" JSONB,
    "activatedAt" TIMESTAMP(3),
    "pausedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AutomationSequence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AutomationStep" (
    "id" TEXT NOT NULL,
    "sequenceId" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "type" "public"."AutomationStepType" NOT NULL,
    "name" TEXT NOT NULL,
    "delayDays" INTEGER NOT NULL DEFAULT 0,
    "delayHours" INTEGER NOT NULL DEFAULT 0,
    "templateId" TEXT,
    "customContent" TEXT,
    "conditions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AutomationStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AutomationRecipient" (
    "id" TEXT NOT NULL,
    "sequenceId" TEXT NOT NULL,
    "leadId" TEXT,
    "prospectId" TEXT,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "company" TEXT,
    "jobTitle" TEXT,
    "customFields" JSONB,
    "currentStep" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AutomationRecipient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreference_userId_key" ON "public"."NotificationPreference"("userId");

-- CreateIndex
CREATE INDEX "NotificationPreference_userId_idx" ON "public"."NotificationPreference"("userId");

-- CreateIndex
CREATE INDEX "Task_projectId_status_idx" ON "public"."Task"("projectId", "status");

-- CreateIndex
CREATE INDEX "TeamMember_userId_idx" ON "public"."TeamMember"("userId");

-- CreateIndex
CREATE INDEX "ActionTask_userId_status_idx" ON "public"."ActionTask"("userId", "status");

-- CreateIndex
CREATE INDEX "ActionTask_category_idx" ON "public"."ActionTask"("category");

-- CreateIndex
CREATE INDEX "ActionTask_dueDate_idx" ON "public"."ActionTask"("dueDate");

-- CreateIndex
CREATE INDEX "ActionTask_priority_idx" ON "public"."ActionTask"("priority");

-- CreateIndex
CREATE UNIQUE INDEX "LeadIntelligenceCompany_domain_key" ON "public"."LeadIntelligenceCompany"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "LeadIntelligenceCompany_apolloId_key" ON "public"."LeadIntelligenceCompany"("apolloId");

-- CreateIndex
CREATE UNIQUE INDEX "LeadIntelligenceCompany_zoomInfoId_key" ON "public"."LeadIntelligenceCompany"("zoomInfoId");

-- CreateIndex
CREATE INDEX "LeadIntelligenceCompany_domain_idx" ON "public"."LeadIntelligenceCompany"("domain");

-- CreateIndex
CREATE INDEX "LeadIntelligenceCompany_dataProvider_idx" ON "public"."LeadIntelligenceCompany"("dataProvider");

-- CreateIndex
CREATE UNIQUE INDEX "EnrichedLead_email_key" ON "public"."EnrichedLead"("email");

-- CreateIndex
CREATE UNIQUE INDEX "EnrichedLead_apolloPersonId_key" ON "public"."EnrichedLead"("apolloPersonId");

-- CreateIndex
CREATE UNIQUE INDEX "EnrichedLead_zoomInfoPersonId_key" ON "public"."EnrichedLead"("zoomInfoPersonId");

-- CreateIndex
CREATE INDEX "EnrichedLead_email_idx" ON "public"."EnrichedLead"("email");

-- CreateIndex
CREATE INDEX "EnrichedLead_assignedToUserId_idx" ON "public"."EnrichedLead"("assignedToUserId");

-- CreateIndex
CREATE INDEX "EnrichedLead_status_idx" ON "public"."EnrichedLead"("status");

-- CreateIndex
CREATE INDEX "EnrichedLead_dataProvider_idx" ON "public"."EnrichedLead"("dataProvider");

-- CreateIndex
CREATE INDEX "LeadIntelligenceSearch_userId_idx" ON "public"."LeadIntelligenceSearch"("userId");

-- CreateIndex
CREATE INDEX "LeadIntelligenceSearch_status_idx" ON "public"."LeadIntelligenceSearch"("status");

-- CreateIndex
CREATE INDEX "LeadIntelligenceSearchResult_leadSearchId_idx" ON "public"."LeadIntelligenceSearchResult"("leadSearchId");

-- CreateIndex
CREATE INDEX "LeadIntelligenceSearchResult_processingStatus_idx" ON "public"."LeadIntelligenceSearchResult"("processingStatus");

-- CreateIndex
CREATE INDEX "LeadIntelligenceEnrichmentQueue_status_priority_idx" ON "public"."LeadIntelligenceEnrichmentQueue"("status", "priority");

-- CreateIndex
CREATE INDEX "LeadIntelligenceEnrichmentQueue_scheduledAt_idx" ON "public"."LeadIntelligenceEnrichmentQueue"("scheduledAt");

-- CreateIndex
CREATE INDEX "LeadIntelligenceActivity_leadId_idx" ON "public"."LeadIntelligenceActivity"("leadId");

-- CreateIndex
CREATE INDEX "LeadIntelligenceActivity_type_idx" ON "public"."LeadIntelligenceActivity"("type");

-- CreateIndex
CREATE INDEX "LeadIntelligenceActivity_userId_idx" ON "public"."LeadIntelligenceActivity"("userId");

-- CreateIndex
CREATE INDEX "LeadIntelligenceEmailCampaign_userId_idx" ON "public"."LeadIntelligenceEmailCampaign"("userId");

-- CreateIndex
CREATE INDEX "LeadIntelligenceEmailCampaign_status_idx" ON "public"."LeadIntelligenceEmailCampaign"("status");

-- CreateIndex
CREATE INDEX "LeadIntelligenceApiUsageTracking_userId_provider_date_idx" ON "public"."LeadIntelligenceApiUsageTracking"("userId", "provider", "date");

-- CreateIndex
CREATE INDEX "LeadIntelligenceApiUsageTracking_date_idx" ON "public"."LeadIntelligenceApiUsageTracking"("date");

-- CreateIndex
CREATE UNIQUE INDEX "LeadIntelligenceApiUsageTracking_userId_provider_endpoint_d_key" ON "public"."LeadIntelligenceApiUsageTracking"("userId", "provider", "endpoint", "date");

-- CreateIndex
CREATE INDEX "LeadIntelligenceDataConsent_leadId_consentType_idx" ON "public"."LeadIntelligenceDataConsent"("leadId", "consentType");

-- CreateIndex
CREATE INDEX "LeadIntelligenceDataAttribution_leadId_idx" ON "public"."LeadIntelligenceDataAttribution"("leadId");

-- CreateIndex
CREATE INDEX "LeadIntelligenceDataAttribution_dataProvider_idx" ON "public"."LeadIntelligenceDataAttribution"("dataProvider");

-- CreateIndex
CREATE INDEX "LeadIntelligenceDataDeletionRequest_status_idx" ON "public"."LeadIntelligenceDataDeletionRequest"("status");

-- CreateIndex
CREATE INDEX "LeadIntelligenceDataDeletionRequest_requestType_idx" ON "public"."LeadIntelligenceDataDeletionRequest"("requestType");

-- CreateIndex
CREATE INDEX "UserIntegration_userId_idx" ON "public"."UserIntegration"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserIntegration_userId_provider_key" ON "public"."UserIntegration"("userId", "provider");

-- CreateIndex
CREATE INDEX "EmailTemplate_userId_idx" ON "public"."EmailTemplate"("userId");

-- CreateIndex
CREATE INDEX "EmailTemplate_type_idx" ON "public"."EmailTemplate"("type");

-- CreateIndex
CREATE INDEX "EmailSequence_userId_idx" ON "public"."EmailSequence"("userId");

-- CreateIndex
CREATE INDEX "EmailSequence_status_idx" ON "public"."EmailSequence"("status");

-- CreateIndex
CREATE INDEX "EmailSequenceStep_sequenceId_idx" ON "public"."EmailSequenceStep"("sequenceId");

-- CreateIndex
CREATE UNIQUE INDEX "EmailSequenceStep_sequenceId_stepNumber_key" ON "public"."EmailSequenceStep"("sequenceId", "stepNumber");

-- CreateIndex
CREATE INDEX "EmailSequenceRecipient_sequenceId_idx" ON "public"."EmailSequenceRecipient"("sequenceId");

-- CreateIndex
CREATE INDEX "EmailSequenceRecipient_email_idx" ON "public"."EmailSequenceRecipient"("email");

-- CreateIndex
CREATE INDEX "EmailSequenceRecipient_nextSendAt_idx" ON "public"."EmailSequenceRecipient"("nextSendAt");

-- CreateIndex
CREATE UNIQUE INDEX "EmailSequenceRecipient_sequenceId_email_key" ON "public"."EmailSequenceRecipient"("sequenceId", "email");

-- CreateIndex
CREATE INDEX "EmailSend_userId_idx" ON "public"."EmailSend"("userId");

-- CreateIndex
CREATE INDEX "EmailSend_status_idx" ON "public"."EmailSend"("status");

-- CreateIndex
CREATE INDEX "EmailSend_toEmail_idx" ON "public"."EmailSend"("toEmail");

-- CreateIndex
CREATE INDEX "EmailSend_sentAt_idx" ON "public"."EmailSend"("sentAt");

-- CreateIndex
CREATE UNIQUE INDEX "LinkedInProspect_linkedInId_key" ON "public"."LinkedInProspect"("linkedInId");

-- CreateIndex
CREATE INDEX "LinkedInProspect_userId_idx" ON "public"."LinkedInProspect"("userId");

-- CreateIndex
CREATE INDEX "LinkedInProspect_status_idx" ON "public"."LinkedInProspect"("status");

-- CreateIndex
CREATE INDEX "LinkedInProspect_linkedInId_idx" ON "public"."LinkedInProspect"("linkedInId");

-- CreateIndex
CREATE INDEX "LinkedInConnection_prospectId_idx" ON "public"."LinkedInConnection"("prospectId");

-- CreateIndex
CREATE INDEX "LinkedInConnection_status_idx" ON "public"."LinkedInConnection"("status");

-- CreateIndex
CREATE INDEX "LinkedInConnection_sentAt_idx" ON "public"."LinkedInConnection"("sentAt");

-- CreateIndex
CREATE INDEX "LinkedInMessage_prospectId_idx" ON "public"."LinkedInMessage"("prospectId");

-- CreateIndex
CREATE INDEX "LinkedInMessage_type_idx" ON "public"."LinkedInMessage"("type");

-- CreateIndex
CREATE INDEX "LinkedInMessage_sentAt_idx" ON "public"."LinkedInMessage"("sentAt");

-- CreateIndex
CREATE INDEX "LinkedInAutomationSequence_userId_idx" ON "public"."LinkedInAutomationSequence"("userId");

-- CreateIndex
CREATE INDEX "LinkedInAutomationSequence_status_idx" ON "public"."LinkedInAutomationSequence"("status");

-- CreateIndex
CREATE INDEX "LinkedInAutomationStep_sequenceId_idx" ON "public"."LinkedInAutomationStep"("sequenceId");

-- CreateIndex
CREATE UNIQUE INDEX "LinkedInAutomationStep_sequenceId_stepNumber_key" ON "public"."LinkedInAutomationStep"("sequenceId", "stepNumber");

-- CreateIndex
CREATE INDEX "LinkedInAutomationActivity_userId_idx" ON "public"."LinkedInAutomationActivity"("userId");

-- CreateIndex
CREATE INDEX "LinkedInAutomationActivity_type_idx" ON "public"."LinkedInAutomationActivity"("type");

-- CreateIndex
CREATE INDEX "LinkedInAutomationActivity_status_idx" ON "public"."LinkedInAutomationActivity"("status");

-- CreateIndex
CREATE INDEX "LinkedInAutomationActivity_prospectId_idx" ON "public"."LinkedInAutomationActivity"("prospectId");

-- CreateIndex
CREATE INDEX "LinkedInSearch_userId_idx" ON "public"."LinkedInSearch"("userId");

-- CreateIndex
CREATE INDEX "Deal_userId_idx" ON "public"."Deal"("userId");

-- CreateIndex
CREATE INDEX "Deal_stage_idx" ON "public"."Deal"("stage");

-- CreateIndex
CREATE INDEX "Deal_source_idx" ON "public"."Deal"("source");

-- CreateIndex
CREATE INDEX "BusinessActivity_userId_idx" ON "public"."BusinessActivity"("userId");

-- CreateIndex
CREATE INDEX "BusinessActivity_type_idx" ON "public"."BusinessActivity"("type");

-- CreateIndex
CREATE INDEX "BusinessActivity_leadId_idx" ON "public"."BusinessActivity"("leadId");

-- CreateIndex
CREATE INDEX "BusinessActivity_prospectId_idx" ON "public"."BusinessActivity"("prospectId");

-- CreateIndex
CREATE INDEX "AutomationSequence_userId_idx" ON "public"."AutomationSequence"("userId");

-- CreateIndex
CREATE INDEX "AutomationSequence_status_idx" ON "public"."AutomationSequence"("status");

-- CreateIndex
CREATE INDEX "AutomationSequence_type_idx" ON "public"."AutomationSequence"("type");

-- CreateIndex
CREATE INDEX "AutomationStep_sequenceId_idx" ON "public"."AutomationStep"("sequenceId");

-- CreateIndex
CREATE INDEX "AutomationStep_stepNumber_idx" ON "public"."AutomationStep"("stepNumber");

-- CreateIndex
CREATE INDEX "AutomationRecipient_sequenceId_idx" ON "public"."AutomationRecipient"("sequenceId");

-- CreateIndex
CREATE INDEX "AutomationRecipient_email_idx" ON "public"."AutomationRecipient"("email");

-- CreateIndex
CREATE INDEX "AutomationRecipient_status_idx" ON "public"."AutomationRecipient"("status");

-- CreateIndex
CREATE INDEX "AutomationRecipient_currentStep_idx" ON "public"."AutomationRecipient"("currentStep");

-- CreateIndex
CREATE INDEX "Notification_status_scheduledFor_idx" ON "public"."Notification"("status", "scheduledFor");

-- AddForeignKey
ALTER TABLE "public"."NotificationPreference" ADD CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Task" ADD CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Task" ADD CONSTRAINT "Task_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "public"."TeamMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeamMember" ADD CONSTRAINT "TeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ActionTask" ADD CONSTRAINT "ActionTask_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "public"."TeamMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ActionTask" ADD CONSTRAINT "ActionTask_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TimeEntry" ADD CONSTRAINT "TimeEntry_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "public"."Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EnrichedLead" ADD CONSTRAINT "EnrichedLead_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."LeadIntelligenceCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EnrichedLead" ADD CONSTRAINT "EnrichedLead_assignedToUserId_fkey" FOREIGN KEY ("assignedToUserId") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LeadIntelligenceSearch" ADD CONSTRAINT "LeadIntelligenceSearch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LeadIntelligenceSearchResult" ADD CONSTRAINT "LeadIntelligenceSearchResult_leadSearchId_fkey" FOREIGN KEY ("leadSearchId") REFERENCES "public"."LeadIntelligenceSearch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LeadIntelligenceSearchResult" ADD CONSTRAINT "LeadIntelligenceSearchResult_enrichedLeadId_fkey" FOREIGN KEY ("enrichedLeadId") REFERENCES "public"."EnrichedLead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LeadIntelligenceEnrichmentQueue" ADD CONSTRAINT "LeadIntelligenceEnrichmentQueue_searchResultId_fkey" FOREIGN KEY ("searchResultId") REFERENCES "public"."LeadIntelligenceSearchResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LeadIntelligenceActivity" ADD CONSTRAINT "LeadIntelligenceActivity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "public"."EnrichedLead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LeadIntelligenceActivity" ADD CONSTRAINT "LeadIntelligenceActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LeadIntelligenceEmailCampaign" ADD CONSTRAINT "LeadIntelligenceEmailCampaign_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LeadIntelligenceApiUsageTracking" ADD CONSTRAINT "LeadIntelligenceApiUsageTracking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LeadIntelligenceDataConsent" ADD CONSTRAINT "LeadIntelligenceDataConsent_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "public"."EnrichedLead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LeadIntelligenceDataAttribution" ADD CONSTRAINT "LeadIntelligenceDataAttribution_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "public"."EnrichedLead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserIntegration" ADD CONSTRAINT "UserIntegration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailTemplate" ADD CONSTRAINT "EmailTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailSequence" ADD CONSTRAINT "EmailSequence_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailSequenceStep" ADD CONSTRAINT "EmailSequenceStep_sequenceId_fkey" FOREIGN KEY ("sequenceId") REFERENCES "public"."EmailSequence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailSequenceStep" ADD CONSTRAINT "EmailSequenceStep_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."EmailTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailSequenceRecipient" ADD CONSTRAINT "EmailSequenceRecipient_sequenceId_fkey" FOREIGN KEY ("sequenceId") REFERENCES "public"."EmailSequence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailSend" ADD CONSTRAINT "EmailSend_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."EmailTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailSend" ADD CONSTRAINT "EmailSend_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "public"."EmailSequenceRecipient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailSend" ADD CONSTRAINT "EmailSend_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LinkedInProspect" ADD CONSTRAINT "LinkedInProspect_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LinkedInConnection" ADD CONSTRAINT "LinkedInConnection_prospectId_fkey" FOREIGN KEY ("prospectId") REFERENCES "public"."LinkedInProspect"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LinkedInMessage" ADD CONSTRAINT "LinkedInMessage_prospectId_fkey" FOREIGN KEY ("prospectId") REFERENCES "public"."LinkedInProspect"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LinkedInAutomationSequence" ADD CONSTRAINT "LinkedInAutomationSequence_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LinkedInAutomationStep" ADD CONSTRAINT "LinkedInAutomationStep_sequenceId_fkey" FOREIGN KEY ("sequenceId") REFERENCES "public"."LinkedInAutomationSequence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LinkedInAutomationActivity" ADD CONSTRAINT "LinkedInAutomationActivity_prospectId_fkey" FOREIGN KEY ("prospectId") REFERENCES "public"."LinkedInProspect"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LinkedInAutomationActivity" ADD CONSTRAINT "LinkedInAutomationActivity_sequenceId_fkey" FOREIGN KEY ("sequenceId") REFERENCES "public"."LinkedInAutomationSequence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LinkedInAutomationActivity" ADD CONSTRAINT "LinkedInAutomationActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LinkedInSearch" ADD CONSTRAINT "LinkedInSearch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Deal" ADD CONSTRAINT "Deal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BusinessActivity" ADD CONSTRAINT "BusinessActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AutomationSequence" ADD CONSTRAINT "AutomationSequence_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AutomationStep" ADD CONSTRAINT "AutomationStep_sequenceId_fkey" FOREIGN KEY ("sequenceId") REFERENCES "public"."AutomationSequence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AutomationRecipient" ADD CONSTRAINT "AutomationRecipient_sequenceId_fkey" FOREIGN KEY ("sequenceId") REFERENCES "public"."AutomationSequence"("id") ON DELETE CASCADE ON UPDATE CASCADE;
