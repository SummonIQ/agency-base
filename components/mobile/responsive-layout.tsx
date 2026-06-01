"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type BreakpointKey = "sm" | "md" | "lg" | "xl" | "2xl";
type Direction = "row" | "column";

interface BreakpointConfig {
  direction?: Direction;
  spacing?: string;
  className?: string;
}

interface ResponsiveLayoutProps {
  children: ReactNode;
  className?: string;
  defaultDirection?: Direction;
  defaultSpacing?: string;
  sm?: BreakpointConfig;
  md?: BreakpointConfig;
  lg?: BreakpointConfig;
  xl?: BreakpointConfig;
  "2xl"?: BreakpointConfig;
}

// Breakpoint widths (matching Tailwind defaults)
const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

/**
 * ResponsiveLayout component that adjusts layout based on screen size
 * This helps make the app more mobile-friendly by changing layouts responsively
 */
export function ResponsiveLayout({
  children,
  className = "",
  defaultDirection = "column",
  defaultSpacing = "space-y-4",
  ...breakpointConfigs
}: ResponsiveLayoutProps) {
  // Current active breakpoint
  const [activeBreakpoint, setActiveBreakpoint] = useState<BreakpointKey | null>(null);

  // Update active breakpoint based on window width
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      
      if (width >= breakpoints["2xl"] && breakpointConfigs["2xl"]) {
        setActiveBreakpoint("2xl");
      } else if (width >= breakpoints.xl && breakpointConfigs.xl) {
        setActiveBreakpoint("xl");
      } else if (width >= breakpoints.lg && breakpointConfigs.lg) {
        setActiveBreakpoint("lg");
      } else if (width >= breakpoints.md && breakpointConfigs.md) {
        setActiveBreakpoint("md");
      } else if (width >= breakpoints.sm && breakpointConfigs.sm) {
        setActiveBreakpoint("sm");
      } else {
        setActiveBreakpoint(null);
      }
    };

    // Set initial breakpoint
    handleResize();

    // Add event listener for window resize
    window.addEventListener("resize", handleResize);
    
    // Remove event listener on cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [breakpointConfigs]);

  // Get current config based on active breakpoint
  const currentConfig = activeBreakpoint ? breakpointConfigs[activeBreakpoint] : null;
  
  // Apply correct classes based on direction
  const direction = currentConfig?.direction || defaultDirection;
  const flexDirection = direction === "row" ? "flex-row" : "flex-col";
  
  // Apply correct spacing based on direction
  const spacing = currentConfig?.spacing || defaultSpacing;

  return (
    <div
      className={cn(
        "flex",
        flexDirection,
        spacing,
        className,
        currentConfig?.className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Example usage:
 * 
 * <ResponsiveLayout
 *   defaultDirection="column"
 *   defaultSpacing="space-y-4"
 *   md={{ direction: "row", spacing: "space-x-4" }}
 *   lg={{ direction: "row", spacing: "space-x-6" }}
 * >
 *   <Card className="flex-1">Content 1</Card>
 *   <Card className="flex-1">Content 2</Card>
 * </ResponsiveLayout>
 */
