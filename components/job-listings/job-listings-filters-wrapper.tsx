'use client';

import { useState } from 'react';
import { JobListingsFilters, JobListingsFilters as FiltersType } from './job-listings-filters';

export function JobListingsFiltersWrapper() {
  const [filters, setFilters] = useState<FiltersType>({});

  return (
    <JobListingsFilters
      filters={filters}
      onFiltersChange={(newFilters) => {
        setFilters(newFilters);
        // You might want to add a callback to parent or context here
        console.log('Filters changed:', newFilters);
      }}
      onReset={() => {
        setFilters({});
        console.log('Filters reset');
      }}
    />
  );
}
