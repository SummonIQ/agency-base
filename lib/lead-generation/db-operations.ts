import { db } from '@/lib/db';
import { LeadSource, LeadStatus, CommunicationType } from '@prisma/client';

export interface CreateLeadParams {
  userId: string;
  company: {
    name: string;
    domain?: string;
    industry?: string;
    size?: string;
    location?: string;
    revenue?: string;
    employees?: number;
    techStack?: string[];
    description?: string;
  };
  contact: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    jobTitle?: string;
    department?: string;
    seniority?: string;
    linkedinUrl?: string;
  };
  score?: number;
  source?: LeadSource;
}

export class LeadDatabaseOperations {
  /**
   * Create or update a lead from prospect data
   */
  async upsertLead(params: CreateLeadParams) {
    const {
      userId,
      company,
      contact,
      score = 0,
      source = LeadSource.COLD_OUTREACH
    } = params;

    // Check if lead exists
    const existingLead = await db.agencyLead.findFirst({
      where: {
        userId,
        OR: [
          { companyName: company.name },
          { contactEmail: contact.email }
        ]
      }
    });

    if (existingLead) {
      // Update existing lead
      return await db.agencyLead.update({
        where: { id: existingLead.id },
        data: {
          contactName: `${contact.firstName} ${contact.lastName}`,
          contactEmail: contact.email,
          contactPhone: contact.phone,
          probability: Math.round(score * 10),
          updatedAt: new Date()
        }
      });
    }

    // Create new lead
    const estimatedValue = this.calculateEstimatedValue(company.size || company.employees?.toString());

    return await db.agencyLead.create({
      data: {
        userId,
        title: `${company.name} - ${contact.jobTitle || 'Contact'}`,
        description: this.generateLeadDescription(company, contact),
        source,
        status: LeadStatus.NEW,
        companyName: company.name,
        contactName: `${contact.firstName} ${contact.lastName}`,
        contactEmail: contact.email,
        contactPhone: contact.phone,
        estimatedValue,
        probability: Math.round(score * 10),
      }
    });
  }

  /**
   * Get leads with filters
   */
  async getLeads(
    userId: string,
    filters?: {
      status?: LeadStatus;
      source?: LeadSource;
      minProbability?: number;
      clientId?: string;
      limit?: number;
    }
  ) {
    return await db.agencyLead.findMany({
      where: {
        userId,
        ...(filters?.status && { status: filters.status }),
        ...(filters?.source && { source: filters.source }),
        ...(filters?.minProbability && {
          probability: { gte: filters.minProbability }
        }),
        ...(filters?.clientId && { clientId: filters.clientId })
      },
      include: {
        client: true,
        communications: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      ...(filters?.limit && { take: filters.limit })
    });
  }

  /**
   * Update lead status
   */
  async updateLeadStatus(
    userId: string,
    leadId: string,
    status: LeadStatus,
    notes?: string
  ) {
    const lead = await db.agencyLead.findFirst({
      where: { id: leadId, userId }
    });

    if (!lead) {
      throw new Error('Lead not found');
    }

    const updateData: any = {
      status,
      updatedAt: new Date()
    };

    // Track specific status changes
    if (status === LeadStatus.WON) {
      updateData.wonDate = new Date();
    } else if (status === LeadStatus.LOST && notes) {
      updateData.lostReason = notes;
    }

    return await db.agencyLead.update({
      where: { id: leadId },
      data: updateData
    });
  }

  /**
   * Record communication with lead
   */
  async recordCommunication(
    userId: string,
    leadId: string,
    communication: {
      type: CommunicationType;
      subject?: string;
      content?: string;
      direction?: 'inbound' | 'outbound';
    }
  ) {
    // Verify lead ownership
    const lead = await db.agencyLead.findFirst({
      where: { id: leadId, userId }
    });

    if (!lead) {
      throw new Error('Lead not found');
    }

    // Create communication record
    const comm = await db.communication.create({
      data: {
        userId,
        leadId,
        type: communication.type,
        subject: communication.subject,
        content: communication.content,
        direction: communication.direction || 'outbound',
        sentAt: communication.direction === 'outbound' ? new Date() : undefined,
        receivedAt: communication.direction === 'inbound' ? new Date() : undefined,
      }
    });

    // Update lead's last contact date
    await db.agencyLead.update({
      where: { id: leadId },
      data: {
        lastContactDate: new Date(),
        ...(lead.status === LeadStatus.NEW && { status: LeadStatus.CONTACTED })
      }
    });

    return comm;
  }

  /**
   * Convert lead to client
   */
  async convertToClient(userId: string, leadId: string) {
    const lead = await db.agencyLead.findFirst({
      where: { id: leadId, userId },
      include: { client: true }
    });

    if (!lead) {
      throw new Error('Lead not found');
    }

    if (lead.client) {
      throw new Error('Lead already has a client');
    }

    // Create client from lead data
    const client = await db.client.create({
      data: {
        userId,
        name: lead.companyName || 'Unknown Company',
        email: lead.contactEmail,
        phone: lead.contactPhone,
        status: 'ACTIVE',
        source: lead.source,
        primaryContactName: lead.contactName || undefined,
        primaryContactEmail: lead.contactEmail || undefined,
        primaryContactPhone: lead.contactPhone || undefined,
        firstContactDate: lead.createdAt,
        lastContactDate: lead.lastContactDate
      }
    });

    // Update lead to reference client
    await db.agencyLead.update({
      where: { id: leadId },
      data: {
        clientId: client.id,
        status: LeadStatus.WON,
        wonDate: new Date()
      }
    });

    return client;
  }

  /**
   * Get lead analytics
   */
  async getLeadAnalytics(userId: string, dateRange?: { start: Date; end: Date }) {
    const where = {
      userId,
      ...(dateRange && {
        createdAt: {
          gte: dateRange.start,
          lte: dateRange.end
        }
      })
    };

    const [
      totalLeads,
      leadsByStatus,
      leadsBySource,
      conversionRate,
      averageDealSize
    ] = await Promise.all([
      // Total leads
      db.agencyLead.count({ where }),

      // Leads by status
      db.agencyLead.groupBy({
        by: ['status'],
        where,
        _count: true
      }),

      // Leads by source
      db.agencyLead.groupBy({
        by: ['source'],
        where,
        _count: true
      }),

      // Conversion rate
      db.agencyLead.count({
        where: { ...where, status: LeadStatus.WON }
      }),

      // Average estimated deal size
      db.agencyLead.aggregate({
        where: { ...where, estimatedValue: { not: null } },
        _avg: { estimatedValue: true }
      })
    ]);

    return {
      totalLeads,
      leadsByStatus: Object.fromEntries(
        leadsByStatus.map(item => [item.status, item._count])
      ),
      leadsBySource: Object.fromEntries(
        leadsBySource.map(item => [item.source, item._count])
      ),
      conversionRate: totalLeads > 0 ? (conversionRate / totalLeads) * 100 : 0,
      averageDealSize: averageDealSize._avg.estimatedValue || 0
    };
  }

  /**
   * Helper: Calculate estimated value based on company size
   */
  private calculateEstimatedValue(size?: string): number {
    if (!size) return 50000;

    const sizeMap: Record<string, number> = {
      '1-10': 15000,
      '11-50': 35000,
      '50-200': 75000,
      '200-500': 150000,
      '500-1000': 250000,
      '1000+': 500000
    };

    // Handle numeric employee count
    if (!isNaN(Number(size))) {
      const employees = Number(size);
      if (employees <= 10) return 15000;
      if (employees <= 50) return 35000;
      if (employees <= 200) return 75000;
      if (employees <= 500) return 150000;
      if (employees <= 1000) return 250000;
      return 500000;
    }

    return sizeMap[size] || 50000;
  }

  /**
   * Helper: Generate lead description
   */
  private generateLeadDescription(company: any, contact: any): string {
    const parts = [];

    if (company.industry) {
      parts.push(`${company.industry} company`);
    }

    if (company.size || company.employees) {
      const size = company.employees || company.size;
      parts.push(`with ${size} employees`);
    }

    if (company.location) {
      parts.push(`based in ${company.location}`);
    }

    if (contact.firstName && contact.lastName) {
      parts.push(`Contact: ${contact.firstName} ${contact.lastName}`);
      if (contact.jobTitle) {
        parts.push(`(${contact.jobTitle})`);
      }
    }

    if (company.techStack && company.techStack.length > 0) {
      parts.push(`Tech: ${company.techStack.slice(0, 3).join(', ')}`);
    }

    return parts.join(' ') || 'New lead';
  }
}

export const leadDbOps = new LeadDatabaseOperations();