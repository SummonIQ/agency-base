import { db } from '@/lib/db';
import { ProposalStatus, Prisma } from '@prisma/client';

export async function getProposals(userId: string) {
  return db.proposal.findMany({
    where: { userId },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          status: true,
        },
      },
      lead: {
        select: {
          id: true,
          title: true,
          status: true,
        },
      },
      proposalItems: true,
      _count: {
        select: {
          proposalItems: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function getProposal(id: string, userId: string) {
  return db.proposal.findFirst({
    where: {
      id,
      userId,
    },
    include: {
      client: true,
      lead: true,
      proposalItems: {
        orderBy: { id: 'asc' },
      },
      contract: true,
    },
  });
}

export async function createProposal(
  userId: string,
  data: {
    title: string;
    status?: ProposalStatus;
    executiveSummary?: string;
    scope?: string;
    deliverables?: any;
    timeline?: string;
    terms?: string;
    totalAmount: number;
    validUntil: Date;
    clientId?: string;
    leadId?: string;
    proposalItems?: {
      description: string;
      quantity: number;
      rate: number;
      amount: number;
    }[];
  }
) {
  const { proposalItems, ...proposalData } = data;

  // Generate a unique share token for client-facing access
  const shareToken = `prop_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

  return db.proposal.create({
    data: {
      ...proposalData,
      shareToken,
      userId,
      proposalItems: proposalItems ? {
        create: proposalItems,
      } : undefined,
    },
    include: {
      client: true,
      lead: true,
      proposalItems: true,
    },
  });
}

export async function updateProposal(
  id: string,
  userId: string,
  data: Prisma.ProposalUpdateInput
) {
  return db.proposal.update({
    where: {
      id,
      userId,
    },
    data,
    include: {
      client: true,
      lead: true,
      proposalItems: true,
    },
  });
}

export async function deleteProposal(id: string, userId: string) {
  return db.proposal.delete({
    where: {
      id,
      userId,
    },
  });
}

export async function sendProposal(id: string, userId: string) {
  return db.proposal.update({
    where: {
      id,
      userId,
    },
    data: {
      status: 'SENT',
      sentAt: new Date(),
    },
    include: {
      client: true,
      lead: true,
    },
  });
}

export async function markProposalViewed(id: string, userId: string) {
  const proposal = await db.proposal.findFirst({
    where: { id, userId },
  });

  if (!proposal || proposal.viewedAt) {
    return proposal;
  }

  return db.proposal.update({
    where: { id },
    data: {
      status: 'VIEWED',
      viewedAt: new Date(),
    },
  });
}

export async function acceptProposal(id: string, userId: string) {
  return db.proposal.update({
    where: {
      id,
      userId,
    },
    data: {
      status: 'ACCEPTED',
      acceptedAt: new Date(),
    },
    include: {
      client: true,
      lead: true,
    },
  });
}

export async function rejectProposal(id: string, userId: string, reason?: string) {
  return db.proposal.update({
    where: {
      id,
      userId,
    },
    data: {
      status: 'REJECTED',
      rejectedAt: new Date(),
      rejectionReason: reason,
    },
  });
}

export async function getProposalStats(userId: string) {
  const [totalProposals, sentProposals, acceptedProposals, totalValue] = await Promise.all([
    db.proposal.count({ where: { userId } }),
    db.proposal.count({ 
      where: { 
        userId, 
        status: { in: ['SENT', 'VIEWED', 'NEGOTIATING'] } 
      } 
    }),
    db.proposal.count({ where: { userId, status: 'ACCEPTED' } }),
    db.proposal.aggregate({
      where: { userId },
      _sum: { totalAmount: true },
    }),
  ]);

  const acceptanceRate = sentProposals > 0 ? (acceptedProposals / sentProposals) * 100 : 0;

  return {
    totalProposals,
    sentProposals,
    acceptedProposals,
    acceptanceRate,
    totalValue: totalValue._sum.totalAmount || 0,
  };
}

export async function createContractFromProposal(proposalId: string, userId: string) {
  const proposal = await db.proposal.findFirst({
    where: { id: proposalId, userId },
    include: {
      client: true,
      proposalItems: true,
    },
  });

  if (!proposal || proposal.status !== 'ACCEPTED') {
    throw new Error('Proposal not found or not accepted');
  }

  // Generate unique contract number
  const contractNumber = `CONTRACT-${Date.now()}`;

  const contract = await db.contract.create({
    data: {
      title: proposal.title,
      contractNumber,
      status: 'DRAFT',
      startDate: new Date(),
      scope: proposal.scope,
      terms: proposal.terms,
      totalValue: proposal.totalAmount,
      clientId: proposal.clientId!,
      proposalId: proposal.id,
      userId,
    },
    include: {
      client: true,
      proposal: true,
    },
  });

  // Update proposal to link to contract
  await db.proposal.update({
    where: { id: proposalId },
    data: { contractId: contract.id },
  });

  return contract;
}

export async function duplicateProposal(id: string, userId: string, title?: string) {
  const originalProposal = await db.proposal.findFirst({
    where: { id, userId },
    include: {
      proposalItems: true,
    },
  });

  if (!originalProposal) {
    throw new Error('Proposal not found');
  }

  const { id: _, createdAt, updatedAt, sentAt, viewedAt, acceptedAt, rejectedAt, contractId, shareToken, ...proposalData } = originalProposal;

  // Generate new share token for the duplicate
  const newShareToken = `prop_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

  return db.proposal.create({
    data: {
      ...proposalData,
      title: title || `${originalProposal.title} (Copy)`,
      status: 'DRAFT',
      shareToken: newShareToken,
      proposalItems: {
        create: originalProposal.proposalItems.map(({ id, proposalId, ...item }) => item),
      },
    },
    include: {
      client: true,
      lead: true,
      proposalItems: true,
    },
  });
}

export function getProposalShareUrl(shareToken: string, baseUrl?: string): string {
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3030');
  return `${base}/shared/proposal/${shareToken}`;
}