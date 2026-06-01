import { BaseEnrichmentProvider, EnrichmentResult } from './enrichment-service';

export interface ZoomInfoSearchCriteria {
  // Company filters
  companyName?: string;
  website?: string;
  industry?: string;
  employeeCountMin?: number;
  employeeCountMax?: number;
  revenueMin?: number;
  revenueMax?: number;
  location?: string;
  zipCode?: string;
  techStack?: string[];

  // Contact filters
  firstName?: string;
  lastName?: string;
  jobTitle?: string;
  jobFunction?: string;
  managementLevel?: string;
  email?: string;
  companyId?: string;

  // Search parameters
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ZoomInfoCompanyResult {
  id: string;
  name: string;
  website: string;
  description?: string;
  industry: string;
  subIndustry?: string;
  employeeCount: number;
  revenue?: number;
  yearFounded?: number;
  headquarters?: {
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  phoneNumber?: string;
  technologies?: string[];
  socialMedia?: {
    linkedinUrl?: string;
    twitterHandle?: string;
    facebookUrl?: string;
  };
  stockTicker?: string;
  ownership?: string;
}

export interface ZoomInfoContactResult {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  emailAddress?: string;
  directPhoneNumber?: string;
  mobilePhoneNumber?: string;
  jobTitle: string;
  jobFunction: string;
  managementLevel: string;
  department?: string;
  companyId: string;
  companyName: string;
  linkedinUrl?: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  isActive: boolean;
  lastUpdated: string;
}

/**
 * ZoomInfo API integration for lead enrichment and prospecting
 * Provides comprehensive company and contact data with advanced search
 */
export class ZoomInfoProvider extends BaseEnrichmentProvider {
  private baseUrl = 'https://api.zoominfo.com';
  private apiKey: string;
  private accessToken?: string;
  private tokenExpiry?: Date;

  constructor(apiKey: string) {
    super();
    this.apiKey = apiKey;
  }

  async enrichCompany(domain: string): Promise<EnrichmentResult> {
    try {
      await this.ensureValidToken();

      const response = await this.makeRequest('/lookup/company', {
        website: domain,
      });

      if (!response.data || response.data.length === 0) {
        return {
          success: false,
          error: 'Company not found',
        };
      }

      const company = response.data[0];

      return {
        success: true,
        data: {
          name: company.name,
          domain: company.website || domain,
          description: company.description,
          industry: company.industry,
          subIndustry: company.subIndustry,
          employees: company.employeeCount,
          revenue: company.revenue,
          founded: company.yearFounded,
          location: this.formatCompanyLocation(company.headquarters),
          phoneNumber: company.phoneNumber,
          techStack: company.technologies || [],
          socialProfiles: {
            linkedin: company.socialMedia?.linkedinUrl,
            twitter: company.socialMedia?.twitterHandle ? `https://twitter.com/${company.socialMedia.twitterHandle}` : undefined,
            facebook: company.socialMedia?.facebookUrl,
          },
          stockTicker: company.stockTicker,
          ownership: company.ownership,
          source: 'zoominfo',
          lastUpdated: new Date().toISOString(),
        }
      };
    } catch (error) {
      console.error('ZoomInfo company enrichment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'ZoomInfo API error',
      };
    }
  }

  async enrichContact(email: string, domain?: string): Promise<EnrichmentResult> {
    try {
      await this.ensureValidToken();

      const searchParams: any = { emailAddress: email };
      if (domain) {
        searchParams.website = domain;
      }

      const response = await this.makeRequest('/lookup/person', searchParams);

      if (!response.data || response.data.length === 0) {
        return {
          success: false,
          error: 'Contact not found',
        };
      }

      const person = response.data[0];

      return {
        success: true,
        data: {
          firstName: person.firstName,
          lastName: person.lastName,
          email: person.emailAddress,
          jobTitle: person.jobTitle,
          company: person.companyName,
          department: person.department,
          managementLevel: person.managementLevel,
          jobFunction: person.jobFunction,
          phoneNumber: person.directPhoneNumber || person.mobilePhoneNumber,
          location: this.formatPersonLocation(person.location),
          linkedinUrl: person.linkedinUrl,
          isActive: person.isActive,
          source: 'zoominfo',
          lastUpdated: new Date().toISOString(),
        }
      };
    } catch (error) {
      console.error('ZoomInfo contact enrichment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'ZoomInfo API error',
      };
    }
  }

  async searchCompanies(criteria: ZoomInfoSearchCriteria): Promise<{ success: boolean; data?: ZoomInfoCompanyResult[]; error?: string; total?: number }> {
    try {
      await this.ensureValidToken();

      const searchParams: any = {
        limit: criteria.limit || 25,
        offset: criteria.offset || 0,
      };

      // Company filters
      if (criteria.companyName) {
        searchParams.companyName = criteria.companyName;
      }
      if (criteria.website) {
        searchParams.website = criteria.website;
      }
      if (criteria.industry) {
        searchParams.industry = criteria.industry;
      }
      if (criteria.employeeCountMin) {
        searchParams.employeeCountMin = criteria.employeeCountMin;
      }
      if (criteria.employeeCountMax) {
        searchParams.employeeCountMax = criteria.employeeCountMax;
      }
      if (criteria.revenueMin) {
        searchParams.revenueMin = criteria.revenueMin;
      }
      if (criteria.revenueMax) {
        searchParams.revenueMax = criteria.revenueMax;
      }
      if (criteria.location) {
        searchParams.location = criteria.location;
      }
      if (criteria.zipCode) {
        searchParams.zipCode = criteria.zipCode;
      }
      if (criteria.techStack?.length) {
        searchParams.technologies = criteria.techStack.join(',');
      }

      // Sorting
      if (criteria.sortBy) {
        searchParams.sortBy = criteria.sortBy;
        searchParams.sortOrder = criteria.sortOrder || 'asc';
      }

      const response = await this.makeRequest('/search/company', searchParams);

      const companies: ZoomInfoCompanyResult[] = response.data?.map((company: any) => ({
        id: company.id,
        name: company.name,
        website: company.website,
        description: company.description,
        industry: company.industry,
        subIndustry: company.subIndustry,
        employeeCount: company.employeeCount,
        revenue: company.revenue,
        yearFounded: company.yearFounded,
        headquarters: company.headquarters,
        phoneNumber: company.phoneNumber,
        technologies: company.technologies || [],
        socialMedia: company.socialMedia,
        stockTicker: company.stockTicker,
        ownership: company.ownership,
      })) || [];

      return {
        success: true,
        data: companies,
        total: response.totalResults || companies.length,
      };

    } catch (error) {
      console.error('ZoomInfo company search error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'ZoomInfo API error',
      };
    }
  }

  async searchContacts(criteria: ZoomInfoSearchCriteria): Promise<{ success: boolean; data?: ZoomInfoContactResult[]; error?: string; total?: number }> {
    try {
      await this.ensureValidToken();

      const searchParams: any = {
        limit: criteria.limit || 25,
        offset: criteria.offset || 0,
      };

      // Contact filters
      if (criteria.firstName) {
        searchParams.firstName = criteria.firstName;
      }
      if (criteria.lastName) {
        searchParams.lastName = criteria.lastName;
      }
      if (criteria.jobTitle) {
        searchParams.jobTitle = criteria.jobTitle;
      }
      if (criteria.jobFunction) {
        searchParams.jobFunction = criteria.jobFunction;
      }
      if (criteria.managementLevel) {
        searchParams.managementLevel = criteria.managementLevel;
      }
      if (criteria.email) {
        searchParams.emailAddress = criteria.email;
      }

      // Company filters for contacts
      if (criteria.companyName) {
        searchParams.companyName = criteria.companyName;
      }
      if (criteria.companyId) {
        searchParams.companyId = criteria.companyId;
      }
      if (criteria.website) {
        searchParams.website = criteria.website;
      }
      if (criteria.industry) {
        searchParams.industry = criteria.industry;
      }
      if (criteria.location) {
        searchParams.location = criteria.location;
      }

      // Sorting
      if (criteria.sortBy) {
        searchParams.sortBy = criteria.sortBy;
        searchParams.sortOrder = criteria.sortOrder || 'asc';
      }

      const response = await this.makeRequest('/search/person', searchParams);

      const contacts: ZoomInfoContactResult[] = response.data?.map((person: any) => ({
        id: person.id,
        firstName: person.firstName,
        lastName: person.lastName,
        middleName: person.middleName,
        emailAddress: person.emailAddress,
        directPhoneNumber: person.directPhoneNumber,
        mobilePhoneNumber: person.mobilePhoneNumber,
        jobTitle: person.jobTitle,
        jobFunction: person.jobFunction,
        managementLevel: person.managementLevel,
        department: person.department,
        companyId: person.companyId,
        companyName: person.companyName,
        linkedinUrl: person.linkedinUrl,
        location: person.location,
        isActive: person.isActive,
        lastUpdated: person.lastUpdated,
      })) || [];

      return {
        success: true,
        data: contacts,
        total: response.totalResults || contacts.length,
      };

    } catch (error) {
      console.error('ZoomInfo contact search error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'ZoomInfo API error',
      };
    }
  }

  async verifyConfiguration(): Promise<boolean> {
    try {
      await this.ensureValidToken();
      return !!this.accessToken;
    } catch (error) {
      console.error('ZoomInfo configuration verification failed:', error);
      return false;
    }
  }

  private async ensureValidToken(): Promise<void> {
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return; // Token is still valid
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: this.apiKey, // ZoomInfo uses username/password or API key
          password: process.env.ZOOMINFO_API_SECRET, // Secret key for authentication
        }),
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.status} ${response.statusText}`);
      }

      const authData = await response.json();
      this.accessToken = authData.access_token;

      // Set expiry to 1 hour from now (ZoomInfo tokens typically expire in 1 hour)
      this.tokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

    } catch (error) {
      console.error('ZoomInfo authentication error:', error);
      throw new Error('Failed to authenticate with ZoomInfo API');
    }
  }

  private async makeRequest(endpoint: string, params?: any): Promise<any> {
    if (!this.accessToken) {
      throw new Error('No valid access token available');
    }

    const url = `${this.baseUrl}${endpoint}`;
    const options: RequestInit = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    };

    // Add query parameters for GET requests
    if (params && Object.keys(params).length > 0) {
      const queryString = new URLSearchParams(params).toString();
      const finalUrl = `${url}?${queryString}`;

      const response = await fetch(finalUrl, options);

      if (!response.ok) {
        // Handle token expiry
        if (response.status === 401) {
          this.accessToken = undefined;
          this.tokenExpiry = undefined;
          throw new Error('Access token expired');
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `ZoomInfo API error: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } else {
      const response = await fetch(url, options);

      if (!response.ok) {
        if (response.status === 401) {
          this.accessToken = undefined;
          this.tokenExpiry = undefined;
          throw new Error('Access token expired');
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `ZoomInfo API error: ${response.status} ${response.statusText}`);
      }

      return response.json();
    }
  }

  private formatCompanyLocation(headquarters: any): string {
    if (!headquarters) return '';

    const parts = [];
    if (headquarters.city) parts.push(headquarters.city);
    if (headquarters.state) parts.push(headquarters.state);
    if (headquarters.country) parts.push(headquarters.country);
    return parts.join(', ');
  }

  private formatPersonLocation(location: any): string {
    if (!location) return '';

    const parts = [];
    if (location.city) parts.push(location.city);
    if (location.state) parts.push(location.state);
    if (location.country) parts.push(location.country);
    return parts.join(', ');
  }
}