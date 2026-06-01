"use client";

import { useState, useEffect, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/css";

interface FeatureTooltipProps {
  id: string;
  children: ReactNode;
  position?: "top" | "right" | "bottom" | "left";
  className?: string;
  onDismiss?: () => void;
  delay?: number;
}

export const FeatureTooltip = ({
  id,
  children,
  position = "bottom",
  className = "",
  onDismiss,
  delay = 0,
}: FeatureTooltipProps) => {
  const [show, setShow] = useState(false);
  
  useEffect(() => {
    // Check if this tooltip has been dismissed before
    const isDismissed = localStorage.getItem(`tooltip-${id}-dismissed`) === "true";
    
    if (!isDismissed) {
      // Delay showing the tooltip if specified
      const timer = setTimeout(() => {
        setShow(true);
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [id, delay]);
  
  const handleDismiss = () => {
    setShow(false);
    // Mark this tooltip as dismissed in localStorage
    localStorage.setItem(`tooltip-${id}-dismissed`, "true");
    if (onDismiss) onDismiss();
  };
  
  // Position styles
  const positionStyles = {
    top: "bottom-full mb-2",
    right: "left-full ml-2",
    bottom: "top-full mt-2",
    left: "right-full mr-2",
  };
  
  // Arrow styles
  const arrowStyles = {
    top: "bottom-[-6px] border-t-foreground border-l-transparent border-r-transparent border-b-transparent",
    right: "left-[-6px] border-r-foreground border-t-transparent border-b-transparent border-l-transparent",
    bottom: "top-[-6px] border-b-foreground border-l-transparent border-r-transparent border-t-transparent",
    left: "right-[-6px] border-l-foreground border-t-transparent border-b-transparent border-r-transparent",
  };
  
  if (!show) return null;
  
  return (
    <div className={cn(
      "absolute z-50 w-60 bg-foreground text-background p-3 rounded-md shadow-lg",
      positionStyles[position],
      className
    )}>
      {/* Arrow */}
      <div className={cn(
        "absolute w-0 h-0 border-solid border-4",
        arrowStyles[position]
      )}></div>
      
      {/* Content */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <div className="text-sm flex-1">{children}</div>
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0 text-background/80 hover:text-background hover:bg-foreground"
            onClick={handleDismiss}
          >
            <X size={12} />
          </Button>
        </div>
      </div>
    </div>
  );
};
