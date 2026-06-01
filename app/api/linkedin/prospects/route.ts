import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { linkedInService } from '@/lib/linkedin/linkedin-service';

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, data } = body;

    switch (action) {
      case 'add_prospect': {
        const { linkedInProfile, notes, tags } = data;

        if (!linkedInProfile) {
          return NextResponse.json(
            { error: 'LinkedIn profile data is required' },
            { status: 400 }
          );
        }

        // Transform LinkedIn profile to prospect data
        const prospect = linkedInService.transformToProspect(linkedInProfile);
        
        // Add custom notes and tags if provided
        if (notes) prospect.notes = notes;
        if (tags) prospect.tags = tags;

        // In a real implementation, you would save this to your database
        // For now, just return the transformed prospect
        return NextResponse.json({
          success: true,
          prospect,
        });
      }

      case 'update_prospect_status': {
        const { prospectId, status, notes } = data;

        if (!prospectId || !status) {
          return NextResponse.json(
            { error: 'Prospect ID and status are required' },
            { status: 400 }
          );
        }

        // In a real implementation, you would update the database
        // For now, just return success
        return NextResponse.json({
          success: true,
          prospectId,
          status,
          updatedAt: new Date().toISOString(),
        });
      }

      case 'add_prospect_note': {
        const { prospectId, note } = data;

        if (!prospectId || !note) {
          return NextResponse.json(
            { error: 'Prospect ID and note are required' },
            { status: 400 }
          );
        }

        // In a real implementation, you would save to database
        return NextResponse.json({
          success: true,
          noteId: `note_${Date.now()}`,
          prospectId,
          note,
          createdAt: new Date().toISOString(),
        });
      }

      case 'bulk_import_prospects': {
        const { profiles } = data;

        if (!profiles || !Array.isArray(profiles)) {
          return NextResponse.json(
            { error: 'Profiles array is required' },
            { status: 400 }
          );
        }

        // Transform all profiles to prospects
        const prospects = profiles.map(profile => 
          linkedInService.transformToProspect(profile)
        );

        return NextResponse.json({
          success: true,
          imported: prospects.length,
          prospects,
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('LinkedIn prospects API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');

    // In a real implementation, you would fetch from database
    // For now, return mock prospect data
    const mockProspects = [
      {
        id: 'prospect_1',
        linkedInProfile: {
          id: 'profile_1',
          firstName: 'Sarah',
          lastName: 'Chen',
          headline: 'VP of Engineering at TechCorp',
          location: 'San Francisco, CA',
          industry: 'Technology',
          company: 'TechCorp',
          profileUrl: 'https://linkedin.com/in/sarah-chen',
          connectionDegree: '2nd',
          premium: true,
        },
        status: 'contacted',
        score: 85,
        lastContact: '2024-01-15T10:30:00Z',
        notes: 'Interested in discussing hiring needs for Q2',
        tags: ['hot-lead', 'engineering'],
        source: 'search',
        addedAt: '2024-01-10T09:00:00Z',
      },
      {
        id: 'prospect_2',
        linkedInProfile: {
          id: 'profile_2',
          firstName: 'Michael',
          lastName: 'Rodriguez',
          headline: 'Senior Software Engineer at StartupXYZ',
          location: 'Austin, TX',
          industry: 'Software',
          company: 'StartupXYZ',
          profileUrl: 'https://linkedin.com/in/michael-rodriguez',
          connectionDegree: '3rd',
          premium: false,
        },
        status: 'new',
        score: 65,
        notes: '',
        tags: ['potential'],
        source: 'search',
        addedAt: '2024-01-12T14:20:00Z',
      },
    ];

    // Filter by status if provided
    let filteredProspects = mockProspects;
    if (status) {
      filteredProspects = mockProspects.filter(p => p.status === status);
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProspects = filteredProspects.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: paginatedProspects,
      pagination: {
        page,
        per_page: limit,
        total_entries: filteredProspects.length,
        total_pages: Math.ceil(filteredProspects.length / limit),
      },
      summary: {
        total: mockProspects.length,
        new: mockProspects.filter(p => p.status === 'new').length,
        contacted: mockProspects.filter(p => p.status === 'contacted').length,
        connected: mockProspects.filter(p => p.status === 'connected').length,
        qualified: mockProspects.filter(p => p.status === 'qualified').length,
        converted: mockProspects.filter(p => p.status === 'converted').length,
      },
    });

  } catch (error) {
    console.error('LinkedIn prospects GET API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
