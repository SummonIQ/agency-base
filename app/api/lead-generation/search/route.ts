import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { prospectDiscovery } from '@/lib/lead-generation/prospect-discovery';

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
      industry,
      size,
      location,
      techStack,
      revenue,
      keywords,
      limit = 50,
      contactFilters
    } = body;

    // Search for companies
    const companies = await prospectDiscovery.searchCompanies({
      industry,
      size,
      location,
      techStack: techStack ? techStack.split(',').map((t: string) => t.trim()) : undefined,
      revenue,
      keywords,
      limit
    });

    // Enrich with contacts and scoring
    const enrichedProspects = await Promise.all(
      companies.map(async (company) => {
        const contacts = await prospectDiscovery.findContacts(company.id, contactFilters);

        // Score each prospect
        const scores = await Promise.all(
          contacts.map(contact =>
            prospectDiscovery.scoreProspect(company, contact)
          )
        );

        // Get the highest scored contact
        const bestContactIndex = scores.reduce((best, score, index) =>
          score.overall > scores[best].overall ? index : best, 0
        );

        return {
          company,
          contact: contacts[bestContactIndex],
          score: scores[bestContactIndex],
          allContacts: contacts
        };
      })
    );

    // Sort by score
    enrichedProspects.sort((a, b) => b.score.overall - a.score.overall);

    return NextResponse.json({
      results: enrichedProspects,
      total: enrichedProspects.length
    });
  } catch (error) {
    console.error('Lead generation search error:', error);
    return NextResponse.json(
      { error: 'Failed to search prospects' },
      { status: 500 }
    );
  }
}