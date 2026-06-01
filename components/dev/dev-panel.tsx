"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useOnboarding } from "@/components/onboarding/onboarding-context";
import { cn } from "@/lib/css";

// Tab type definition
type DebugTab = {
  id: string;
  label: string;
  subtabs?: {
    id: string;
    label: string;
    content: React.ReactNode;
  }[];
};

export const DevPanel = () => {
  const [activeTab, setActiveTab] = useState<string>("debug");
  const [activeSubTab, setActiveSubTab] = useState<string>("onboarding");
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Only show in development environment
  if (process.env.NODE_ENV === "production") {
    return null;
  }
  
  // Define tab structure
  const tabs: DebugTab[] = [
    {
      id: "debug",
      label: "Debug",
      subtabs: [
        {
          id: "onboarding",
          label: "Onboarding",
          content: <OnboardingDebugContent />
        }
        // Add more debug subtabs here as needed
      ]
    },
    {
      id: "dev",
      label: "Dev",
      subtabs: []  // Will be populated with dev-specific tools
    }
  ];
  
  const activeTabData = tabs.find(tab => tab.id === activeTab);
  const activeSubTabData = activeTabData?.subtabs?.find(subtab => subtab.id === activeSubTab);

  return (
    <div className={cn(
      "fixed bottom-4 right-4 bg-background border border-border rounded-lg shadow-lg z-50 transition-all",
      isExpanded ? "w-96 p-4" : "w-auto p-2"
    )}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-sm">
          {isExpanded ? "DevPanel" : "DP"}
        </h3>
        <Button 
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "×" : "+"}
        </Button>
      </div>
      
      {isExpanded && (
        <div className="space-y-4">
          {/* Main tabs */}
          <Tabs
            defaultValue="debug"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList>
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          
          {/* Subtabs layout */}
          <div className="flex gap-4">
            {/* Vertical subtab navigation */}
            <div className="w-1/4 flex flex-col space-y-1 border-r pr-2">
              {activeTabData?.subtabs?.map((subtab) => (
                <Button
                  key={subtab.id}
                  variant={activeSubTab === subtab.id ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "justify-start text-xs h-8",
                    activeSubTab === subtab.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                  onClick={() => setActiveSubTab(subtab.id)}
                >
                  {subtab.label}
                </Button>
              ))}
            </div>
            
            {/* Content area */}
            <div className="w-3/4 overflow-auto max-h-[400px]">
              {activeSubTabData?.content}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Onboarding Debug Content Component
const OnboardingDebugContent = () => {
  const { 
    isOnboarding, 
    currentStep, 
    hasCompletedOnboarding,
    startOnboarding,
    completeOnboarding,
    skipOnboarding,
    restartOnboarding,
    nextStep,
    prevStep
  } = useOnboarding();

  const [localStorageState, setLocalStorageState] = useState<{
    isNewUser: string | null;
    hasCompletedOnboarding: string | null;
  }>({
    isNewUser: null,
    hasCompletedOnboarding: null
  });

  // Check localStorage values on mount and when they might change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLocalStorageState({
        isNewUser: localStorage.getItem("isNewUser"),
        hasCompletedOnboarding: localStorage.getItem("hasCompletedOnboarding")
      });
    }
  }, [isOnboarding, hasCompletedOnboarding]);

  const resetStorage = () => {
    localStorage.removeItem("hasCompletedOnboarding");
    localStorage.setItem("isNewUser", "true");
    setLocalStorageState({
      isNewUser: "true",
      hasCompletedOnboarding: null
    });
  };

  return (
    <div className="space-y-3 text-xs">
      <div className="flex justify-between items-center">
        <h4 className="font-medium">Onboarding State</h4>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-6 text-xs"
          onClick={() => resetStorage()}
        >
          Reset State
        </Button>
      </div>
      
      <div className="space-y-1">
        <div>
          <span className="text-muted-foreground">isOnboarding:</span>{" "}
          <span className={isOnboarding ? "text-green-500" : "text-red-500"}>
            {isOnboarding ? "true" : "false"}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground">currentStep:</span>{" "}
          <span className="font-mono">{currentStep}</span>
        </div>
        <div>
          <span className="text-muted-foreground">hasCompletedOnboarding:</span>{" "}
          <span className={hasCompletedOnboarding ? "text-green-500" : "text-red-500"}>
            {hasCompletedOnboarding ? "true" : "false"}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground">localStorage.isNewUser:</span>{" "}
          <span>{localStorageState.isNewUser || "null"}</span>
        </div>
        <div>
          <span className="text-muted-foreground">localStorage.hasCompletedOnboarding:</span>{" "}
          <span>{localStorageState.hasCompletedOnboarding || "null"}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1 mt-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="h-6 text-xs"
          onClick={() => startOnboarding()}
        >
          Start
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-6 text-xs"
          onClick={() => restartOnboarding()}
        >
          Restart
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-6 text-xs"
          onClick={() => completeOnboarding()}
        >
          Complete
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-6 text-xs"
          onClick={() => nextStep()}
        >
          Next
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-6 text-xs"
          onClick={() => prevStep()}
        >
          Prev
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-6 text-xs"
          onClick={() => skipOnboarding()}
        >
          Skip
        </Button>
      </div>
    </div>
  );
};
