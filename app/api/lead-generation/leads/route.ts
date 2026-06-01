import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { LeadSource, LeadStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const leads = await db.agencyLead.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        client: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(leads);
  } catch (error) {
    console.error('Failed to fetch leads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      description,
      companyName,
      contactName,
      contactEmail,
      contactPhone,
      estimatedValue,
      probability = 25,
      source = 'COLD_OUTREACH'
    } = body;

    // Check if lead already exists
    const existingLead = await db.agencyLead.findFirst({
      where: {
        userId: session.user.id,
        OR: [
          { companyName: companyName },
          ...(contactEmail ? [{ contactEmail: contactEmail }] : [])
        ]
      }
    });

    if (existingLead) {
      return NextResponse.json(
        { error: 'Lead already exists' },
        { status: 409 }
      );
    }

    // Create the lead
    const lead = await db.agencyLead.create({
      data: {
        userId: session.user.id,
        title,
        description,
        source: source as LeadSource,
        status: LeadStatus.NEW,
        companyName,
        contactName,
        contactEmail,
        contactPhone,
        estimatedValue,
        probability,
      }
    });

    return NextResponse.json(lead);
  } catch (error) {
    console.error('Failed to create lead:', error);
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    );
  }
}

