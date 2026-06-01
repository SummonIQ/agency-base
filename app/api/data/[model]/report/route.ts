// 'use cache';

import { unauthorized } from 'next/navigation';
import { NextRequest } from 'next/server';

import { getReportData } from '@/lib/reporting/data';
import { getSessionUser } from '@/lib/user';
import { ApiQuery, Filter, Operator } from '@/types/reporting/query';

// export const experimental_ppr = true;


export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: {
      model: 'job-listings' | 'job-leads' | 'job-searches' | 'resumes';
    };
  },
) {
  // console.log('request', request);
  // 'use cache';
  const user = await getSessionUser();
  const { model } = await params;

  // cacheTag(`user:${user.id}:report:${model}`);

  const { searchParams } = new URL(request.url);

  if (!user || !user.id) {
    return unauthorized();
  }

  // Pagination: read 'start' and 'count' with defaults.
  const startStr = searchParams.get('start');
  const countStr = searchParams.get('count');
  const start = startStr ? parseInt(startStr) : 0;
  const count = countStr ? parseInt(countStr) : 10;
  const pagination = { count, start };

  // Sort: expected as "field:direction" (comma separated for multiple sorts)
  let sort;
  const sortStr = searchParams.get('sort');
  if (sortStr) {
    sort = sortStr.split(',').map(item => {
      const [field, direction] = item.split(':');
      return {
        direction: (direction || 'asc').toLowerCase() as 'asc' | 'desc',
        field,
      };
    });
  }

  // Include: expected as "field:include" (comma separated for multiple includes)
  let include;
  const includeStr = searchParams.get('include');
  if (includeStr) {
    include = includeStr.split(',').map(item => item.split(':')[1]);
  }

  // Filters: expected as "field:operator:value" (comma separated for multiple filters)
  let filters: Array<Filter<any>> = [];
  const filterStr = searchParams.get('filter');
  if (filterStr) {
    filters = filterStr
      .split(',')
      .map(item => {
        const parts = item.split(':');
        if (parts.length < 3) return null;
        const field = parts[0];
        const operator = parts[1] as Operator;
        // In case the value contains colons, join the remaining parts.
        const value = decodeURIComponent(parts.slice(2).join(':'));
        if (value === 'true') {
          return { field, operator, value: true };
        }
        if (value === 'false') {
          return { field, operator, value: false };
        }
        if (value === 'null') {
          return { field, operator, value: null };
        }

        return { field, operator, value };
      })
      .filter(f => f !== null);
  }

  const apiQuery: ApiQuery<any, any> = {
    filters,
    include,
    pagination,
    sort,
    userId: user.id,
  };

  const result = await getReportData({ apiQuery, model, userId: user.id });

  return Response.json(result);
}
