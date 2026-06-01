import { ProspectCompany, ProspectContact, LeadScore } from './types';

// Mock data for development - replace with real API integrations
const MOCK_COMPANIES: ProspectCompany[] = [
  {
    id: '1',
    name: 'TechStartup Inc',
    domain: 'techstartup.com',
    industry: 'Software',
    size: '50-200',
    location: 'San Francisco, CA',
    employees: 125,
    revenue: '$5M-$10M',
    techStack: ['React', 'Node.js', 'AWS', 'MongoDB'],
    socialProfiles: {
      linkedin: 'https://linkedin.com/company/techstartup',
      twitter: 'https://twitter.com/techstartup'
    },
    description: 'B2B SaaS platform for project management',
    foundedYear: 2019,
    funding: {
      stage: 'Series A',
      amount: '$8M',
      lastRound: '2023'
    }
  },
  {
    id: '2',
    name: 'GrowthCorp',
    domain: 'growthcorp.io',
    industry: 'E-commerce',
    size: '200-500',
    location: 'Austin, TX',
    employees: 350,
    revenue: '$20M-$50M',
    techStack: ['Shopify', 'React', 'Python', 'Google Cloud'],
    socialProfiles: {
      linkedin: 'https://linkedin.com/company/growthcorp'
    },
    description: 'Direct-to-consumer e-commerce platform',
    foundedYear: 2017
  }
];

const MOCK_CONTACTS: ProspectContact[] = [
  {
    id: '1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@techstartup.com',
    jobTitle: 'VP of Engineering',
    department: 'Engineering',
    seniority: 'executive',
    linkedinUrl: 'https://linkedin.com/in/sarahjohnson',
    companyId: '1',
    verified: true
  },
  {
    id: '2',
    firstName: 'Mike',
    lastName: 'Chen',
    email: 'mike.chen@growthcorp.io',
    jobTitle: 'Head of Marketing',
    department: 'Marketing',
    seniority: 'senior',
    linkedinUrl: 'https://linkedin.com/in/mikechen',
    companyId: '2',
    verified: true
  }
];

export class ProspectDiscovery {
  /**
   * Search for companies based on criteria
   */
  async searchCompanies(criteria: {
    industry?: string;
    size?: string;
    location?: string;
    techStack?: string[];
    revenue?: string;
    keywords?: string;
    limit?: number;
  }): Promise<ProspectCompany[]> {
    // TODO: Integrate with Apollo.io, ZoomInfo, or similar API
    // For now, return filtered mock data
    
    let results = MOCK_COMPANIES;
    
    if (criteria.industry) {
      results = results.filter(c => 
        c.industry.toLowerCase().includes(criteria.industry!.toLowerCase())
      );
    }
    
    if (criteria.size) {
      results = results.filter(c => c.size === criteria.size);
    }
    
    if (criteria.location) {
      results = results.filter(c => 
        c.location.toLowerCase().includes(criteria.location!.toLowerCase())
      );
    }
    
    if (criteria.techStack && criteria.techStack.length > 0) {
      results = results.filter(c => 
        c.techStack?.some(tech => 
          criteria.techStack!.some(searchTech => 
            tech.toLowerCase().includes(searchTech.toLowerCase())
          )
        )
      );
    }
    
    return results.slice(0, criteria.limit || 50);
  }

  /**
   * Find contacts at a specific company
   */
  async findContacts(companyId: string, filters?: {
    department?: string;
    seniority?: string;
    jobTitles?: string[];
  }): Promise<ProspectContact[]> {
    // TODO: Integrate with contact discovery API
    
    let contacts = MOCK_CONTACTS.filter(c => c.companyId === companyId);
    
    if (filters?.department) {
      contacts = contacts.filter(c => 
        c.department.toLowerCase().includes(filters.department!.toLowerCase())
      );
    }
    
    if (filters?.seniority) {
      contacts = contacts.filter(c => c.seniority === filters.seniority);
    }
    
    if (filters?.jobTitles && filters.jobTitles.length > 0) {
      contacts = contacts.filter(c => 
        filters.jobTitles!.some(title => 
          c.jobTitle.toLowerCase().includes(title.toLowerCase())
        )
      );
    }
    
    return contacts;
  }

  /**
   * Enrich company data with additional information
   */
  async enrichCompany(domain: string): Promise<ProspectCompany | null> {
    // TODO: Integrate with Clearbit, Apollo, or similar enrichment API
    
    const company = MOCK_COMPANIES.find(c => c.domain === domain);
    if (!company) return null;
    
    // Simulate API enrichment delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      ...company,
      // Add enriched data
      techStack: [...(company.techStack || []), 'TypeScript', 'PostgreSQL'],
      description: company.description + ' - Recently expanded to European markets'
    };
  }

  /**
   * Verify and enrich contact email
   */
  async verifyContact(contact: Partial<ProspectContact>): Promise<{
    email?: string;
    verified: boolean;
    confidence: number;
    alternativeEmails?: string[];
  }> {
    // TODO: Integrate with Hunter.io, ZeroBounce, or similar verification API
    
    if (contact.email) {
      // Simulate email verification
      const isValid = !contact.email.includes('invalid');
      return {
        email: contact.email,
        verified: isValid,
        confidence: isValid ? 0.95 : 0.1
      };
    }
    
    // Generate potential email patterns
    const firstName = contact.firstName?.toLowerCase();
    const lastName = contact.lastName?.toLowerCase();
    const domain = 'example.com'; // Would get from company data
    
    const patterns = [
      `${firstName}.${lastName}@${domain}`,
      `${firstName}@${domain}`,
      `${firstName}${lastName}@${domain}`,
      `${firstName?.charAt(0)}${lastName}@${domain}`
    ];
    
    return {
      email: patterns[0],
      verified: false,
      confidence: 0.7,
      alternativeEmails: patterns.slice(1)
    };
  }

  /**
   * Score a prospect based on various factors
   */
  async scoreProspect(company: ProspectCompany, contact: ProspectContact): Promise<LeadScore> {
    const factors = {
      companySize: this.scoreCompanySize(company.size),
      industry: this.scoreIndustry(company.industry),
      techStack: this.scoreTechStack(company.techStack || []),
      recentActivity: this.scoreRecentActivity(company),
      contactSeniority: this.scoreContactSeniority(contact.seniority)
    };
    
    const overall = Object.values(factors).reduce((sum, score) => sum + score, 0) / 5;
    
    const reasoning = [];
    if (factors.companySize > 7) reasoning.push('Ideal company size for our services');
    if (factors.techStack > 7) reasoning.push('Uses technologies we specialize in');
    if (factors.contactSeniority > 8) reasoning.push('High-level decision maker');
    if (factors.industry > 6) reasoning.push('Target industry match');
    
    return {
      overall: Math.round(overall * 10) / 10,
      factors,
      reasoning
    };
  }

  private scoreCompanySize(size: string): number {
    const sizeMap: Record<string, number> = {
      '1-10': 3,
      '11-50': 6,
      '50-200': 9,
      '200-500': 8,
      '500-1000': 7,
      '1000+': 5
    };
    return sizeMap[size] || 5;
  }

  private scoreIndustry(industry: string): number {
    const targetIndustries = ['Software', 'Technology', 'SaaS', 'E-commerce', 'Fintech'];
    return targetIndustries.some(target => 
      industry.toLowerCase().includes(target.toLowerCase())
    ) ? 8 : 5;
  }

  private scoreTechStack(techStack: string[]): number {
    const ourExpertise = ['React', 'Node.js', 'TypeScript', 'AWS', 'Next.js', 'Python'];
    const matches = techStack.filter(tech => 
      ourExpertise.some(expertise => 
        tech.toLowerCase().includes(expertise.toLowerCase())
      )
    );
    return Math.min(10, (matches.length / ourExpertise.length) * 10);
  }

  private scoreRecentActivity(company: ProspectCompany): number {
    // TODO: Integrate with news APIs to check for recent funding, hiring, etc.
    if (company.funding?.lastRound === '2023' || company.funding?.lastRound === '2024') {
      return 9;
    }
    return 6;
  }

  private scoreContactSeniority(seniority: string): number {
    const seniorityScores: Record<string, number> = {
      'entry': 3,
      'mid': 5,
      'senior': 7,
      'executive': 9,
      'c-level': 10
    };
    return seniorityScores[seniority] || 5;
  }
}

export const prospectDiscovery = new ProspectDiscovery();
