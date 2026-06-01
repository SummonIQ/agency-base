// hooks/useReportData.ts
'use client';

// lodash removed - not currently used
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, useTransition } from 'react';

import { useSession } from '@/lib/auth/client';
import type { ApiQuery } from '@/types/reporting/query';

interface UseReportDataOptions<T, I> {
  cacheKey?: string;
  initialData?: T[];
  initialTotalCount?: number;
  initialQuery?: ApiQuery<T, I>;
  model: string;
}

export function useReportData<T, I>({
  cacheKey,
  model,
  initialQuery,
  initialData,
  initialTotalCount,
}: UseReportDataOptions<T, I>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selfUpdating = useRef(false);
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState<T[] | null>(initialData ?? null);
  const [totalCount, setTotalCount] = useState<number>(initialTotalCount ?? 0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const session = useSession();

  // Parse the URL using our simplified parser.
  const parseApiQueryFromSearchParams = useCallback(
    (params: URLSearchParams, initial?: ApiQuery<T, I>): ApiQuery<T, I> => {
      // Start with the initial query if provided
      const baseQuery = initial || {};

      // Pagination: read "start" and "count", fallback to initial values or defaults
      const startStr = params.get('start');
      const countStr = params.get('count');
      const pagination = {
        count: countStr
          ? parseInt(countStr)
          : (baseQuery.pagination?.count ?? 10),
        start: startStr
          ? parseInt(startStr)
          : (baseQuery.pagination?.start ?? 0),
      };

      // Sort: parse "sort" parameter (e.g. "createdAt:desc,field2:asc")
      let sort;
      const sortStr = params.get('sort');
      if (sortStr) {
        sort = sortStr.split(',').map(item => {
          const [field, direction] = item.split(':');
          return { direction, field } as any;
        });
      }

      // Filters: parse "filter" parameter (e.g. "status:in:ACTIVE,title:contains:foo")
      let filters;
      const filterStr = params.get('filter');
      if (filterStr) {
        filters = filterStr
          .split(',')
          .map(item => {
            const parts = item.split(':');
            if (parts.length < 3) return null;
            const field = parts[0];
            const operator = parts[1];
            const value = decodeURIComponent(parts.slice(2).join(':'));
            if (value === 'true') {
              return { field, operator, value: true };
            }
            if (value === 'false') {
              return { field, operator, value: false };
            }

            return { field, operator, value } as any;
          })
          .filter(f => f !== null);
      }

      // Include: parse "include" parameter (e.g. "jobListing")
      let include;
      const includeStr = params.get('include');
      if (includeStr) {
        include = includeStr.split(',').map(item => item.split(':')[1]);
      }

      // Merge with initialQuery (URL params take precedence)
      return {
        ...baseQuery,
        filters: filters || baseQuery.filters,
        include,
        pagination,
        sort: sort || baseQuery.sort,
      } as ApiQuery<T, I>;
    },
    [],
  );

  // Build a simplified query string from an ApiQuery object.
  const buildApiQueryStringSimple = useCallback(
    (query: ApiQuery<T, I>): string => {
      const params = new URLSearchParams();
      // Pagination
      if (query.pagination?.start && query.pagination.start !== 0) {
        params.set('start', String(query.pagination.start ?? 0));
      }
      if (query.pagination?.count && query.pagination.count !== 10) {
        params.set('count', String(query.pagination.count ?? 10));
      }

      // Sort: "field:direction" (comma separated)
      if (query.sort && query.sort.length > 0) {
        const sortParam = query.sort
          .map(s => `${String(s.field)}:${s.direction}`)
          .join(',');
        params.set('sort', sortParam);
      } else {
        params.set('sort', 'createdAt:desc');
      }
      // Filters: "field:operator:value" (comma separated)
      if (query.filters && query.filters.length > 0) {
        const filterParam = query.filters
          .map(
            f =>
              `${String(f.field)}:${f.operator}:${encodeURIComponent(f.value.toString())}`,
          )
          .join(',');
        params.set('filter', filterParam);
      }
      if (query.include) {
        const includeParam = Object.keys(query.include).join(',');
        params.set('include', includeParam);
      }
      return params.toString();
    },
    [],
  );

  // Parse initial URL state.
  const parseSearchParams = useCallback(
    (): ApiQuery<T, I> =>
      parseApiQueryFromSearchParams(
        new URLSearchParams(searchParams.toString()),
        initialQuery,
      ),
    [searchParams],
  );

  // Use the initialData (if provided) for the data state.
  const [query, setQuery] = useState<ApiQuery<T, I>>(parseSearchParams());

  // Sync query state if URL search params change externally.
  useEffect(() => {
    if (selfUpdating.current) {
      selfUpdating.current = false;
      return;
    }
    const newQuery = parseSearchParams();
    if (JSON.stringify(newQuery) !== JSON.stringify(query)) {
      setQuery(newQuery);
      fetchData();
    }
  }, [parseSearchParams, query]);

  // When query state changes, update the URL.
  useEffect(() => {
    const qs = buildApiQueryStringSimple(query);
    if (window.location.search !== `?${qs}`) {
      selfUpdating.current = true;
      router.replace(`${window.location.pathname}?${qs}`);
    }
  }, [query]);

  // Expose a function to update query state wrapped in a transition.
  const updateQuery = useCallback((newQuery: Partial<ApiQuery<T, I>>) => {
    startTransition(() => {
      setQuery(prev => ({ ...prev, ...newQuery }));
    });
  }, []);

  // Pagination helpers.
  const nextPage = useCallback(() => {
    startTransition(() => {
      setQuery(prev => {
        const current = prev.pagination || { count: 10, start: 0 };
        const newStart = (current.start ?? 0) + (current.count ?? 10);
        return { ...prev, pagination: { ...current, start: newStart } };
      });
    });
  }, []);

  const previousPage = useCallback(() => {
    startTransition(() => {
      setQuery(prev => {
        const current = prev.pagination || { count: 10, start: 0 };
        const newStart = Math.max(
          0,
          (current.start ?? 0) - (current.count ?? 10),
        );
        return { ...prev, pagination: { ...current, start: newStart } };
      });
    });
  }, []);

  const fetchData = useCallback(async () => {
    // startTransition(() => {
    setLoading(true);
    try {
      const qs = buildApiQueryStringSimple(query);
      const res = await fetch(`/api/data/${model}/report?${qs}`, {
        cache: 'no-store',
        next: {
          revalidate: 0,
          tags: [
            `user:${session.data?.user?.id}:report:${model}`,
            `user:${session.data?.user?.id}:report:${model}:${cacheKey}`,
          ],
        },
      });

      if (!res.ok) {
        throw new Error('Error fetching report data');
      }

      const json = await res.json();
      // if (!isEqual(json.data, data)) {
      setData(json.data);
      setTotalCount(json.pagination.total);
      setError(null);
      // }

      setLoading(false);
    } catch (err) {
      setError(err as Error);
      setData(null);
      setLoading(false);
    }
  }, [
    query,
    session.data?.user?.id,
    cacheKey,
    data,
    setData,
    setTotalCount,
    buildApiQueryStringSimple,
    model,
  ]);
  const canPreviousPage = (query.pagination?.start ?? 0) > 0;
  const canNextPage =
    (query.pagination?.start ?? 0) + (query.pagination?.count ?? 10) <
    totalCount;

  useEffect(() => {
    fetchData();

    setLoading(false);
  }, [initialData]);

  useEffect(() => {
    if (initialTotalCount) {
      setTotalCount(initialTotalCount);
    }
  }, []);

  return {
    canNextPage,
    canPreviousPage,
    data,
    error,
    isPending,
    loading,
    nextPage,
    previousPage,
    query,
    totalCount,
    updateQuery,
  };
}
