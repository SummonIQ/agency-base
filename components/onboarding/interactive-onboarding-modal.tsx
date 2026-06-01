"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useOnboarding } from "./onboarding-context";
import { CheckCircle, ChevronLeft, ChevronRight, Upload, Target, MapPin, DollarSign, Search, Trophy, Loader2 } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { completeOnboardingProcess } from "@/lib/onboarding/actions";
import { toast } from "@/components/ui/use-toast";

// Content for each interactive onboarding step
const stepContent = {
  welcome: {
    title: "Welcome to AgencyBase!",
    description: "Let's set up your agency management platform in just a few steps. This will take about 3 minutes.",
    icon: Trophy
  },
  goals: {
    title: "What's your agency focus?",
    description: "Help us understand your business so we can personalize your experience.",
    icon: Target
  },
  "business-details": {
    title: "Set your business details",
    description: "Tell us about your agency so we can customize the platform for you.",
    icon: MapPin
  },
  "services-setup": {
    title: "What services do you offer?",
    description: "We'll create templates and workflows based on your service offerings.",
    icon: Upload
  },
  "first-project": {
    title: "Let's create your first project!",
    description: "We'll help you set up your first client project to show you how the platform works.",
    icon: Search
  },
  "success-tips": {
    title: "You're all set!",
    description: "Here are some pro tips to maximize your success with AgencyBase.",
    icon: Trophy
  },
  complete: {
    title: "Ready to grow your agency!",
    description: "Your platform is now configured and ready. Let's start managing your agency business!",
    icon: CheckCircle
  }
};

// Goal options for the goals step
const jobSearchGoals = [
  { value: "new-job", label: "Find a new job" },
  { value: "career-change", label: "Change careers" },
  { value: "first-job", label: "Find my first job" },
  { value: "remote-work", label: "Find remote work" },
  { value: "promotion", label: "Get promoted internally" },
  { value: "consulting", label: "Start consulting/freelancing" }
];

// Experience level options
const experienceLevels = [
  { value: "entry", label: "Entry Level (0-2 years)" },
  { value: "mid", label: "Mid Level (3-5 years)" },
  { value: "senior", label: "Senior Level (6-10 years)" },
  { value: "lead", label: "Lead/Principal (10+ years)" },
  { value: "executive", label: "Executive/C-Level" }
];

// Job type options
const jobTypes = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
  { value: "freelance", label: "Freelance" }
];

// Work arrangement options
const workArrangements = [
  { value: "onsite", label: "On-site" },
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" }
];

export const InteractiveOnboardingModal = () => {
  const { 
    isOnboarding, 
    currentStep, 
    nextStep, 
    prevStep, 
    skipOnboarding, 
    pauseOnboarding,
    onboardingData,
    updateOnboardingData
  } = useOnboarding();
  
  const primaryButtonRef = useRef<HTMLButtonElement>(null);
  const [isStepValid, setIsStepValid] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Focus management
  useEffect(() => {
    if (isOnboarding) {
      const timer = setTimeout(() => {
        primaryButtonRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOnboarding, currentStep]);
  
  // Validation for each step
  useEffect(() => {
    switch (currentStep) {
      case "goals":
        setIsStepValid(!!onboardingData.goal && !!onboardingData.experienceLevel);
        break;
      case "job-preferences":
        setIsStepValid(
          !!onboardingData.jobTitle && 
          !!onboardingData.location && 
          !!onboardingData.jobType &&
          !!onboardingData.workArrangement
        );
        break;
      case "resume-upload":
        setIsStepValid(!!onboardingData.resumeFile);
        break;
      default:
        setIsStepValid(true);
    }
  }, [currentStep, onboardingData]);
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' && !isLastStep && isStepValid) {
      nextStep();
    } else if (e.key === 'ArrowLeft' && !isFirstStep) {
      prevStep();
    }
  };

  const isFirstStep = currentStep === "welcome";
  const isLastStep = currentStep === "complete";
  
  const steps = ["welcome", "goals", "job-preferences", "resume-upload", "first-search", "success-tips", "complete"];
  const currentIndex = steps.indexOf(currentStep);
  const progress = ((currentIndex + 1) / steps.length) * 100;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      updateOnboardingData("resumeFile", file);
      updateOnboardingData("resumeFileName", file.name);
    }
  };

  const handleNextStep = async () => {
    // If it's the completion step, process all the onboarding data
    if (currentStep === "success-tips") {
      setIsProcessing(true);
      try {
        await completeOnboardingProcess({
          goal: onboardingData.goal,
          experienceLevel: onboardingData.experienceLevel,
          jobTitle: onboardingData.jobTitle,
          location: onboardingData.location,
          jobType: onboardingData.jobType,
          workArrangement: onboardingData.workArrangement,
          salaryRange: onboardingData.salaryRange,
          resumeFile: onboardingData.resumeFile,
        });
        
        toast({
          title: "Welcome to GimmeJob!",
          description: "Your account has been set up and your first job search is running.",
        });
        
        nextStep(); // Go to complete step
      } catch (error) {
        console.error("Error completing onboarding:", error);
        toast({
          title: "Setup Error",
          description: "There was an issue setting up your account. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    } else {
      nextStep();
    }
  };

  const renderStepContent = () => {
    const IconComponent = stepContent[currentStep as keyof typeof stepContent]?.icon || Trophy;
    
    switch (currentStep) {
      case "welcome":
        return (
          <div className="text-center">
            <div className="mb-6 mx-auto bg-primary/10 p-8 rounded-full w-32 h-32 flex items-center justify-center">
              <IconComponent size={64} className="text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-3">{stepContent.welcome.title}</h2>
            <p className="text-muted-foreground mb-6">{stepContent.welcome.description}</p>
            <div className="bg-accent/50 p-4 rounded-lg">
              <p className="text-sm font-medium">What we'll set up:</p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                <li>• Your job search goals and preferences</li>
                <li>• Resume upload and optimization</li>
                <li>• Your first automated job search</li>
              </ul>
            </div>
          </div>
        );
        
      case "goals":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <IconComponent size={48} className="text-primary mx-auto mb-3" />
              <h2 className="text-2xl font-bold mb-2">{stepContent.goals.title}</h2>
              <p className="text-muted-foreground">{stepContent.goals.description}</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="goal">Primary Goal</Label>
                <Select onValueChange={(value) => updateOnboardingData("goal", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your main goal" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobSearchGoals.map((goal) => (
                      <SelectItem key={goal.value} value={goal.value}>
                        {goal.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="experience">Experience Level</Label>
                <Select onValueChange={(value) => updateOnboardingData("experienceLevel", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );
        
      case "job-preferences":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <IconComponent size={48} className="text-primary mx-auto mb-3" />
              <h2 className="text-2xl font-bold mb-2">{stepContent["job-preferences"].title}</h2>
              <p className="text-muted-foreground">{stepContent["job-preferences"].description}</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="jobTitle">Job Title / Keywords</Label>
                <Input
                  id="jobTitle"
                  placeholder="e.g. Software Engineer, Marketing Manager"
                  value={onboardingData.jobTitle || ""}
                  onChange={(e) => updateOnboardingData("jobTitle", e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g. San Francisco, CA or Remote"
                  value={onboardingData.location || ""}
                  onChange={(e) => updateOnboardingData("location", e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="jobType">Job Type</Label>
                  <Select onValueChange={(value) => updateOnboardingData("jobType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Job type" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="workArrangement">Work Style</Label>
                  <Select onValueChange={(value) => updateOnboardingData("workArrangement", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Work style" />
                    </SelectTrigger>
                    <SelectContent>
                      {workArrangements.map((arrangement) => (
                        <SelectItem key={arrangement.value} value={arrangement.value}>
                          {arrangement.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="salaryRange">Desired Salary Range (Optional)</Label>
                <Input
                  id="salaryRange"
                  placeholder="e.g. $80,000 - $120,000"
                  value={onboardingData.salaryRange || ""}
                  onChange={(e) => updateOnboardingData("salaryRange", e.target.value)}
                />
              </div>
            </div>
          </div>
        );
        
      case "resume-upload":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <IconComponent size={48} className="text-primary mx-auto mb-3" />
              <h2 className="text-2xl font-bold mb-2">{stepContent["resume-upload"].title}</h2>
              <p className="text-muted-foreground">{stepContent["resume-upload"].description}</p>
            </div>
            
            <div className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                {onboardingData.resumeFile ? (
                  <div className="space-y-3">
                    <CheckCircle size={48} className="text-green-500 mx-auto" />
                    <p className="font-medium">{onboardingData.resumeFileName}</p>
                    <p className="text-sm text-muted-foreground">Resume uploaded successfully!</p>
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById("resume-upload")?.click()}
                    >
                      Upload Different File
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Upload size={48} className="text-muted-foreground mx-auto" />
                    <div>
                      <p className="font-medium">Upload your resume</p>
                      <p className="text-sm text-muted-foreground">PDF, DOC, or DOCX files only</p>
                    </div>
                    <Button onClick={() => document.getElementById("resume-upload")?.click()}>
                      Choose File
                    </Button>
                  </div>
                )}
                <input
                  id="resume-upload"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
              
              {onboardingData.resumeFile && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">Next: We'll analyze your resume</p>
                  <p className="text-sm text-blue-700">Our AI will score your resume and provide optimization suggestions.</p>
                </div>
              )}
            </div>
          </div>
        );
        
      case "first-search":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <IconComponent size={48} className="text-primary mx-auto mb-3" />
              <h2 className="text-2xl font-bold mb-2">{stepContent["first-search"].title}</h2>
              <p className="text-muted-foreground">{stepContent["first-search"].description}</p>
            </div>
            
            <div className="bg-accent/50 p-6 rounded-lg space-y-4">
              <h3 className="font-semibold">Your search will include:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span><strong>Keywords:</strong> {onboardingData.jobTitle}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span><strong>Location:</strong> {onboardingData.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span><strong>Type:</strong> {jobTypes.find(t => t.value === onboardingData.jobType)?.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span><strong>Work Style:</strong> {workArrangements.find(w => w.value === onboardingData.workArrangement)?.label}</span>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                We'll search across multiple job boards and save relevant positions to your account.
              </p>
            </div>
          </div>
        );
        
      case "success-tips":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <IconComponent size={48} className="text-primary mx-auto mb-3" />
              <h2 className="text-2xl font-bold mb-2">{stepContent["success-tips"].title}</h2>
              <p className="text-muted-foreground">{stepContent["success-tips"].description}</p>
            </div>
            
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">💡 Pro Tips for Success</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Check your notifications daily for new job matches</li>
                  <li>• Optimize your resume for different job types</li>
                  <li>• Set up automation to apply to relevant jobs automatically</li>
                  <li>• Track your application responses in the analytics dashboard</li>
                </ul>
              </div>
            </div>
          </div>
        );
        
      case "complete":
        return (
          <div className="text-center space-y-6">
            <div className="mb-6 mx-auto bg-green-100 p-8 rounded-full w-32 h-32 flex items-center justify-center">
              <CheckCircle size={64} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-3">{stepContent.complete.title}</h2>
            <p className="text-muted-foreground mb-6">{stepContent.complete.description}</p>
            
            <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 p-6 rounded-lg">
              <h3 className="font-semibold mb-3">Your account is ready with:</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <span>Job preferences set</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <span>Resume uploaded</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <span>First search running</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <span>Notifications enabled</span>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOnboarding} onOpenChange={(open) => {
      if (!open) {
        pauseOnboarding();
      }
    }}>
      <DialogContent 
        className="sm:max-w-[700px] p-0 overflow-hidden max-h-[90vh] overflow-y-auto"
        onKeyDown={handleKeyDown}
        aria-describedby="onboarding-description">
        <VisuallyHidden>
          <DialogTitle>{stepContent[currentStep as keyof typeof stepContent]?.title || "Onboarding"}</DialogTitle>
        </VisuallyHidden>
        <div className="flex flex-col h-full">
          {/* Progress bar */}
          <div className="w-full bg-secondary h-2">
            <div 
              className="bg-primary h-2 transition-all duration-500" 
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="p-6">
            {renderStepContent()}
            
            {/* Navigation buttons */}
            <div className="flex justify-between items-center pt-8 mt-8 border-t">
              <div>
                {!isFirstStep && (
                  <Button 
                    variant="outline" 
                    onClick={prevStep}
                    aria-label="Go to previous step"
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" aria-hidden="true" /> Back
                  </Button>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  Step {currentIndex + 1} of {steps.length}
                </span>
              </div>
              
              <div className="flex space-x-2">
                {!isLastStep && currentStep !== "welcome" && (
                  <Button 
                    variant="ghost" 
                    onClick={skipOnboarding}
                    aria-label="Skip onboarding"
                  >
                    Skip Setup
                  </Button>
                )}
                
                <Button 
                  onClick={handleNextStep} 
                  ref={primaryButtonRef}
                  disabled={!isStepValid || isProcessing}
                  aria-label={isLastStep ? "Complete onboarding" : "Go to next step"}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      {isLastStep ? "Start Job Searching!" : currentStep === "success-tips" ? "Complete Setup" : "Continue"}
                      {!isLastStep && !isProcessing && <ChevronRight className="ml-2 h-4 w-4" aria-hidden="true" />}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};