"use client";

import { useOnboarding } from "./onboarding-context";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export const OnboardingDebugPanel = () => {
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

  if (process.env.NODE_ENV === "production") {
    return null; // Don't show in production
  }

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-background border border-border rounded-lg shadow-lg w-80 z-50 text-xs">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Onboarding Debug</h3>
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
