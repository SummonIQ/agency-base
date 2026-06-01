import { BaseEnrichmentProvider, EnrichmentResult } from './enrichment-service';

export interface ApolloSearchCriteria {
  // Company filters
  companyName?: string;
  domain?: string;
  industry?: string;
  companySize?: string;
  revenue?: string;
  location?: string;
  techStack?: string[];
  fundingStage?: string;

  // Contact filters
  personName?: string;
  jobTitle?: string;
  seniority?: string;
  department?: string;
  email?: string;

  // Search parameters
  limit?: number;
  offset?: number;
  includeEmails?: boolean;
  includePhoneNumbers?: boolean;
}

export interface ApolloCompanyResult {
  id: string;
  name: string;
  domain: string;
  industry: string;
  description?: string;
  employees?: number;
  revenue?: number;
  location?: string;
  founded?: number;
  techStack?: string[];
  socialProfiles?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  fundingInfo?: {
    stage?: string;
    amount?: number;
    investors?: string[];
  };
}

export interface ApolloContactResult {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  title: string;
  seniority: string;
  department: string;
  companyId: string;
  companyName: string;
  linkedinUrl?: string;
  location?: string;
  emailStatus?: 'valid' | 'invalid' | 'risky' | 'unknown';
  emailVerifiedAt?: string;
}

export interface ApolloSearchResponse {
  companies?: ApolloCompanyResult[];
  contacts?: ApolloContactResult[];
  pagination: {
    page: number;
    perPage: number;
    totalEntries: number;
    totalPages: number;
  };
}

/**
 * Apollo.io API integration for lead enrichment and prospecting
 * Provides company and contact discovery with advanced search capabilities
 */
export class ApolloProvider extends BaseEnrichmentProvider {
  private baseUrl = 'https://api.apollo.io/v1';
  private apiKey: string;

  constructor(apiKey: string) {
    super();
    this.apiKey = apiKey;
  }

  async enrichCompany(domain: string): Promise<EnrichmentResult> {
    try {
      const response = await this.makeRequest('/organizations/enrich', {
        domain: domain,
      });

      if (!response.organization) {
        return {
          success: false,
          error: 'Company not found',
        };
      }

      const org = response.organization;

      return {
        success: true,
        data: {
          name: org.name,
          domain: org.website_url || domain,
          description: org.short_description || org.description,
          industry: org.industry,
          employees: org.estimated_num_employees,
          revenue: org.annual_revenue,
          location: this.formatLocation(org),
          founded: org.founded_year,
          techStack: org.technologies?.map((tech: any) => tech.name) || [],
          socialProfiles: {
            linkedin: org.linkedin_url,
            twitter: org.twitter_url,
            facebook: org.facebook_url,
          },
          fundingInfo: org.funding_events?.length > 0 ? {
            stage: org.funding_events[0].funding_round_type,
            amount: org.funding_events[0].money_raised,
          } : undefined,
          source: 'apollo',
          lastUpdated: new Date().toISOString(),
        }
      };
    } catch (error) {
      console.error('Apollo company enrichment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Apollo API error',
      };
    }
  }

  async enrichContact(email: string, domain?: string): Promise<EnrichmentResult> {
    try {
      const response = await this.makeRequest('/people/enrich', {
        email: email,
        ...(domain && { organization_domain: domain }),
      });

      if (!response.person) {
        return {
          success: false,
          error: 'Contact not found',
        };
      }

      const person = response.person;

      return {
        success: true,
        data: {
          firstName: person.first_name,
          lastName: person.last_name,
          email: person.email,
          jobTitle: person.title,
          company: person.organization?.name,
          seniority: person.seniority,
          department: person.functions?.[0],
          location: this.formatPersonLocation(person),
          linkedinUrl: person.linkedin_url,
          phoneNumber: person.phone_numbers?.[0]?.sanitized_number,
          emailStatus: this.mapEmailStatus(person.email_status),
          source: 'apollo',
          lastUpdated: new Date().toISOString(),
        }
      };
    } catch (error) {
      console.error('Apollo contact enrichment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Apollo API error',
      };
    }
  }

  async searchCompanies(criteria: ApolloSearchCriteria): Promise<{ success: boolean; data?: ApolloCompanyResult[]; error?: string; total?: number }> {
    try {
      const filters: any = {};

      // Build company filters
      if (criteria.companyName) {
        filters.organization_names = [criteria.companyName];
      }

      if (criteria.domain) {
        filters.organization_domains = [criteria.domain];
      }

      if (criteria.industry) {
        filters.organization_industry_tag_ids = await this.getIndustryTagIds(criteria.industry);
      }

      if (criteria.companySize) {
        filters.organization_num_employees_ranges = [this.mapCompanySizeRange(criteria.companySize)];
      }

      if (criteria.revenue) {
        filters.revenue_ranges = [this.mapRevenueRange(criteria.revenue)];
      }

      if (criteria.location) {
        filters.organization_locations = [criteria.location];
      }

      if (criteria.techStack?.length) {
        filters.technology_names = criteria.techStack;
      }

      if (criteria.fundingStage) {
        filters.funding_stage_list = [criteria.fundingStage];
      }

      const response = await this.makeRequest('/organizations/search', {
        ...filters,
        page: Math.floor((criteria.offset || 0) / (criteria.limit || 25)) + 1,
        per_page: criteria.limit || 25,
      });

      const companies: ApolloCompanyResult[] = response.organizations?.map((org: any) => ({
        id: org.id,
        name: org.name,
        domain: org.website_url,
        industry: org.industry,
        description: org.short_description || org.description,
        employees: org.estimated_num_employees,
        revenue: org.annual_revenue,
        location: this.formatLocation(org),
        founded: org.founded_year,
        techStack: org.technologies?.map((tech: any) => tech.name) || [],
        socialProfiles: {
          linkedin: org.linkedin_url,
          twitter: org.twitter_url,
          facebook: org.facebook_url,
        },
        fundingInfo: org.funding_events?.length > 0 ? {
          stage: org.funding_events[0].funding_round_type,
          amount: org.funding_events[0].money_raised,
          investors: org.funding_events[0].investors?.map((inv: any) => inv.name) || [],
        } : undefined,
      })) || [];

      return {
        success: true,
        data: companies,
        total: response.pagination?.total_entries || companies.length,
      };

    } catch (error) {
      console.error('Apollo company search error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Apollo API error',
      };
    }
  }

  async searchContacts(criteria: ApolloSearchCriteria): Promise<{ success: boolean; data?: ApolloContactResult[]; error?: string; total?: number }> {
    try {
      const filters: any = {};

      // Build contact filters
      if (criteria.personName) {
        filters.person_names = [criteria.personName];
      }

      if (criteria.jobTitle) {
        filters.person_titles = [criteria.jobTitle];
      }

      if (criteria.seniority) {
        filters.person_seniorities = [criteria.seniority];
      }

      if (criteria.department) {
        filters.person_departments = [criteria.department];
      }

      if (criteria.email) {
        filters.emails = [criteria.email];
      }

      // Company filters for contacts
      if (criteria.companyName) {
        filters.organization_names = [criteria.companyName];
      }

      if (criteria.domain) {
        filters.organization_domains = [criteria.domain];
      }

      if (criteria.industry) {
        filters.organization_industry_tag_ids = await this.getIndustryTagIds(criteria.industry);
      }

      if (criteria.companySize) {
        filters.organization_num_employees_ranges = [this.mapCompanySizeRange(criteria.companySize)];
      }

      if (criteria.location) {
        filters.person_locations = [criteria.location];
      }

      const response = await this.makeRequest('/people/search', {
        ...filters,
        page: Math.floor((criteria.offset || 0) / (criteria.limit || 25)) + 1,
        per_page: criteria.limit || 25,
        reveal_personal_emails: criteria.includeEmails || false,
        reveal_phone_numbers: criteria.includePhoneNumbers || false,
      });

      const contacts: ApolloContactResult[] = response.people?.map((person: any) => ({
        id: person.id,
        firstName: person.first_name,
        lastName: person.last_name,
        email: person.email,
        phoneNumber: person.phone_numbers?.[0]?.sanitized_number,
        title: person.title,
        seniority: person.seniority,
        department: person.functions?.[0],
        companyId: person.organization?.id,
        companyName: person.organization?.name,
        linkedinUrl: person.linkedin_url,
        location: this.formatPersonLocation(person),
        emailStatus: this.mapEmailStatus(person.email_status),
        emailVerifiedAt: person.email_verified_at,
      })) || [];

      return {
        success: true,
        data: contacts,
        total: response.pagination?.total_entries || contacts.length,
      };

    } catch (error) {
      console.error('Apollo contact search error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Apollo API error',
      };
    }
  }

  async verifyConfiguration(): Promise<boolean> {
    try {
      const response = await this.makeRequest('/auth/health');
      return response.is_logged_in === true;
    } catch (error) {
      console.error('Apollo configuration verification failed:', error);
      return false;
    }
  }

  private async makeRequest(endpoint: string, data?: any): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    const options: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': this.apiKey,
      },
      body: JSON.stringify(data || {}),
    };

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Apollo API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  private formatLocation(org: any): string {
    const parts = [];
    if (org.city) parts.push(org.city);
    if (org.state) parts.push(org.state);
    if (org.country) parts.push(org.country);
    return parts.join(', ');
  }

  private formatPersonLocation(person: any): string {
    const parts = [];
    if (person.city) parts.push(person.city);
    if (person.state) parts.push(person.state);
    if (person.country) parts.push(person.country);
    return parts.join(', ');
  }

  private mapEmailStatus(status: string): 'valid' | 'invalid' | 'risky' | 'unknown' {
    switch (status?.toLowerCase()) {
      case 'verified':
      case 'deliverable':
        return 'valid';
      case 'undeliverable':
      case 'bounce':
        return 'invalid';
      case 'risky':
      case 'role_based':
        return 'risky';
      default:
        return 'unknown';
    }
  }

  private mapCompanySizeRange(size: string): string {
    const sizeMap: Record<string, string> = {
      '1-10': '1,10',
      '11-50': '11,50',
      '51-200': '51,200',
      '201-500': '201,500',
      '501-1000': '501,1000',
      '1001-5000': '1001,5000',
      '5001-10000': '5001,10000',
      '10000+': '10000,',
    };
    return sizeMap[size] || size;
  }

  private mapRevenueRange(revenue: string): string {
    const revenueMap: Record<string, string> = {
      '0-1M': '0,1000000',
      '1M-10M': '1000000,10000000',
      '10M-100M': '10000000,100000000',
      '100M-1B': '100000000,1000000000',
      '1B+': '1000000000,',
    };
    return revenueMap[revenue] || revenue;
  }

  private async getIndustryTagIds(industry: string): Promise<string[]> {
    // In a real implementation, you would maintain a mapping of industry names to Apollo tag IDs
    // For now, return the industry name as-is (Apollo will do fuzzy matching)
    return [industry];
  }
}