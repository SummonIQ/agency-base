"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { JobBoard } from "@prisma/client";
import { Send, ChevronDown } from "lucide-react";
import Link from "next/link";

interface ApplyButtonProps {
  jobId: string;
  jobBoard?: string;
  applyUrl?: string;
  size?: "default" | "sm" | "lg";
  variant?: "default" | "outline" | "secondary";
}

export function ApplyButton({
  jobId,
  jobBoard,
  applyUrl,
  size = "default",
  variant = "default",
}: ApplyButtonProps) {
  // If there's no job board or apply URL, just show a disabled button
  if (!jobBoard && !applyUrl) {
    return (
      <Button size={size} variant={variant} disabled>
        <Send className="h-4 w-4 mr-2" />
        Apply
      </Button>
    );
  }

  // If there's only a direct apply URL and no integrated application system,
  // just link directly to that URL
  if (!jobBoard && applyUrl) {
    return (
      <Button size={size} variant={variant} asChild>
        <a 
          href={applyUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center"
        >
          <Send className="h-4 w-4 mr-2" />
          Apply
        </a>
      </Button>
    );
  }

  // If we have an integrated application system, show dropdown with options
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size={size} variant={variant} className="inline-flex items-center">
          <Send className="h-4 w-4 mr-2" />
          Apply
          <ChevronDown className="h-4 w-4 ml-1.5 -mr-1" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-40">
        {jobBoard === "INDEED" && (
          <DropdownMenuItem asChild>
            <Link href={`/jobs/${jobId}/apply/indeed`}>
              Apply with Gimme Job
            </Link>
          </DropdownMenuItem>
        )}
        
        {jobBoard === "LINKEDIN" && (
          <DropdownMenuItem asChild>
            <Link href={`/jobs/${jobId}/apply/linkedin`}>
              Apply with Gimme Job
            </Link>
          </DropdownMenuItem>
        )}
        
        {applyUrl && (
          <DropdownMenuItem asChild>
            <a 
              href={applyUrl} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Apply on Website
            </a>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
