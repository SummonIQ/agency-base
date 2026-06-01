-- AlterTable
ALTER TABLE "public"."JobApplication" ADD COLUMN     "requisitionId" TEXT;

-- CreateTable
CREATE TABLE "public"."JobRequisition" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "department" TEXT,
    "location" TEXT,
    "type" TEXT NOT NULL DEFAULT 'full-time',
    "status" TEXT NOT NULL DEFAULT 'open',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "requiredSkills" TEXT[],
    "preferredSkills" TEXT[],
    "experienceLevel" TEXT,
    "minExperience" INTEGER,
    "maxExperience" INTEGER,
    "education" TEXT,
    "certifications" TEXT[],
    "salaryMin" DOUBLE PRECISION,
    "salaryMax" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "benefits" TEXT[],
    "startDate" TIMESTAMP(3),
    "targetFillDate" TIMESTAMP(3),
    "filledDate" TIMESTAMP(3),
    "hiringManager" TEXT,
    "numberOfPositions" INTEGER NOT NULL DEFAULT 1,
    "positionsFilled" INTEGER NOT NULL DEFAULT 0,
    "isVisibleToClient" BOOLEAN NOT NULL DEFAULT true,
    "shareToken" TEXT,
    "clientId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobRequisition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ClientCandidateFeedback" (
    "id" TEXT NOT NULL,
    "rating" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "comments" TEXT,
    "strengths" TEXT[],
    "concerns" TEXT[],
    "moveForward" BOOLEAN,
    "interviewRequested" BOOLEAN NOT NULL DEFAULT false,
    "preferredInterviewDates" TEXT[],
    "requisitionId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientCandidateFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JobRequisition_shareToken_key" ON "public"."JobRequisition"("shareToken");

-- CreateIndex
CREATE INDEX "JobRequisition_clientId_idx" ON "public"."JobRequisition"("clientId");

-- CreateIndex
CREATE INDEX "JobRequisition_userId_idx" ON "public"."JobRequisition"("userId");

-- CreateIndex
CREATE INDEX "JobRequisition_status_idx" ON "public"."JobRequisition"("status");

-- CreateIndex
CREATE INDEX "ClientCandidateFeedback_requisitionId_idx" ON "public"."ClientCandidateFeedback"("requisitionId");

-- CreateIndex
CREATE INDEX "ClientCandidateFeedback_candidateId_idx" ON "public"."ClientCandidateFeedback"("candidateId");

-- CreateIndex
CREATE INDEX "ClientCandidateFeedback_clientId_idx" ON "public"."ClientCandidateFeedback"("clientId");

-- CreateIndex
CREATE INDEX "ClientCandidateFeedback_status_idx" ON "public"."ClientCandidateFeedback"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ClientCandidateFeedback_requisitionId_candidateId_clientId_key" ON "public"."ClientCandidateFeedback"("requisitionId", "candidateId", "clientId");

-- CreateIndex
CREATE INDEX "JobApplication_requisitionId_idx" ON "public"."JobApplication"("requisitionId");

-- AddForeignKey
ALTER TABLE "public"."JobApplication" ADD CONSTRAINT "JobApplication_requisitionId_fkey" FOREIGN KEY ("requisitionId") REFERENCES "public"."JobRequisition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."JobRequisition" ADD CONSTRAINT "JobRequisition_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."JobRequisition" ADD CONSTRAINT "JobRequisition_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClientCandidateFeedback" ADD CONSTRAINT "ClientCandidateFeedback_requisitionId_fkey" FOREIGN KEY ("requisitionId") REFERENCES "public"."JobRequisition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClientCandidateFeedback" ADD CONSTRAINT "ClientCandidateFeedback_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "public"."Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClientCandidateFeedback" ADD CONSTRAINT "ClientCandidateFeedback_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
