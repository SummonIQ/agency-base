import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { apolloService } from '@/lib/leads/apollo-service';

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
      provider = 'apollo',
      filters = {},
      page = 1,
      limit = 25 
    } = body;

    if (provider === 'apollo') {
      // Transform filters to Apollo format
      const apolloFilters = {
        person_titles: filters.title_keywords ? [filters.title_keywords] : undefined,
        person_locations: filters.location ? [filters.location] : undefined,
        organization_industries: filters.industry ? [filters.industry] : undefined,
        organization_num_employees_ranges: filters.company_size ? [filters.company_size] : undefined,
        organization_annual_revenues: filters.revenue_range ? [filters.revenue_range] : undefined,
        keywords: filters.keywords,
        page,
        limit,
      };

      // Remove undefined values
      Object.keys(apolloFilters).forEach(key => {
        if (apolloFilters[key as keyof typeof apolloFilters] === undefined) {
          delete apolloFilters[key as keyof typeof apolloFilters];
        }
      });

      const result = await apolloService.searchContacts(apolloFilters);

      if (result.success) {
        return NextResponse.json({
          success: true,
          data: result.data,
          pagination: result.pagination,
          provider: 'apollo',
        });
      } else {
        return NextResponse.json({
          success: false,
          error: result.error,
          provider: 'apollo',
        }, { status: 400 });
      }
    }

    // Add ZoomInfo support later
    if (provider === 'zoominfo') {
      return NextResponse.json({
        success: false,
        error: 'ZoomInfo integration coming soon',
      }, { status: 501 });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid provider specified',
    }, { status: 400 });

  } catch (error) {
    console.error('Lead search API error:', error);
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
      providers: ['apollo', 'zoominfo'],
      filters: {
        industries: [
          'Software',
          'Technology',
          'Financial Services',
          'Healthcare',
          'Manufacturing',
          'Retail',
          'Education',
          'Real Estate',
          'Professional Services',
          'Media & Entertainment',
        ],
        company_sizes: [
          '1-10',
          '11-50',
          '51-100',
          '101-500',
          '501-1000',
          '1001-5000',
          '5000+',
        ],
        revenue_ranges: [
          '<$1M',
          '$1M-5M',
          '$5M-10M',
          '$10M-50M',
          '$50M-100M',
          '$100M-500M',
          '$500M+',
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
        ],
      },
    });

  } catch (error) {
    console.error('Lead search options API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
