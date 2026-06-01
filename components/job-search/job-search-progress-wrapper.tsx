"use client";

import { JobSearchProgress } from "./job-search-progress";
import { useRouter } from "next/navigation";

interface JobSearchProgressWrapperProps {
  jobSearchId: string;
  refreshOnComplete?: boolean;
}

export function JobSearchProgressWrapper({ 
  jobSearchId, 
  refreshOnComplete = true 
}: JobSearchProgressWrapperProps) {
  const router = useRouter();
  
  const handleComplete = (success: boolean) => {
    if (refreshOnComplete) {
      // Force refresh the page to show the latest results
      router.refresh();
    }
  };

  return (
    <JobSearchProgress
      jobSearchId={jobSearchId}
      onComplete={handleComplete}
    />
  );
}
