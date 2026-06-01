/**
 * Candidate Scoring and Matching Service
 * Intelligent algorithms to score and rank technical candidates
 */

export interface JobRequirement {
  id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  experienceLevel: 'Entry' | 'Mid' | 'Senior' | 'Lead' | 'Principal' | 'Director' | 'VP' | 'C-Level';
  minYearsExperience: number;
  maxYearsExperience?: number;
  location: string;
  remotePolicy: 'onsite' | 'hybrid' | 'remote' | 'flexible';
  industry: string;
  companySize: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  salaryRange: {
    min: number;
    max: number;
    currency: string;
  };
  urgency: 'low' | 'medium' | 'high' | 'critical';
  clientPreferences: {
    preferredCompanies?: string[];
    avoidCompanies?: string[];
    preferredEducation?: string[];
    certifications?: string[];
  };
}

export interface CandidateProfile {
  id: string;
  firstName: string;
  lastName: string;
  headline: string;
  location: string;
  company: string;
  industry: string;
  seniority: string;
  yearsExperience: number;
  skills: string[];
  techStack: string[];
  education?: string[];
  certifications?: string[];
  previousCompanies: string[];
  openToWork: boolean;
  lastJobChange?: string;
  connectionDegree: string;
  premium: boolean;
  currentSalaryEstimate?: number;
  linkedinUrl: string;
  githubUrl?: string;
  portfolioUrl?: string;
}

export interface ScoringWeights {
  skillsMatch: number; // 30%
  experienceLevel: number; // 25%
  locationFit: number; // 15%
  companyBackground: number; // 10%
  availability: number; // 10%
  networkConnection: number; // 5%
  premiumProfile: number; // 3%
  education: number; // 2%
}

export interface CandidateScore {
  candidateId: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  breakdown: {
    skillsMatch: { score: number; maxScore: number; details: SkillsMatchDetail };
    experienceLevel: { score: number; maxScore: number; details: string };
    locationFit: { score: number; maxScore: number; details: string };
    companyBackground: { score: number; maxScore: number; details: string };
    availability: { score: number; maxScore: number; details: string };
    networkConnection: { score: number; maxScore: number; details: string };
    premiumProfile: { score: number; maxScore: number; details: string };
    education: { score: number; maxScore: number; details: string };
  };
  matchReasons: string[];
  concerns: string[];
  recommendations: string[];
}

export interface SkillsMatchDetail {
  requiredSkillsMatched: string[];
  requiredSkillsMissing: string[];
  preferredSkillsMatched: string[];
  additionalRelevantSkills: string[];
  matchPercentage: number;
}

const DEFAULT_WEIGHTS: ScoringWeights = {
  skillsMatch: 0.30,
  experienceLevel: 0.25,
  locationFit: 0.15,
  companyBackground: 0.10,
  availability: 0.10,
  networkConnection: 0.05,
  premiumProfile: 0.03,
  education: 0.02
};

export class CandidateScoringService {
  private weights: ScoringWeights;

  constructor(customWeights?: Partial<ScoringWeights>) {
    this.weights = { ...DEFAULT_WEIGHTS, ...customWeights };
  }

  /**
   * Score a single candidate against job requirements
   */
  scoreCandidate(candidate: CandidateProfile, jobRequirement: JobRequirement): CandidateScore {
    const skillsScore = this.scoreSkillsMatch(candidate, jobRequirement);
    const experienceScore = this.scoreExperienceLevel(candidate, jobRequirement);
    const locationScore = this.scoreLocationFit(candidate, jobRequirement);
    const companyScore = this.scoreCompanyBackground(candidate, jobRequirement);
    const availabilityScore = this.scoreAvailability(candidate, jobRequirement);
    const networkScore = this.scoreNetworkConnection(candidate);
    const premiumScore = this.scorePremiumProfile(candidate);
    const educationScore = this.scoreEducation(candidate, jobRequirement);

    const totalScore = 
      skillsScore.score * this.weights.skillsMatch +
      experienceScore.score * this.weights.experienceLevel +
      locationScore.score * this.weights.locationFit +
      companyScore.score * this.weights.companyBackground +
      availabilityScore.score * this.weights.availability +
      networkScore.score * this.weights.networkConnection +
      premiumScore.score * this.weights.premiumProfile +
      educationScore.score * this.weights.education;

    const maxScore = 100;
    const percentage = Math.round((totalScore / maxScore) * 100);

    const matchReasons = this.generateMatchReasons(candidate, jobRequirement, {
      skillsScore, experienceScore, locationScore, companyScore, availabilityScore
    });

    const concerns = this.generateConcerns(candidate, jobRequirement, {
      skillsScore, experienceScore, locationScore
    });

    const recommendations = this.generateRecommendations(candidate, jobRequirement, percentage);

    return {
      candidateId: candidate.id,
      totalScore: Math.round(totalScore),
      maxScore,
      percentage,
      breakdown: {
        skillsMatch: { score: Math.round(skillsScore.score * this.weights.skillsMatch), maxScore: Math.round(100 * this.weights.skillsMatch), details: skillsScore.details },
        experienceLevel: { score: Math.round(experienceScore.score * this.weights.experienceLevel), maxScore: Math.round(100 * this.weights.experienceLevel), details: experienceScore.details },
        locationFit: { score: Math.round(locationScore.score * this.weights.locationFit), maxScore: Math.round(100 * this.weights.locationFit), details: locationScore.details },
        companyBackground: { score: Math.round(companyScore.score * this.weights.companyBackground), maxScore: Math.round(100 * this.weights.companyBackground), details: companyScore.details },
        availability: { score: Math.round(availabilityScore.score * this.weights.availability), maxScore: Math.round(100 * this.weights.availability), details: availabilityScore.details },
        networkConnection: { score: Math.round(networkScore.score * this.weights.networkConnection), maxScore: Math.round(100 * this.weights.networkConnection), details: networkScore.details },
        premiumProfile: { score: Math.round(premiumScore.score * this.weights.premiumProfile), maxScore: Math.round(100 * this.weights.premiumProfile), details: premiumScore.details },
        education: { score: Math.round(educationScore.score * this.weights.education), maxScore: Math.round(100 * this.weights.education), details: educationScore.details }
      },
      matchReasons,
      concerns,
      recommendations
    };
  }

  /**
   * Score multiple candidates and return them ranked
   */
  scoreAndRankCandidates(candidates: CandidateProfile[], jobRequirement: JobRequirement): CandidateScore[] {
    return candidates
      .map(candidate => this.scoreCandidate(candidate, jobRequirement))
      .sort((a, b) => b.totalScore - a.totalScore);
  }

  /**
   * Score skills match between candidate and job requirements
   */
  private scoreSkillsMatch(candidate: CandidateProfile, jobRequirement: JobRequirement): { score: number; details: SkillsMatchDetail } {
    const candidateSkills = [...candidate.skills, ...candidate.techStack].map(s => s.toLowerCase());
    const requiredSkills = jobRequirement.requiredSkills.map(s => s.toLowerCase());
    const preferredSkills = jobRequirement.preferredSkills.map(s => s.toLowerCase());

    const requiredMatched = requiredSkills.filter(skill => 
      candidateSkills.some(candidateSkill => 
        candidateSkill.includes(skill) || skill.includes(candidateSkill)
      )
    );

    const preferredMatched = preferredSkills.filter(skill => 
      candidateSkills.some(candidateSkill => 
        candidateSkill.includes(skill) || skill.includes(candidateSkill)
      )
    );

    const requiredMissing = requiredSkills.filter(skill => !requiredMatched.includes(skill));
    
    const additionalRelevant = candidateSkills.filter(skill => 
      !requiredSkills.includes(skill) && 
      !preferredSkills.includes(skill) &&
      this.isRelevantSkill(skill, jobRequirement.title)
    );

    // Scoring logic: Required skills are critical, preferred skills are bonus
    const requiredScore = (requiredMatched.length / requiredSkills.length) * 70;
    const preferredScore = preferredSkills.length > 0 ? (preferredMatched.length / preferredSkills.length) * 20 : 20;
    const additionalScore = Math.min(additionalRelevant.length * 2, 10);

    const totalScore = Math.min(requiredScore + preferredScore + additionalScore, 100);
    const matchPercentage = Math.round((requiredMatched.length / requiredSkills.length) * 100);

    return {
      score: totalScore,
      details: {
        requiredSkillsMatched: requiredMatched,
        requiredSkillsMissing: requiredMissing,
        preferredSkillsMatched: preferredMatched,
        additionalRelevantSkills: additionalRelevant,
        matchPercentage
      }
    };
  }

  /**
   * Score experience level fit
   */
  private scoreExperienceLevel(candidate: CandidateProfile, jobRequirement: JobRequirement): { score: number; details: string } {
    const seniorityLevels = ['Entry', 'Mid', 'Senior', 'Lead', 'Principal', 'Director', 'VP', 'C-Level'];
    const candidateLevel = seniorityLevels.indexOf(candidate.seniority);
    const requiredLevel = seniorityLevels.indexOf(jobRequirement.experienceLevel);

    let score = 0;
    let details = '';

    if (candidateLevel === requiredLevel) {
      score = 100;
      details = 'Perfect seniority match';
    } else if (Math.abs(candidateLevel - requiredLevel) === 1) {
      score = 80;
      details = candidateLevel > requiredLevel ? 'Slightly overqualified' : 'Slightly underqualified';
    } else if (candidateLevel > requiredLevel) {
      score = Math.max(60 - (candidateLevel - requiredLevel) * 15, 20);
      details = 'Overqualified but may be interested';
    } else {
      score = Math.max(50 - (requiredLevel - candidateLevel) * 20, 10);
      details = 'Underqualified but shows potential';
    }

    // Years of experience check
    if (candidate.yearsExperience >= jobRequirement.minYearsExperience) {
      if (jobRequirement.maxYearsExperience && candidate.yearsExperience <= jobRequirement.maxYearsExperience) {
        score = Math.min(score + 10, 100);
        details += ' with ideal experience range';
      } else if (!jobRequirement.maxYearsExperience) {
        score = Math.min(score + 5, 100);
        details += ' with sufficient experience';
      }
    } else {
      score = Math.max(score - 20, 0);
      details += ' but lacks required experience';
    }

    return { score, details };
  }

  /**
   * Score location fit
   */
  private scoreLocationFit(candidate: CandidateProfile, jobRequirement: JobRequirement): { score: number; details: string } {
    const candidateLocation = candidate.location.toLowerCase();
    const jobLocation = jobRequirement.location.toLowerCase();

    if (jobRequirement.remotePolicy === 'remote') {
      return { score: 100, details: 'Remote position - location not a factor' };
    }

    if (candidateLocation.includes(jobLocation) || jobLocation.includes(candidateLocation)) {
      return { score: 100, details: 'Perfect location match' };
    }

    // Check for same city/state/region
    const candidateParts = candidateLocation.split(',').map(s => s.trim());
    const jobParts = jobLocation.split(',').map(s => s.trim());

    if (candidateParts.some(part => jobParts.includes(part))) {
      if (jobRequirement.remotePolicy === 'hybrid') {
        return { score: 90, details: 'Same region - hybrid friendly' };
      } else {
        return { score: 75, details: 'Same region - may require relocation' };
      }
    }

    if (jobRequirement.remotePolicy === 'flexible') {
      return { score: 60, details: 'Different location but flexible policy' };
    }

    return { score: 30, details: 'Location mismatch - relocation required' };
  }

  /**
   * Score company background fit
   */
  private scoreCompanyBackground(candidate: CandidateProfile, jobRequirement: JobRequirement): { score: number; details: string } {
    let score = 50; // Base score
    let details = 'Standard company background';

    // Check preferred companies
    if (jobRequirement.clientPreferences.preferredCompanies) {
      const hasPreferredCompany = jobRequirement.clientPreferences.preferredCompanies.some(company =>
        candidate.previousCompanies.some(prev => prev.toLowerCase().includes(company.toLowerCase())) ||
        candidate.company.toLowerCase().includes(company.toLowerCase())
      );

      if (hasPreferredCompany) {
        score += 30;
        details = 'Experience at preferred company';
      }
    }

    // Check avoided companies
    if (jobRequirement.clientPreferences.avoidCompanies) {
      const hasAvoidedCompany = jobRequirement.clientPreferences.avoidCompanies.some(company =>
        candidate.previousCompanies.some(prev => prev.toLowerCase().includes(company.toLowerCase())) ||
        candidate.company.toLowerCase().includes(company.toLowerCase())
      );

      if (hasAvoidedCompany) {
        score -= 20;
        details = 'Experience at avoided company';
      }
    }

    // Industry match
    if (candidate.industry.toLowerCase() === jobRequirement.industry.toLowerCase()) {
      score += 15;
      details += ' with industry expertise';
    }

    // Company size fit
    const companySizeScore = this.getCompanySizeScore(candidate.company, jobRequirement.companySize);
    score += companySizeScore;

    return { score: Math.min(Math.max(score, 0), 100), details };
  }

  /**
   * Score availability
   */
  private scoreAvailability(candidate: CandidateProfile, jobRequirement: JobRequirement): { score: number; details: string } {
    let score = 50;
    let details = 'Standard availability';

    if (candidate.openToWork) {
      score = 100;
      details = 'Actively looking for opportunities';
    } else {
      // Check last job change
      if (candidate.lastJobChange) {
        const lastChange = new Date(candidate.lastJobChange);
        const monthsSinceChange = (Date.now() - lastChange.getTime()) / (1000 * 60 * 60 * 24 * 30);

        if (monthsSinceChange < 6) {
          score = 20;
          details = 'Recently changed jobs - likely not interested';
        } else if (monthsSinceChange < 12) {
          score = 40;
          details = 'Changed jobs recently - may not be ready to move';
        } else if (monthsSinceChange > 24) {
          score = 80;
          details = 'May be ready for new opportunity';
        }
      }

      // Urgency factor
      if (jobRequirement.urgency === 'critical' || jobRequirement.urgency === 'high') {
        score -= 10;
        details += ' - urgency may be challenging';
      }
    }

    return { score: Math.min(Math.max(score, 0), 100), details };
  }

  /**
   * Score network connection strength
   */
  private scoreNetworkConnection(candidate: CandidateProfile): { score: number; details: string } {
    switch (candidate.connectionDegree) {
      case '1st':
        return { score: 100, details: 'Direct connection' };
      case '2nd':
        return { score: 80, details: 'Mutual connection' };
      case '3rd':
        return { score: 60, details: 'Extended network' };
      default:
        return { score: 40, details: 'No direct connection' };
    }
  }

  /**
   * Score premium profile
   */
  private scorePremiumProfile(candidate: CandidateProfile): { score: number; details: string } {
    if (candidate.premium) {
      return { score: 100, details: 'Premium LinkedIn profile' };
    }
    return { score: 50, details: 'Standard LinkedIn profile' };
  }

  /**
   * Score education fit
   */
  private scoreEducation(candidate: CandidateProfile, jobRequirement: JobRequirement): { score: number; details: string } {
    if (!jobRequirement.clientPreferences.preferredEducation || !candidate.education) {
      return { score: 50, details: 'Education not specified' };
    }

    const hasPreferredEducation = jobRequirement.clientPreferences.preferredEducation.some(education =>
      candidate.education?.some(edu => edu.toLowerCase().includes(education.toLowerCase()))
    );

    if (hasPreferredEducation) {
      return { score: 100, details: 'Preferred educational background' };
    }

    return { score: 30, details: 'Different educational background' };
  }

  /**
   * Helper methods
   */
  private isRelevantSkill(skill: string, jobTitle: string): boolean {
    const jobTitleLower = jobTitle.toLowerCase();
    const skillLower = skill.toLowerCase();

    // Add logic to determine if a skill is relevant to the job title
    const relevantTechSkills = ['javascript', 'python', 'java', 'react', 'node', 'sql', 'aws', 'docker', 'kubernetes'];
    
    return relevantTechSkills.some(tech => skillLower.includes(tech));
  }

  private getCompanySizeScore(companyName: string, preferredSize: string): number {
    // This would normally connect to a company database
    // For now, return a base score
    return 10;
  }

  private generateMatchReasons(candidate: CandidateProfile, jobRequirement: JobRequirement, scores: any): string[] {
    const reasons: string[] = [];

    if (scores.skillsScore.details.matchPercentage >= 80) {
      reasons.push(`Strong skills match (${scores.skillsScore.details.matchPercentage}%)`);
    }

    if (scores.experienceScore.score >= 80) {
      reasons.push(`Excellent experience level fit`);
    }

    if (scores.locationScore.score >= 90) {
      reasons.push(`Perfect location match`);
    }

    if (candidate.openToWork) {
      reasons.push(`Actively seeking opportunities`);
    }

    if (candidate.connectionDegree === '1st' || candidate.connectionDegree === '2nd') {
      reasons.push(`Strong network connection`);
    }

    return reasons;
  }

  private generateConcerns(candidate: CandidateProfile, jobRequirement: JobRequirement, scores: any): string[] {
    const concerns: string[] = [];

    if (scores.skillsScore.details.requiredSkillsMissing.length > 0) {
      concerns.push(`Missing required skills: ${scores.skillsScore.details.requiredSkillsMissing.join(', ')}`);
    }

    if (scores.experienceScore.score < 50) {
      concerns.push(`Experience level may not be ideal`);
    }

    if (scores.locationScore.score < 60) {
      concerns.push(`Location may require relocation or remote work`);
    }

    if (!candidate.openToWork && candidate.lastJobChange) {
      const monthsSinceChange = (Date.now() - new Date(candidate.lastJobChange).getTime()) / (1000 * 60 * 60 * 24 * 30);
      if (monthsSinceChange < 12) {
        concerns.push(`Recently changed jobs - may not be ready to move`);
      }
    }

    return concerns;
  }

  private generateRecommendations(candidate: CandidateProfile, jobRequirement: JobRequirement, percentage: number): string[] {
    const recommendations: string[] = [];

    if (percentage >= 90) {
      recommendations.push(`Excellent candidate - prioritize for immediate outreach`);
    } else if (percentage >= 75) {
      recommendations.push(`Strong candidate - recommend for phone screening`);
    } else if (percentage >= 60) {
      recommendations.push(`Good potential - consider for initial conversation`);
    } else {
      recommendations.push(`Lower match - consider if other options limited`);
    }

    if (candidate.openToWork) {
      recommendations.push(`High likelihood of response - good timing for outreach`);
    }

    if (candidate.connectionDegree === '1st') {
      recommendations.push(`Direct connection - leverage existing relationship`);
    } else if (candidate.connectionDegree === '2nd') {
      recommendations.push(`Request warm introduction through mutual connection`);
    }

    return recommendations;
  }
}

// Export singleton instance
export const candidateScoringService = new CandidateScoringService();
