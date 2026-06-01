"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { LinkedinIcon, Users, ExternalLink, Share2, FileText } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";

interface LinkedInToolsProps {
  jobLeadId?: string;
  compact?: boolean;
  variant?: "default" | "outline" | "secondary";
}

export function LinkedInTools({
  jobLeadId,
  compact = false,
  variant = "outline",
}: LinkedInToolsProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
  }, []);

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={compact ? "sm" : "default"}
          className="flex items-center gap-2"
        >
          <LinkedinIcon className="h-4 w-4 text-[#0A66C2]" />
          <span>LinkedIn Tools</span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>LinkedIn Integration</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/linkedin" className="flex items-center gap-2 cursor-pointer">
              <LinkedinIcon className="h-4 w-4" />
              <span>Manage LinkedIn Profile</span>
            </Link>
          </DropdownMenuItem>
          
          {jobLeadId && (
            <>
              <DropdownMenuItem asChild>
                <Link
                  href={`/jobs/${jobLeadId}/connections`}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Users className="h-4 w-4" />
                  <span>Find Connections for This Job</span>
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link
                  href={`/jobs/${jobLeadId}/skills`}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="h-4 w-4" />
                  <span>Compare Skills with Profile</span>
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => {}} className="flex items-center gap-2 cursor-pointer">
                <Share2 className="h-4 w-4" />
                <span>Share on LinkedIn</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <a
              href="https://www.linkedin.com/jobs/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 cursor-pointer"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Open LinkedIn Jobs</span>
            </a>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <a
              href="https://www.linkedin.com/mynetwork/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 cursor-pointer"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Open LinkedIn Network</span>
            </a>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
