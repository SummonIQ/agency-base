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
    const { 
      keywords,
      location,
      industry,
      company,
      companySize,
      seniority,
      function: jobFunction,
      page = 1,
      limit = 10 
    } = body;

    const filters = {
      keywords,
      location,
      industry,
      company,
      companySize,
      seniority,
      function: jobFunction,
      page,
      limit,
    };

    // Remove undefined values
    Object.keys(filters).forEach(key => {
      if (filters[key as keyof typeof filters] === undefined) {
        delete filters[key as keyof typeof filters];
      }
    });

    const result = await linkedInService.searchProfiles(filters);

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
      }, { status: 400 });
    }

  } catch (error) {
    console.error('LinkedIn search API error:', error);
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

    // Return available search options
    return NextResponse.json({
      success: true,
      filters: {
        industries: [
          'Technology',
          'Software',
          'Financial Services',
          'Healthcare',
          'Manufacturing',
          'Retail',
          'Education',
          'Real Estate',
          'Professional Services',
          'Media & Entertainment',
          'Consulting',
          'Marketing & Advertising',
          'Non-profit',
          'Government',
        ],
        locations: [
          'San Francisco, CA',
          'New York, NY',
          'Los Angeles, CA',
          'Chicago, IL',
          'Austin, TX',
          'Seattle, WA',
          'Boston, MA',
          'Denver, CO',
          'Atlanta, GA',
          'Miami, FL',
          'Dallas, TX',
          'Portland, OR',
        ],
        companySizes: [
          '1-10',
          '11-50',
          '51-200',
          '201-500',
          '501-1000',
          '1001-5000',
          '5001-10000',
          '10000+',
        ],
        seniorities: [
          'Unpaid',
          'Training',
          'Entry level',
          'Associate',
          'Mid-Senior level',
          'Director',
          'Executive',
        ],
        functions: [
          'Engineering',
          'Information Technology',
          'Product Management',
          'Marketing',
          'Sales',
          'Business Development',
          'Operations',
          'Human Resources',
          'Finance',
          'Consulting',
          'Education',
          'Entrepreneurship',
        ],
      },
    });

  } catch (error) {
    console.error('LinkedIn search options API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
