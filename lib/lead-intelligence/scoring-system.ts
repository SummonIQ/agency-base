"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/user/query";
import { LeadIntelligenceStatus, DataQualityScore, IntentDataSignal, LeadIntelligenceCompanySize } from "@prisma/client";

/**
 * Lead Scoring and Qualification System
 * Implements intelligent lead scoring based on multiple factors
 * Provides qualification criteria and automatic lead prioritization
 */

export interface ScoringCriteria {
  // Company factors (0-40 points)
  companySizeWeight?: number;
  industryMatchWeight?: number;
  fundingStageWeight?: number;
  technologyMatchWeight?: number;

  // Role factors (0-30 points)
  seniorityWeight?: number;
  departmentMatchWeight?: number;
  decisionMakerWeight?: number;

  // Intent factors (0-20 points)
  intentSignalsWeight?: number;
  recentActivityWeight?: number;

  // Data quality factors (0-10 points)
  dataQualityWeight?: number;
  contactInfoWeight?: number;
}

export interface ScoringResult {
  leadId: string;
  totalScore: number;
  maxScore: number;
  scorePercentage: number;
  breakdown: {
    companyScore: number;
    roleScore: number;
    intentScore: number;
    dataQualityScore: number;
  };
  qualification: "HOT" | "WARM" | "COLD" | "UNQUALIFIED";
  reasoning: string[];
  actionPriority: "HIGH" | "MEDIUM" | "LOW";
}

export interface QualificationRule {
  name: string;
  description: string;
  condition: (lead: any, company: any) => boolean;
  points: number;
  reasoning: string;
}

// Default scoring weights
const DEFAULT_SCORING_CRITERIA: Required<ScoringCriteria> = {
  companySizeWeight: 15,
  industryMatchWeight: 10,
  fundingStageWeight: 8,
  technologyMatchWeight: 7,
  seniorityWeight: 12,
  departmentMatchWeight: 10,
  decisionMakerWeight: 8,
  intentSignalsWeight: 12,
  recentActivityWeight: 8,
  dataQualityWeight: 6,
  contactInfoWeight: 4,
};

// Qualification thresholds
const QUALIFICATION_THRESHOLDS = {
  HOT: 70,      // 70%+ score
  WARM: 50,     // 50-69% score
  COLD: 30,     // 30-49% score
  UNQUALIFIED: 0  // <30% score
};

/**
 * Calculate lead score based on comprehensive criteria
 */
export async function calculateLeadScore(
  leadId: string,
  customCriteria?: Partial<ScoringCriteria>
): Promise<ScoringResult> {
  const criteria = { ...DEFAULT_SCORING_CRITERIA, ...customCriteria };

  // Get lead with company data
  const lead = await db.enrichedLead.findUnique({
    where: { id: leadId },
    include: {
      company: true,
    },
  });

  if (!lead || !lead.company) {
    throw new Error("Lead or company data not found");
  }

  const scoring = {
    companyScore: 0,
    roleScore: 0,
    intentScore: 0,
    dataQualityScore: 0,
  };

  const reasoning: string[] = [];

  // Company scoring (40 points max)
  const companyRules: QualificationRule[] = [
    {
      name: "company_size",
      description: "Company size indicates potential budget and need",
      condition: (lead, company) => company.companySize === LeadIntelligenceCompanySize.ENTERPRISE || company.companySize === LeadIntelligenceCompanySize.LARGE_ENTERPRISE,
      points: criteria.companySizeWeight,
      reasoning: "Large enterprise with substantial resources",
    },
    {
      name: "company_size_medium",
      description: "Mid-market companies are often good prospects",
      condition: (lead, company) => company.companySize === LeadIntelligenceCompanySize.MID_MARKET,
      points: criteria.companySizeWeight * 0.7,
      reasoning: "Mid-market company with growth potential",
    },
    {
      name: "funding_stage",
      description: "Recently funded companies have budget for new solutions",
      condition: (lead, company) => company.fundingStage && ["Series A", "Series B", "Series C", "Series D+"].includes(company.fundingStage),
      points: criteria.fundingStageWeight,
      reasoning: "Recently funded with available budget",
    },
    {
      name: "technology_match",
      description: "Companies using relevant technologies are more likely to need related solutions",
      condition: (lead, company) => {
        const relevantTech = ["JavaScript", "React", "Node.js", "Python", "AWS", "Docker", "Kubernetes"];
        return company.technologies?.some((tech: string) =>
          relevantTech.some(relevant => tech.toLowerCase().includes(relevant.toLowerCase()))
        ) || false;
      },
      points: criteria.technologyMatchWeight,
      reasoning: "Uses relevant technology stack",
    },
  ];

  companyRules.forEach(rule => {
    if (rule.condition(lead, lead.company)) {
      scoring.companyScore += rule.points;
      reasoning.push(rule.reasoning);
    }
  });

  // Role scoring (30 points max)
  const roleRules: QualificationRule[] = [
    {
      name: "senior_role",
      description: "Senior roles have decision-making authority",
      condition: (lead) => {
        const seniorTitles = ["director", "vp", "vice president", "head of", "chief", "cto", "ceo", "founder"];
        return seniorTitles.some(title =>
          (lead.jobTitle?.toLowerCase() || "").includes(title) ||
          (lead.seniority?.toLowerCase() || "").includes("senior")
        );
      },
      points: criteria.seniorityWeight,
      reasoning: "Senior role with decision-making authority",
    },
    {
      name: "tech_department",
      description: "Technology department roles are more likely to need dev tools",
      condition: (lead) => {
        const techDepartments = ["engineering", "technology", "development", "it", "tech", "software"];
        return techDepartments.some(dept =>
          (lead.department?.toLowerCase() || "").includes(dept)
        );
      },
      points: criteria.departmentMatchWeight,
      reasoning: "Works in technology department",
    },
    {
      name: "decision_maker",
      description: "Identified as decision maker",
      condition: (lead) => lead.isDecisionMaker,
      points: criteria.decisionMakerWeight,
      reasoning: "Identified as key decision maker",
    },
  ];

  roleRules.forEach(rule => {
    if (rule.condition(lead, lead.company)) {
      scoring.roleScore += rule.points;
      reasoning.push(rule.reasoning);
    }
  });

  // Intent scoring (20 points max)
  const intentRules: QualificationRule[] = [
    {
      name: "high_intent_signals",
      description: "Strong intent signals indicate active evaluation",
      condition: (lead, company) => {
        const highIntentSignals = [
          IntentDataSignal.TECHNOLOGY_RESEARCH,
          IntentDataSignal.COMPETITOR_RESEARCH,
          IntentDataSignal.HIRING_ACTIVITY,
        ];
        return company.intentSignals?.some((signal: IntentDataSignal) =>
          highIntentSignals.includes(signal)
        ) || false;
      },
      points: criteria.intentSignalsWeight,
      reasoning: "Shows high-intent research activity",
    },
    {
      name: "recent_activity",
      description: "Recent enrichment indicates active prospects",
      condition: (lead, company) => {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return company.lastEnrichedAt > oneWeekAgo;
      },
      points: criteria.recentActivityWeight,
      reasoning: "Recent activity and engagement",
    },
  ];

  intentRules.forEach(rule => {
    if (rule.condition(lead, lead.company)) {
      scoring.intentScore += rule.points;
      reasoning.push(rule.reasoning);
    }
  });

  // Data quality scoring (10 points max)
  const dataQualityRules: QualificationRule[] = [
    {
      name: "high_quality_data",
      description: "High-quality data enables better outreach",
      condition: (lead) => lead.dataQuality === DataQualityScore.EXCELLENT || lead.dataQuality === DataQualityScore.GOOD,
      points: criteria.dataQualityWeight,
      reasoning: "High-quality data available",
    },
    {
      name: "complete_contact_info",
      description: "Complete contact information enables multi-channel outreach",
      condition: (lead) => lead.email && (lead.phone || lead.linkedinUrl),
      points: criteria.contactInfoWeight,
      reasoning: "Complete contact information available",
    },
  ];

  dataQualityRules.forEach(rule => {
    if (rule.condition(lead, lead.company)) {
      scoring.dataQualityScore += rule.points;
      reasoning.push(rule.reasoning);
    }
  });

  // Calculate totals
  const totalScore = scoring.companyScore + scoring.roleScore + scoring.intentScore + scoring.dataQualityScore;
  const maxScore = Object.values(criteria).reduce((sum, weight) => sum + weight, 0);
  const scorePercentage = Math.round((totalScore / maxScore) * 100);

  // Determine qualification
  let qualification: "HOT" | "WARM" | "COLD" | "UNQUALIFIED";
  if (scorePercentage >= QUALIFICATION_THRESHOLDS.HOT) {
    qualification = "HOT";
  } else if (scorePercentage >= QUALIFICATION_THRESHOLDS.WARM) {
    qualification = "WARM";
  } else if (scorePercentage >= QUALIFICATION_THRESHOLDS.COLD) {
    qualification = "COLD";
  } else {
    qualification = "UNQUALIFIED";
  }

  // Determine action priority
  let actionPriority: "HIGH" | "MEDIUM" | "LOW";
  if (qualification === "HOT") {
    actionPriority = "HIGH";
  } else if (qualification === "WARM") {
    actionPriority = "MEDIUM";
  } else {
    actionPriority = "LOW";
  }

  return {
    leadId,
    totalScore,
    maxScore,
    scorePercentage,
    breakdown: scoring,
    qualification,
    reasoning,
    actionPriority,
  };
}

/**
 * Batch score multiple leads
 */
export async function batchScoreLeads(
  leadIds: string[],
  customCriteria?: Partial<ScoringCriteria>
): Promise<ScoringResult[]> {
  const results: ScoringResult[] = [];

  for (const leadId of leadIds) {
    try {
      const score = await calculateLeadScore(leadId, customCriteria);
      results.push(score);
    } catch (error) {
      console.error(`Failed to score lead ${leadId}:`, error);
    }
  }

  return results.sort((a, b) => b.totalScore - a.totalScore); // Sort by score descending
}

/**
 * Update lead status and score in database
 */
export async function updateLeadScoring(scoringResult: ScoringResult): Promise<void> {
  const { leadId, totalScore, qualification, actionPriority } = scoringResult;

  await db.enrichedLead.update({
    where: { id: leadId },
    data: {
      leadScore: totalScore,
      // Map qualification to LeadIntelligenceStatus
      status: qualification === "UNQUALIFIED" ? LeadIntelligenceStatus.DISQUALIFIED :
              qualification === "HOT" ? LeadIntelligenceStatus.QUALIFIED :
              qualification === "WARM" ? LeadIntelligenceStatus.CONTACTED :
              LeadIntelligenceStatus.NEW,
      qualificationNotes: scoringResult.reasoning.join("; "),
    },
  });

  // Log the scoring activity
  await db.leadIntelligenceActivity.create({
    data: {
      leadId,
      type: "SCORING",
      description: `Lead scored ${totalScore} points (${scoringResult.scorePercentage}%) - ${qualification}`,
      metadata: {
        scoreBreakdown: scoringResult.breakdown,
        reasoning: scoringResult.reasoning,
        qualification,
        actionPriority,
      },
      userId: (await getCurrentUser())?.id || null,
    },
  });
}

/**
 * Get scoring recommendations for a user's leads
 */
export async function getLeadScoringRecommendations(userId?: string): Promise<{
  hotLeads: Array<{ leadId: string; score: number; companyName: string; contactName: string }>;
  warmLeads: Array<{ leadId: string; score: number; companyName: string; contactName: string }>;
  needsAttention: Array<{ leadId: string; reason: string; companyName: string; contactName: string }>;
}> {
  const user = userId ? { id: userId } : await getCurrentUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  // Get leads that need scoring or re-scoring
  const leads = await db.enrichedLead.findMany({
    where: {
      assignedToUserId: user.id,
      OR: [
        { leadScore: null }, // Never scored
        {
          AND: [
            { lastEnrichedAt: { gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }, // Enriched in last 7 days
            { updatedAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } } // But scoring is older than 1 day
          ]
        }
      ]
    },
    include: {
      company: true,
    },
    orderBy: { lastEnrichedAt: "desc" },
    take: 100, // Limit for performance
  });

  const hotLeads: Array<{ leadId: string; score: number; companyName: string; contactName: string }> = [];
  const warmLeads: Array<{ leadId: string; score: number; companyName: string; contactName: string }> = [];
  const needsAttention: Array<{ leadId: string; reason: string; companyName: string; contactName: string }> = [];

  // Score each lead
  for (const lead of leads) {
    try {
      const scoringResult = await calculateLeadScore(lead.id);

      // Update the score in database
      await updateLeadScoring(scoringResult);

      const leadInfo = {
        leadId: lead.id,
        companyName: lead.company?.name || "Unknown Company",
        contactName: `${lead.firstName} ${lead.lastName}`,
      };

      if (scoringResult.qualification === "HOT") {
        hotLeads.push({ ...leadInfo, score: scoringResult.totalScore });
      } else if (scoringResult.qualification === "WARM") {
        warmLeads.push({ ...leadInfo, score: scoringResult.totalScore });
      }

      // Check for leads that need attention
      if (scoringResult.qualification === "HOT" && lead.status === LeadIntelligenceStatus.NEW) {
        needsAttention.push({
          ...leadInfo,
          reason: "Hot lead not yet contacted",
        });
      } else if (lead.dataQuality === DataQualityScore.POOR) {
        needsAttention.push({
          ...leadInfo,
          reason: "Poor data quality - needs enrichment",
        });
      }
    } catch (error) {
      console.error(`Failed to process lead ${lead.id}:`, error);
      needsAttention.push({
        leadId: lead.id,
        companyName: lead.company?.name || "Unknown Company",
        contactName: `${lead.firstName} ${lead.lastName}`,
        reason: "Scoring failed - needs manual review",
      });
    }
  }

  return {
    hotLeads: hotLeads.sort((a, b) => b.score - a.score),
    warmLeads: warmLeads.sort((a, b) => b.score - a.score),
    needsAttention,
  };
}