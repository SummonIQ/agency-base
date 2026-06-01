import { Candidate, NetworkContact } from './types';

export class CandidateSourcing {
  /**
   * Boolean search strings for different platforms
   */
  static readonly SEARCH_STRINGS = {
    linkedin: {
      fullStackDeveloper: '("Full Stack Developer" OR "Full-Stack Developer" OR "Fullstack Developer") AND (React OR Vue OR Angular) AND (Node.js OR "Node js" OR Express) AND -intern',
      frontendDeveloper: '("Frontend Developer" OR "Front-end Developer" OR "Front End Developer" OR "UI Developer") AND (React OR Vue OR Angular OR JavaScript) AND -intern',
      backendDeveloper: '("Backend Developer" OR "Back-end Developer" OR "Back End Developer" OR "Server Developer") AND (Node.js OR Python OR Java OR "C#" OR Go) AND -intern',
      reactDeveloper: '("React Developer" OR "React.js Developer" OR "ReactJS Developer") AND (JavaScript OR TypeScript) AND -intern',
      devopsEngineer: '("DevOps Engineer" OR "Site Reliability Engineer" OR "Platform Engineer") AND (AWS OR Azure OR GCP OR Docker OR Kubernetes) AND -intern'
    },
    github: {
      byLanguage: {
        javascript: 'language:javascript location:"San Francisco" followers:>10',
        typescript: 'language:typescript location:"New York" followers:>5',
        python: 'language:python location:"Austin" followers:>10',
        go: 'language:go location:"Seattle" followers:>5'
      },
      byTechnology: {
        react: 'react in:readme location:"San Francisco" followers:>10',
        nodejs: 'node.js in:readme location:"Austin" followers:>5',
        kubernetes: 'kubernetes in:readme location:"Seattle" followers:>10'
      }
    }
  };

  /**
   * Candidate sourcing strategies by role
   */
  static readonly SOURCING_STRATEGIES = {
    'Senior Full Stack Developer': {
      primarySources: ['LinkedIn', 'GitHub', 'AngelList'],
      searchCriteria: {
        experience: '5+ years',
        skills: ['React', 'Node.js', 'TypeScript', 'AWS'],
        currentTitles: ['Senior Developer', 'Lead Developer', 'Principal Engineer'],
        companies: ['Tech startups', 'Scale-ups', 'FAANG alumni']
      },
      outreachApproach: 'Technical credibility + interesting challenges',
      responseRate: '15-20%'
    },
    'Frontend Developer': {
      primarySources: ['LinkedIn', 'Dribbble', 'GitHub'],
      searchCriteria: {
        experience: '3+ years',
        skills: ['React', 'Vue', 'Angular', 'CSS', 'JavaScript'],
        currentTitles: ['Frontend Developer', 'UI Developer', 'JavaScript Developer'],
        companies: ['Product companies', 'Agencies', 'E-commerce']
      },
      outreachApproach: 'Design-focused + user experience impact',
      responseRate: '18-25%'
    },
    'DevOps Engineer': {
      primarySources: ['LinkedIn', 'GitHub', 'Stack Overflow'],
      searchCriteria: {
        experience: '4+ years',
        skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD'],
        currentTitles: ['DevOps Engineer', 'SRE', 'Platform Engineer'],
        companies: ['Cloud-first companies', 'High-growth startups']
      },
      outreachApproach: 'Infrastructure challenges + scale problems',
      responseRate: '12-18%'
    }
  };

  /**
   * Generate personalized outreach message
   */
  static generateOutreachMessage(
    candidate: Partial<Candidate>,
    jobTitle: string,
    companyInfo: {
      name: string;
      stage: string;
      product: string;
      techStack: string[];
      challenge: string;
    },
    recruiterInfo: {
      name: string;
      background: string;
    }
  ): { subject: string; message: string } {
    const personalTouch = this.getPersonalTouch(candidate);
    const techAlignment = this.getTechAlignment(candidate.skills || [], companyInfo.techStack);
    
    return {
      subject: `${jobTitle} opportunity at ${companyInfo.name}`,
      message: `Hi ${candidate.firstName},

${personalTouch}

I'm ${recruiterInfo.name}, a ${recruiterInfo.background} turned technical recruiter. I specialize in connecting talented developers with companies that truly value engineering excellence.

I'm working with ${companyInfo.name}, a ${companyInfo.stage} company building ${companyInfo.product}. They're looking for a ${jobTitle} to help tackle ${companyInfo.challenge}.

${techAlignment}

What makes this role special:
• Work with cutting-edge technology (${companyInfo.techStack.slice(0, 3).join(', ')})
• Solve complex technical challenges at scale
• Join a team that values code quality and innovation
• Competitive compensation + equity

Even if you're not actively looking, I'd love to share more details about the role and get your thoughts on the current market.

Would you be open to a brief 15-minute call this week?

Best regards,
${recruiterInfo.name}`
    };
  }

  private static getPersonalTouch(candidate: Partial<Candidate>): string {
    if (candidate.githubUrl) {
      return `I came across your work on GitHub and was impressed by your contributions to open source projects.`;
    }
    if (candidate.currentCompany) {
      return `I see you're currently at ${candidate.currentCompany} - I've heard great things about the engineering culture there.`;
    }
    if (candidate.skills && candidate.skills.length > 0) {
      return `Your expertise in ${candidate.skills.slice(0, 2).join(' and ')} caught my attention.`;
    }
    return `I came across your profile and was impressed by your technical background.`;
  }

  private static getTechAlignment(candidateSkills: string[], companyTech: string[]): string {
    const overlap = candidateSkills.filter(skill => 
      companyTech.some(tech => tech.toLowerCase().includes(skill.toLowerCase()))
    );
    
    if (overlap.length > 0) {
      return `I noticed you have experience with ${overlap.join(', ')} - that aligns perfectly with their current tech stack.`;
    }
    return `Your technical background would be a great fit for their engineering challenges.`;
  }

  /**
   * Score candidate fit for a role
   */
  static scoreCandidateFit(
    candidate: Candidate,
    jobRequirements: {
      requiredSkills: string[];
      preferredSkills: string[];
      minExperience: number;
      level: string;
      location?: string;
      remote: boolean;
    }
  ): {
    score: number;
    breakdown: {
      skillsMatch: number;
      experienceMatch: number;
      levelMatch: number;
      locationMatch: number;
    };
    reasoning: string[];
  } {
    const breakdown = {
      skillsMatch: this.calculateSkillsMatch(candidate.skills, jobRequirements.requiredSkills, jobRequirements.preferredSkills),
      experienceMatch: this.calculateExperienceMatch(candidate.experience, jobRequirements.minExperience),
      levelMatch: this.calculateLevelMatch(candidate.currentTitle, jobRequirements.level),
      locationMatch: this.calculateLocationMatch(candidate.location, candidate.openToRemote, jobRequirements.location, jobRequirements.remote)
    };

    const score = (breakdown.skillsMatch * 0.4 + breakdown.experienceMatch * 0.25 + breakdown.levelMatch * 0.25 + breakdown.locationMatch * 0.1);
    
    const reasoning = [];
    if (breakdown.skillsMatch > 8) reasoning.push('Strong technical skills match');
    if (breakdown.experienceMatch > 8) reasoning.push('Experience level aligns well');
    if (breakdown.levelMatch > 8) reasoning.push('Seniority level is appropriate');
    if (breakdown.locationMatch > 8) reasoning.push('Location/remote preferences align');

    return { score, breakdown, reasoning };
  }

  private static calculateSkillsMatch(candidateSkills: string[], required: string[], preferred: string[]): number {
    const requiredMatches = required.filter(skill => 
      candidateSkills.some(cs => cs.toLowerCase().includes(skill.toLowerCase()))
    ).length;
    
    const preferredMatches = preferred.filter(skill => 
      candidateSkills.some(cs => cs.toLowerCase().includes(skill.toLowerCase()))
    ).length;

    const requiredScore = (requiredMatches / required.length) * 8;
    const preferredScore = (preferredMatches / Math.max(preferred.length, 1)) * 2;
    
    return Math.min(10, requiredScore + preferredScore);
  }

  private static calculateExperienceMatch(candidateExp: number, minRequired: number): number {
    if (candidateExp >= minRequired * 1.5) return 10;
    if (candidateExp >= minRequired) return 8;
    if (candidateExp >= minRequired * 0.8) return 6;
    if (candidateExp >= minRequired * 0.6) return 4;
    return 2;
  }

  private static calculateLevelMatch(candidateTitle: string, requiredLevel: string): number {
    const levelMap: Record<string, number> = {
      'junior': 1,
      'mid': 2,
      'senior': 3,
      'lead': 4,
      'principal': 5,
      'executive': 6
    };

    const candidateLevel = this.extractLevelFromTitle(candidateTitle);
    const requiredLevelNum = levelMap[requiredLevel.toLowerCase()] || 2;
    const candidateLevelNum = levelMap[candidateLevel] || 2;

    if (candidateLevelNum === requiredLevelNum) return 10;
    if (Math.abs(candidateLevelNum - requiredLevelNum) === 1) return 7;
    if (Math.abs(candidateLevelNum - requiredLevelNum) === 2) return 4;
    return 2;
  }

  private static extractLevelFromTitle(title: string): string {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('senior') || lowerTitle.includes('sr.')) return 'senior';
    if (lowerTitle.includes('lead') || lowerTitle.includes('staff')) return 'lead';
    if (lowerTitle.includes('principal') || lowerTitle.includes('architect')) return 'principal';
    if (lowerTitle.includes('junior') || lowerTitle.includes('jr.')) return 'junior';
    if (lowerTitle.includes('director') || lowerTitle.includes('vp') || lowerTitle.includes('cto')) return 'executive';
    return 'mid';
  }

  private static calculateLocationMatch(
    candidateLocation: string,
    candidateRemote: boolean,
    jobLocation?: string,
    jobRemote?: boolean
  ): number {
    if (jobRemote && candidateRemote) return 10;
    if (!jobLocation) return 8;
    
    const candidateLower = candidateLocation.toLowerCase();
    const jobLower = jobLocation.toLowerCase();
    
    if (candidateLower.includes(jobLower) || jobLower.includes(candidateLower)) return 10;
    
    // Same state/region matching logic could be added here
    return candidateRemote ? 6 : 3;
  }
}

export const CANDIDATE_OUTREACH_SEQUENCES = {
  coldOutreach: [
    {
      day: 1,
      type: 'linkedin' as const,
      template: 'initial-linkedin-message',
      subject: 'Connection + opportunity at {{companyName}}'
    },
    {
      day: 4,
      type: 'email' as const,
      template: 'follow-up-email',
      subject: 'Re: {{jobTitle}} opportunity'
    },
    {
      day: 10,
      type: 'linkedin' as const,
      template: 'value-add-message',
      subject: 'Thought you might find this interesting'
    },
    {
      day: 18,
      type: 'email' as const,
      template: 'final-follow-up',
      subject: 'Last note about {{companyName}}'
    }
  ],
  warmOutreach: [
    {
      day: 1,
      type: 'email' as const,
      template: 'warm-introduction',
      subject: '{{mutualConnection}} suggested I reach out'
    },
    {
      day: 5,
      type: 'linkedin' as const,
      template: 'linkedin-follow-up',
      subject: 'Following up on my email'
    }
  ],
  referralRequest: [
    {
      day: 1,
      type: 'email' as const,
      template: 'referral-request',
      subject: 'Quick favor - know any great {{roleType}} developers?'
    },
    {
      day: 14,
      type: 'email' as const,
      template: 'referral-follow-up',
      subject: 'Still looking for {{roleType}} referrals'
    }
  ]
};

export const candidateSourcing = new CandidateSourcing();
