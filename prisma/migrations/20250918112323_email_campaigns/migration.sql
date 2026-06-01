-- CreateTable
CREATE TABLE "public"."EmailCampaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "scheduledDate" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "metadata" JSONB,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmailSubscriber" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "subscribedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unsubscribedAt" TIMESTAMP(3),
    "lastActivity" TIMESTAMP(3),
    "customFields" JSONB,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailSubscriber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SubscriberList" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriberList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CampaignRecipient" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "subscriberId" TEXT,
    "recipientListId" TEXT,
    "email" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignRecipient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CampaignOpen" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "subscriberId" TEXT,
    "email" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignOpen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CampaignClick" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "subscriberId" TEXT,
    "email" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "clickedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignClick_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_EmailSubscriberToSubscriberList" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EmailSubscriberToSubscriberList_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "EmailCampaign_userId_idx" ON "public"."EmailCampaign"("userId");

-- CreateIndex
CREATE INDEX "EmailCampaign_status_idx" ON "public"."EmailCampaign"("status");

-- CreateIndex
CREATE INDEX "EmailCampaign_type_idx" ON "public"."EmailCampaign"("type");

-- CreateIndex
CREATE INDEX "EmailSubscriber_userId_idx" ON "public"."EmailSubscriber"("userId");

-- CreateIndex
CREATE INDEX "EmailSubscriber_status_idx" ON "public"."EmailSubscriber"("status");

-- CreateIndex
CREATE UNIQUE INDEX "EmailSubscriber_email_userId_key" ON "public"."EmailSubscriber"("email", "userId");

-- CreateIndex
CREATE INDEX "SubscriberList_userId_idx" ON "public"."SubscriberList"("userId");

-- CreateIndex
CREATE INDEX "CampaignRecipient_campaignId_idx" ON "public"."CampaignRecipient"("campaignId");

-- CreateIndex
CREATE INDEX "CampaignRecipient_subscriberId_idx" ON "public"."CampaignRecipient"("subscriberId");

-- CreateIndex
CREATE INDEX "CampaignRecipient_status_idx" ON "public"."CampaignRecipient"("status");

-- CreateIndex
CREATE INDEX "CampaignOpen_campaignId_idx" ON "public"."CampaignOpen"("campaignId");

-- CreateIndex
CREATE INDEX "CampaignOpen_subscriberId_idx" ON "public"."CampaignOpen"("subscriberId");

-- CreateIndex
CREATE INDEX "CampaignOpen_email_idx" ON "public"."CampaignOpen"("email");

-- CreateIndex
CREATE INDEX "CampaignClick_campaignId_idx" ON "public"."CampaignClick"("campaignId");

-- CreateIndex
CREATE INDEX "CampaignClick_subscriberId_idx" ON "public"."CampaignClick"("subscriberId");

-- CreateIndex
CREATE INDEX "CampaignClick_email_idx" ON "public"."CampaignClick"("email");

-- CreateIndex
CREATE INDEX "_EmailSubscriberToSubscriberList_B_index" ON "public"."_EmailSubscriberToSubscriberList"("B");

-- AddForeignKey
ALTER TABLE "public"."EmailCampaign" ADD CONSTRAINT "EmailCampaign_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailSubscriber" ADD CONSTRAINT "EmailSubscriber_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SubscriberList" ADD CONSTRAINT "SubscriberList_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CampaignRecipient" ADD CONSTRAINT "CampaignRecipient_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "public"."EmailCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CampaignRecipient" ADD CONSTRAINT "CampaignRecipient_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES "public"."EmailSubscriber"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CampaignRecipient" ADD CONSTRAINT "CampaignRecipient_recipientListId_fkey" FOREIGN KEY ("recipientListId") REFERENCES "public"."SubscriberList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CampaignOpen" ADD CONSTRAINT "CampaignOpen_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "public"."EmailCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CampaignOpen" ADD CONSTRAINT "CampaignOpen_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES "public"."EmailSubscriber"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CampaignClick" ADD CONSTRAINT "CampaignClick_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "public"."EmailCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CampaignClick" ADD CONSTRAINT "CampaignClick_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES "public"."EmailSubscriber"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_EmailSubscriberToSubscriberList" ADD CONSTRAINT "_EmailSubscriberToSubscriberList_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."EmailSubscriber"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_EmailSubscriberToSubscriberList" ADD CONSTRAINT "_EmailSubscriberToSubscriberList_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."SubscriberList"("id") ON DELETE CASCADE ON UPDATE CASCADE;
