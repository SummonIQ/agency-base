-- CreateTable
CREATE TABLE "public"."Candidate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "location" TEXT,
    "currentRole" TEXT,
    "experience" TEXT,
    "education" TEXT,
    "skills" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'new',
    "rating" INTEGER,
    "resumeUrl" TEXT,
    "linkedInUrl" TEXT,
    "portfolioUrl" TEXT,
    "customFields" JSONB,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."JobApplication" (
    "id" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "department" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "stage" TEXT,
    "salary" TEXT,
    "location" TEXT,
    "type" TEXT,
    "score" INTEGER,
    "appliedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActivity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "candidateId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TalentPool" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "tags" TEXT[],
    "qualityScore" DOUBLE PRECISION,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TalentPool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TalentPoolCandidate" (
    "id" TEXT NOT NULL,
    "talentPoolId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,

    CONSTRAINT "TalentPoolCandidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Interview" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER,
    "interviewer" TEXT,
    "notes" TEXT,
    "score" INTEGER,
    "feedback" TEXT,
    "candidateId" TEXT NOT NULL,
    "applicationId" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Interview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CandidateNote" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT,
    "candidateId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CandidateNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ApplicationNote" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT,
    "applicationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicationNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Candidate_userId_idx" ON "public"."Candidate"("userId");

-- CreateIndex
CREATE INDEX "Candidate_status_idx" ON "public"."Candidate"("status");

-- CreateIndex
CREATE INDEX "Candidate_email_idx" ON "public"."Candidate"("email");

-- CreateIndex
CREATE INDEX "JobApplication_userId_idx" ON "public"."JobApplication"("userId");

-- CreateIndex
CREATE INDEX "JobApplication_candidateId_idx" ON "public"."JobApplication"("candidateId");

-- CreateIndex
CREATE INDEX "JobApplication_status_idx" ON "public"."JobApplication"("status");

-- CreateIndex
CREATE INDEX "TalentPool_userId_idx" ON "public"."TalentPool"("userId");

-- CreateIndex
CREATE INDEX "TalentPool_category_idx" ON "public"."TalentPool"("category");

-- CreateIndex
CREATE INDEX "TalentPoolCandidate_talentPoolId_idx" ON "public"."TalentPoolCandidate"("talentPoolId");

-- CreateIndex
CREATE INDEX "TalentPoolCandidate_candidateId_idx" ON "public"."TalentPoolCandidate"("candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "TalentPoolCandidate_talentPoolId_candidateId_key" ON "public"."TalentPoolCandidate"("talentPoolId", "candidateId");

-- CreateIndex
CREATE INDEX "Interview_candidateId_idx" ON "public"."Interview"("candidateId");

-- CreateIndex
CREATE INDEX "Interview_applicationId_idx" ON "public"."Interview"("applicationId");

-- CreateIndex
CREATE INDEX "Interview_userId_idx" ON "public"."Interview"("userId");

-- CreateIndex
CREATE INDEX "Interview_scheduledAt_idx" ON "public"."Interview"("scheduledAt");

-- CreateIndex
CREATE INDEX "CandidateNote_candidateId_idx" ON "public"."CandidateNote"("candidateId");

-- CreateIndex
CREATE INDEX "CandidateNote_userId_idx" ON "public"."CandidateNote"("userId");

-- CreateIndex
CREATE INDEX "ApplicationNote_applicationId_idx" ON "public"."ApplicationNote"("applicationId");

-- CreateIndex
CREATE INDEX "ApplicationNote_userId_idx" ON "public"."ApplicationNote"("userId");

-- AddForeignKey
ALTER TABLE "public"."Candidate" ADD CONSTRAINT "Candidate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."JobApplication" ADD CONSTRAINT "JobApplication_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "public"."Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."JobApplication" ADD CONSTRAINT "JobApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TalentPool" ADD CONSTRAINT "TalentPool_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TalentPoolCandidate" ADD CONSTRAINT "TalentPoolCandidate_talentPoolId_fkey" FOREIGN KEY ("talentPoolId") REFERENCES "public"."TalentPool"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TalentPoolCandidate" ADD CONSTRAINT "TalentPoolCandidate_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "public"."Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Interview" ADD CONSTRAINT "Interview_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "public"."Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Interview" ADD CONSTRAINT "Interview_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "public"."JobApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Interview" ADD CONSTRAINT "Interview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CandidateNote" ADD CONSTRAINT "CandidateNote_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "public"."Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CandidateNote" ADD CONSTRAINT "CandidateNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ApplicationNote" ADD CONSTRAINT "ApplicationNote_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "public"."JobApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ApplicationNote" ADD CONSTRAINT "ApplicationNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
