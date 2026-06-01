import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import { LeadStatus } from '@prisma/client';

const updateLeadSchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATING', 'WON', 'LOST', 'NURTURING']).optional(),
  estimatedValue: z.number().optional(),
  probability: z.number().min(0).max(100).optional(),
  nextFollowUpDate: z.string().datetime().optional(),
  lostReason: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = updateLeadSchema.parse(body);

    // Check if lead exists and belongs to user
    const existingLead = await db.agencyLead.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingLead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    // Update the lead
    const updatedLead = await db.agencyLead.update({
      where: {
        id: params.id,
      },
      data: {
        ...validatedData,
        status: validatedData.status as LeadStatus,
        lastContactDate: validatedData.status === 'CONTACTED' ? new Date() : existingLead.lastContactDate,
        wonDate: validatedData.status === 'WON' ? new Date() : null,
        nextFollowUpDate: validatedData.nextFollowUpDate ? new Date(validatedData.nextFollowUpDate) : existingLead.nextFollowUpDate,
      },
      include: {
        client: true,
      },
    });

    return NextResponse.json(updatedLead);
  } catch (error) {
    console.error('Error updating lead:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if lead exists and belongs to user
    const existingLead = await db.agencyLead.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingLead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    // Delete the lead
    await db.agencyLead.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting lead:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}