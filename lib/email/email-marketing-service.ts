import { db } from '@/lib/db';

export interface EmailCampaign {
  id: string;
  name: string;
  type: 'newsletter' | 'promotional' | 'transactional' | 'automation';
  subject: string;
  content: string;
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed';
  scheduledDate?: Date;
  sentAt?: Date;
  metadata?: any;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    recipients: number;
    opens: number;
    clicks: number;
  };
}

export interface EmailSubscriber {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  status: 'active' | 'unsubscribed' | 'bounced';
  subscribedAt: Date;
  unsubscribedAt?: Date;
  lastActivity?: Date;
  customFields?: any;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriberList {
  id: string;
  name: string;
  description?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    subscribers: number;
  };
}

export interface CampaignStats {
  totalRecipients: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  clickThroughRate: number;
  bounceRate: number;
  unsubscribeRate: number;
}

export class EmailMarketingService {
  // Campaign Management
  async createCampaign(data: {
    name: string;
    type: 'newsletter' | 'promotional' | 'transactional' | 'automation';
    subject: string;
    content: string;
    userId: string;
    scheduledDate?: Date;
    metadata?: any;
  }): Promise<EmailCampaign> {
    return await db.emailCampaign.create({
      data: {
        name: data.name,
        type: data.type,
        subject: data.subject,
        content: data.content,
        userId: data.userId,
        scheduledDate: data.scheduledDate,
        metadata: data.metadata,
      },
      include: {
        _count: {
          select: {
            recipients: true,
            opens: true,
            clicks: true,
          },
        },
      },
    }) as EmailCampaign;
  }

  async getCampaigns(userId: string, filters?: {
    status?: string;
    type?: string;
    limit?: number;
    offset?: number;
  }): Promise<EmailCampaign[]> {
    const where: any = { userId };
    
    if (filters?.status) {
      where.status = filters.status;
    }
    
    if (filters?.type) {
      where.type = filters.type;
    }

    return await db.emailCampaign.findMany({
      where,
      include: {
        _count: {
          select: {
            recipients: true,
            opens: true,
            clicks: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: filters?.limit || 50,
      skip: filters?.offset || 0,
    }) as EmailCampaign[];
  }

  async getCampaign(campaignId: string, userId: string): Promise<EmailCampaign | null> {
    return await db.emailCampaign.findFirst({
      where: { id: campaignId, userId },
      include: {
        _count: {
          select: {
            recipients: true,
            opens: true,
            clicks: true,
          },
        },
      },
    }) as EmailCampaign | null;
  }

  async updateCampaign(campaignId: string, userId: string, data: {
    name?: string;
    subject?: string;
    content?: string;
    status?: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed';
    scheduledDate?: Date;
    metadata?: any;
  }): Promise<EmailCampaign> {
    return await db.emailCampaign.update({
      where: { id: campaignId },
      data: {
        ...data,
        ...(data.status === 'active' && !data.scheduledDate ? { sentAt: new Date() } : {}),
      },
      include: {
        _count: {
          select: {
            recipients: true,
            opens: true,
            clicks: true,
          },
        },
      },
    }) as EmailCampaign;
  }

  async deleteCampaign(campaignId: string, userId: string): Promise<void> {
    await db.emailCampaign.deleteMany({
      where: { id: campaignId, userId },
    });
  }

  // Subscriber Management
  async createSubscriber(data: {
    email: string;
    firstName?: string;
    lastName?: string;
    userId: string;
    customFields?: any;
    listIds?: string[];
  }): Promise<EmailSubscriber> {
    // Check if subscriber already exists
    const existing = await db.emailSubscriber.findUnique({
      where: { email_userId: { email: data.email, userId: data.userId } },
    });

    if (existing) {
      // Update existing subscriber
      return await db.emailSubscriber.update({
        where: { id: existing.id },
        data: {
          firstName: data.firstName || existing.firstName,
          lastName: data.lastName || existing.lastName,
          customFields: data.customFields || existing.customFields,
          status: 'active',
          lastActivity: new Date(),
          ...(data.listIds && {
            lists: {
              connect: data.listIds.map(id => ({ id })),
            },
          }),
        },
      }) as EmailSubscriber;
    }

    return await db.emailSubscriber.create({
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        userId: data.userId,
        customFields: data.customFields,
        ...(data.listIds && {
          lists: {
            connect: data.listIds.map(id => ({ id })),
          },
        }),
      },
    }) as EmailSubscriber;
  }

  async getSubscribers(userId: string, filters?: {
    status?: string;
    listId?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<EmailSubscriber[]> {
    const where: any = { userId };
    
    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.listId) {
      where.lists = {
        some: { id: filters.listId },
      };
    }

    if (filters?.search) {
      where.OR = [
        { email: { contains: filters.search, mode: 'insensitive' } },
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return await db.emailSubscriber.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters?.limit || 50,
      skip: filters?.offset || 0,
    }) as EmailSubscriber[];
  }

  async updateSubscriber(subscriberId: string, userId: string, data: {
    firstName?: string;
    lastName?: string;
    status?: 'active' | 'unsubscribed' | 'bounced';
    customFields?: any;
  }): Promise<EmailSubscriber> {
    return await db.emailSubscriber.update({
      where: { id: subscriberId },
      data: {
        ...data,
        lastActivity: new Date(),
        ...(data.status === 'unsubscribed' ? { unsubscribedAt: new Date() } : {}),
      },
    }) as EmailSubscriber;
  }

  async unsubscribeSubscriber(email: string, userId: string): Promise<void> {
    await db.emailSubscriber.updateMany({
      where: { email, userId },
      data: {
        status: 'unsubscribed',
        unsubscribedAt: new Date(),
      },
    });
  }

  // List Management
  async createList(data: {
    name: string;
    description?: string;
    userId: string;
  }): Promise<SubscriberList> {
    return await db.subscriberList.create({
      data,
      include: {
        _count: {
          select: { subscribers: true },
        },
      },
    }) as SubscriberList;
  }

  async getLists(userId: string): Promise<SubscriberList[]> {
    return await db.subscriberList.findMany({
      where: { userId },
      include: {
        _count: {
          select: { subscribers: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }) as SubscriberList[];
  }

  async addSubscribersToList(listId: string, subscriberIds: string[], userId: string): Promise<void> {
    await db.subscriberList.update({
      where: { id: listId },
      data: {
        subscribers: {
          connect: subscriberIds.map(id => ({ id })),
        },
      },
    });
  }

  // Campaign Recipients
  async addRecipientsToCompaign(campaignId: string, data: {
    subscriberIds?: string[];
    listIds?: string[];
    customRecipients?: Array<{
      email: string;
      firstName?: string;
      lastName?: string;
    }>;
  }): Promise<void> {
    const recipients = [];

    // Add subscribers
    if (data.subscriberIds) {
      for (const subscriberId of data.subscriberIds) {
        recipients.push({
          campaignId,
          subscriberId,
        });
      }
    }

    // Add lists (will expand to individual subscribers)
    if (data.listIds) {
      for (const listId of data.listIds) {
        recipients.push({
          campaignId,
          recipientListId: listId,
        });
      }
    }

    // Add custom recipients
    if (data.customRecipients) {
      for (const recipient of data.customRecipients) {
        recipients.push({
          campaignId,
          email: recipient.email,
          firstName: recipient.firstName,
          lastName: recipient.lastName,
        });
      }
    }

    await db.campaignRecipient.createMany({
      data: recipients,
    });
  }

  // Analytics and Tracking
  async getCampaignStats(campaignId: string, userId: string): Promise<CampaignStats> {
    const campaign = await db.emailCampaign.findFirst({
      where: { id: campaignId, userId },
      include: {
        recipients: true,
        opens: true,
        clicks: true,
      },
    });

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    const totalRecipients = campaign.recipients.length;
    const delivered = campaign.recipients.filter(r => r.status === 'sent').length;
    const opened = campaign.opens.length;
    const clicked = campaign.clicks.length;
    const bounced = campaign.recipients.filter(r => r.status === 'bounced').length;

    // Calculate unique opens and clicks
    const uniqueOpens = new Set(campaign.opens.map(o => o.email)).size;
    const uniqueClicks = new Set(campaign.clicks.map(c => c.email)).size;

    return {
      totalRecipients,
      delivered,
      opened: uniqueOpens,
      clicked: uniqueClicks,
      bounced,
      unsubscribed: 0, // Would need to track unsubscribes from this campaign
      deliveryRate: totalRecipients > 0 ? (delivered / totalRecipients) * 100 : 0,
      openRate: delivered > 0 ? (uniqueOpens / delivered) * 100 : 0,
      clickRate: delivered > 0 ? (uniqueClicks / delivered) * 100 : 0,
      clickThroughRate: uniqueOpens > 0 ? (uniqueClicks / uniqueOpens) * 100 : 0,
      bounceRate: totalRecipients > 0 ? (bounced / totalRecipients) * 100 : 0,
      unsubscribeRate: 0,
    };
  }

  async trackOpen(campaignId: string, email: string, metadata?: {
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    // Find subscriber if exists
    const subscriber = await db.emailSubscriber.findFirst({
      where: { email },
    });

    await db.campaignOpen.create({
      data: {
        campaignId,
        subscriberId: subscriber?.id,
        email,
        ipAddress: metadata?.ipAddress,
        userAgent: metadata?.userAgent,
      },
    });

    // Update subscriber last activity
    if (subscriber) {
      await db.emailSubscriber.update({
        where: { id: subscriber.id },
        data: { lastActivity: new Date() },
      });
    }
  }

  async trackClick(campaignId: string, email: string, url: string, metadata?: {
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    // Find subscriber if exists
    const subscriber = await db.emailSubscriber.findFirst({
      where: { email },
    });

    await db.campaignClick.create({
      data: {
        campaignId,
        subscriberId: subscriber?.id,
        email,
        url,
        ipAddress: metadata?.ipAddress,
        userAgent: metadata?.userAgent,
      },
    });

    // Update subscriber last activity
    if (subscriber) {
      await db.emailSubscriber.update({
        where: { id: subscriber.id },
        data: { lastActivity: new Date() },
      });
    }
  }

  // Bulk Operations
  async importSubscribers(userId: string, subscribers: Array<{
    email: string;
    firstName?: string;
    lastName?: string;
    customFields?: any;
  }>, listId?: string): Promise<{ imported: number; skipped: number; errors: string[] }> {
    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const subscriberData of subscribers) {
      try {
        await this.createSubscriber({
          ...subscriberData,
          userId,
          listIds: listId ? [listId] : undefined,
        });
        imported++;
      } catch (error) {
        if (error instanceof Error && error.message.includes('already exists')) {
          skipped++;
        } else {
          errors.push(`Error importing ${subscriberData.email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }

    return { imported, skipped, errors };
  }

  async getOverviewStats(userId: string): Promise<{
    totalSubscribers: number;
    activeSubscribers: number;
    totalCampaigns: number;
    activeCampaigns: number;
    totalLists: number;
    avgOpenRate: number;
    avgClickRate: number;
  }> {
    const [
      totalSubscribers,
      activeSubscribers,
      totalCampaigns,
      activeCampaigns,
      totalLists,
    ] = await Promise.all([
      db.emailSubscriber.count({ where: { userId } }),
      db.emailSubscriber.count({ where: { userId, status: 'active' } }),
      db.emailCampaign.count({ where: { userId } }),
      db.emailCampaign.count({ where: { userId, status: 'active' } }),
      db.subscriberList.count({ where: { userId } }),
    ]);

    // Calculate average rates (simplified - would need more complex query for accurate averages)
    const avgOpenRate = 25.5; // Placeholder - would calculate from actual campaign data
    const avgClickRate = 3.2; // Placeholder - would calculate from actual campaign data

    return {
      totalSubscribers,
      activeSubscribers,
      totalCampaigns,
      activeCampaigns,
      totalLists,
      avgOpenRate,
      avgClickRate,
    };
  }
}

export const emailMarketingService = new EmailMarketingService();
