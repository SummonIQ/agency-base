"use client";

import React from "react";
import { ContextualTip } from "./contextual-tip";

/**
 * Job Search Tips
 */
export const JobSearchTip = ({ children }: { children: React.ReactNode }) => (
  <ContextualTip
    id="job-search-tip"
    side="bottom"
    content={
      <div>
        <h4 className="font-medium mb-1">Job Search Tips</h4>
        <p>Use specific keywords from job descriptions to improve your search results. 
           Try searching for both general job titles and specific skills to find more opportunities.</p>
      </div>
    }
  >
    {children}
  </ContextualTip>
);

/**
 * Resume Tips
 */
export const ResumeTip = ({ children }: { children: React.ReactNode }) => (
  <ContextualTip
    id="resume-tip"
    side="right"
    content={
      <div>
        <h4 className="font-medium mb-1">Resume Best Practices</h4>
        <p>Tailor your resume for each job by matching keywords from the job description.
           Use action verbs and quantify your achievements whenever possible.</p>
      </div>
    }
  >
    {children}
  </ContextualTip>
);

/**
 * Application Tracking Tips
 */
export const ApplicationTip = ({ children }: { children: React.ReactNode }) => (
  <ContextualTip
    id="application-tip"
    side="left"
    content={
      <div>
        <h4 className="font-medium mb-1">Application Tracking</h4>
        <p>Keep track of your application status and follow up after 1-2 weeks if you haven't heard back.
           Use the notes feature to record key details about each application.</p>
      </div>
    }
  >
    {children}
  </ContextualTip>
);

/**
 * Analytics Tips
 */
export const AnalyticsTip = ({ children }: { children: React.ReactNode }) => (
  <ContextualTip
    id="analytics-tip"
    side="bottom"
    content={
      <div>
        <h4 className="font-medium mb-1">Using Analytics</h4>
        <p>Review your application success rates by job board and resume to identify what's working best.
           Focus your efforts on the strategies that show the highest interview rates.</p>
      </div>
    }
  >
    {children}
  </ContextualTip>
);

/**
 * Networking Tips
 */
export const NetworkingTip = ({ children }: { children: React.ReactNode }) => (
  <ContextualTip
    id="networking-tip"
    side="right"
    content={
      <div>
        <h4 className="font-medium mb-1">Effective Networking</h4>
        <p>Set specific goals for each networking interaction. Always follow up within 48 hours after 
           connecting with someone new, and schedule regular check-ins with your key contacts.</p>
      </div>
    }
  >
    {children}
  </ContextualTip>
);

/**
 * Interview Tips
 */
export const InterviewTip = ({ children }: { children: React.ReactNode }) => (
  <ContextualTip
    id="interview-tip"
    showInitially={true}
    side="top"
    content={
      <div>
        <h4 className="font-medium mb-1">Interview Preparation</h4>
        <p>Practice using the STAR method (Situation, Task, Action, Result) for behavioral questions.
           Research the company thoroughly before your interview and prepare thoughtful questions.</p>
      </div>
    }
  >
    {children}
  </ContextualTip>
);

/**
 * Skill Gap Tips
 */
export const SkillGapTip = ({ children }: { children: React.ReactNode }) => (
  <ContextualTip
    id="skill-gap-tip"
    side="left"
    content={
      <div>
        <h4 className="font-medium mb-1">Closing Skill Gaps</h4>
        <p>Focus on acquiring the most frequently requested skills in your target job descriptions.
           Create small projects to demonstrate your new skills in a practical context.</p>
      </div>
    }
  >
    {children}
  </ContextualTip>
);

/**
 * Welcome Dashboard Tip
 */
export const DashboardTip = ({ children }: { children: React.ReactNode }) => (
  <ContextualTip
    id="dashboard-tip"
    side="bottom"
    showInitially={true}
    persistent={true}
    content={
      <div>
        <h4 className="font-medium mb-1">Welcome to Your Dashboard</h4>
        <p>Here you'll see an overview of your job search progress. Use the help button in the navigation
           bar anytime to access tutorials for each feature. Good luck with your job search!</p>
      </div>
    }
  >
    {children}
  </ContextualTip>
);
