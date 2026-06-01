"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { LinkedinIcon, Users, ExternalLink } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

interface LinkedInNavigationProps {
  jobLeadId?: string;
  compact?: boolean;
  hasProfile?: boolean;
}

export function LinkedInNavigation({ 
  jobLeadId, 
  compact = false,
  hasProfile = false
}: LinkedInNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
  }, []);

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size={compact ? "sm" : "default"} 
          className="flex items-center gap-2"
        >
          <LinkedinIcon className="h-4 w-4 text-[#0A66C2]" />
          <span>LinkedIn</span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>LinkedIn Integration</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <Link href="/linkedin" className="flex items-center gap-2 cursor-pointer">
            <LinkedinIcon className="h-4 w-4" />
            <span>{hasProfile ? "View Profile" : "Import Profile"}</span>
          </Link>
        </DropdownMenuItem>
        
        {jobLeadId && (
          <DropdownMenuItem asChild>
            <Link 
              href={`/jobs/${jobLeadId}/connections`}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Users className="h-4 w-4" />
              <span>Connection Suggestions</span>
            </Link>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <a 
            href="https://www.linkedin.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 cursor-pointer"
          >
            <ExternalLink className="h-4 w-4" />
            <span>Open LinkedIn</span>
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
