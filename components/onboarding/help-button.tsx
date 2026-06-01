"use client";

import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useOnboarding } from "./onboarding-context";
import { HelpCircle } from "lucide-react";

export const HelpButton = () => {
  const { restartOnboarding, goToStep } = useOnboarding();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label="Help and onboarding"
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={() => restartOnboarding()}>
          App Tour
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => goToStep("job-search")}>
          Job Search Tutorial
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => goToStep("resumes")}>
          Resume Management
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => goToStep("applications")}>
          Application Process
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => goToStep("analytics")}>
          Analytics Tutorial
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => goToStep("networking")}>
          Networking Guide
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => goToStep("interviews")}>
          Interview Practice
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => goToStep("skill-gap")}>
          Skill Gap Analysis
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
