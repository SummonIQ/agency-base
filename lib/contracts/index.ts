import { db } from '@/lib/db';
import { ContractStatus, Prisma } from '@prisma/client';

export async function getContracts(userId: string) {
  return db.contract.findMany({
    where: { userId },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          status: true,
        },
      },
      proposal: {
        select: {
          id: true,
          title: true,
          status: true,
        },
      },
      _count: {
        select: {
          projects: true,
          invoices: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function getContract(id: string, userId: string) {
  return db.contract.findFirst({
    where: {
      id,
      userId,
    },
    include: {
      client: true,
      proposal: {
        include: {
          proposalItems: true,
        },
      },
      projects: {
        orderBy: { createdAt: 'desc' },
      },
      invoices: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });
}

export async function createContract(
  userId: string,
  data: {
    title: string;
    contractNumber: string;
    status?: ContractStatus;
    startDate: Date;
    endDate?: Date;
    terms?: string;
    scope?: string;
    totalValue: number;
    paymentTerms?: string;
    paymentSchedule?: any;
    clientId: string;
    proposalId?: string;
  }
) {
  return db.contract.create({
    data: {
      ...data,
      userId,
    },
    include: {
      client: true,
      proposal: true,
    },
  });
}

export async function updateContract(
  id: string,
  userId: string,
  data: Prisma.ContractUpdateInput
) {
  return db.contract.update({
    where: {
      id,
      userId,
    },
    data,
    include: {
      client: true,
      proposal: true,
    },
  });
}

export async function deleteContract(id: string, userId: string) {
  return db.contract.delete({
    where: {
      id,
      userId,
    },
  });
}

export async function signContract(
  id: string, 
  userId: string, 
  signatureData: {
    signedByAgency?: boolean;
    signedByClient?: boolean;
    agencySignatureName?: string;
    clientSignatureName?: string;
  }
) {
  const updateData: Prisma.ContractUpdateInput = {};

  if (signatureData.signedByAgency) {
    updateData.signedByAgencyAt = new Date();
    updateData.agencySignatureName = signatureData.agencySignatureName;
  }

  if (signatureData.signedByClient) {
    updateData.signedByClientAt = new Date();
    updateData.clientSignatureName = signatureData.clientSignatureName;
  }

  // Check if both parties have signed
  const contract = await db.contract.findFirst({
    where: { id, userId },
  });

  const bothSigned = (
    (contract?.signedByAgencyAt || signatureData.signedByAgency) &&
    (contract?.signedByClientAt || signatureData.signedByClient)
  );

  if (bothSigned) {
    updateData.status = 'SIGNED';
  }

  return db.contract.update({
    where: {
      id,
      userId,
    },
    data: updateData,
    include: {
      client: true,
      proposal: true,
    },
  });
}

export async function getContractStats(userId: string) {
  const [totalContracts, activeContracts, signedContracts, totalValue] = await Promise.all([
    db.contract.count({ where: { userId } }),
    db.contract.count({ 
      where: { 
        userId, 
        status: { in: ['ACTIVE', 'SIGNED'] } 
      } 
    }),
    db.contract.count({ where: { userId, status: 'SIGNED' } }),
    db.contract.aggregate({
      where: { userId },
      _sum: { totalValue: true },
    }),
  ]);

  return {
    totalContracts,
    activeContracts,
    signedContracts,
    totalValue: totalValue._sum.totalValue || 0,
  };
}

export async function generateContractNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  
  // Find the latest contract for this month
  const latestContract = await db.contract.findFirst({
    where: {
      contractNumber: {
        startsWith: `${year}${month}-`,
      },
    },
    orderBy: {
      contractNumber: 'desc',
    },
  });

  let sequenceNumber = 1;
  if (latestContract) {
    const parts = latestContract.contractNumber.split('-');
    if (parts.length === 2) {
      sequenceNumber = parseInt(parts[1]) + 1;
    }
  }

  return `${year}${month}-${String(sequenceNumber).padStart(3, '0')}`;
}

export async function renewContract(id: string, userId: string, renewalData: {
  endDate: Date;
  totalValue?: number;
  terms?: string;
}) {
  const originalContract = await db.contract.findFirst({
    where: { id, userId },
    include: { client: true },
  });

  if (!originalContract) {
    throw new Error('Contract not found');
  }

  const newContractNumber = await generateContractNumber();

  return db.contract.create({
    data: {
      title: `${originalContract.title} (Renewal)`,
      contractNumber: newContractNumber,
      status: 'DRAFT',
      startDate: originalContract.endDate || new Date(),
      endDate: renewalData.endDate,
      terms: renewalData.terms || originalContract.terms,
      scope: originalContract.scope,
      totalValue: renewalData.totalValue || originalContract.totalValue,
      paymentTerms: originalContract.paymentTerms,
      paymentSchedule: originalContract.paymentSchedule,
      clientId: originalContract.clientId,
      userId,
    },
    include: {
      client: true,
    },
  });
}