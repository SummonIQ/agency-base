import { ProspectCompany, ProspectContact } from './types';
import { DataValidator, ValidationResult } from './data-validator';
import { BooleanSearchEngine, BooleanSearchQuery } from './boolean-search';
import { IntentDataService, IntentProfile, WarmProspectAlert } from './intent-data';

export interface EnrichmentResult {
  success: boolean;
  data?: any;
  error?: string;
  source?: string;
  validation?: ValidationResult;
  confidence?: number;
}

export interface CompanyEnrichmentData {
  // Basic info
  name: string;
  domain: string;
  industry: string;
  description?: string;

  // Size & financials
  employees?: number;
  employeeRange?: string;
  annualRevenue?: string;
  fundingTotal?: string;
  lastFundingRound?: string;
  lastFundingDate?: string;

  // Location
  headquarters?: string;
  locations?: string[];

  // Technology
  techStack?: string[];
  integrations?: string[];

  // Social & web presence
  website?: string;
  linkedinUrl?: string;
  twitterHandle?: string;
  crunchbaseUrl?: string;

  // Recent activity
  recentNews?: Array<{
    title: string;
    url: string;
    date: string;
    source: string;
  }>;

  // Contact information
  phoneNumbers?: string[];
  emailPatterns?: string[];

  // Competitive intelligence
  competitors?: string[];
  similarCompanies?: string[];
}

export interface ContactEnrichmentData {
  // Basic info
  firstName: string;
  lastName: string;
  fullName: string;

  // Professional
  jobTitle: string;
  department: string;
  seniority: 'entry' | 'mid' | 'senior' | 'executive' | 'c-level';

  // Contact details
  email?: string;
  personalEmail?: string;
  phoneNumber?: string;

  // Social profiles
  linkedinUrl?: string;
  twitterHandle?: string;
  githubUsername?: string;

  // Professional background
  previousCompanies?: Array<{
    company: string;
    role: string;
    duration: string;
  }>;

  // Education
  education?: Array<{
    school: string;
    degree?: string;
    field?: string;
    year?: string;
  }>;

  // Additional context
  interests?: string[];
  skills?: string[];
  certifications?: string[];
}

// Abstract base class for enrichment providers
export abstract class BaseEnrichmentProvider {
  protected apiKey: string;
  protected baseUrl: string;
  protected rateLimitDelay: number;

  constructor(apiKey: string, baseUrl: string, rateLimitDelay = 1000) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.rateLimitDelay = rateLimitDelay;
  }

  abstract enrichCompany(domain: string): Promise<EnrichmentResult>;
  abstract enrichContact(email: string, domain?: string): Promise<EnrichmentResult>;
  abstract findContacts(domain: string, filters?: any): Promise<EnrichmentResult>;

  protected async makeRequest(url: string, options: RequestInit = {}): Promise<any> {
    // Add rate limiting
    await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay));

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Clearbit implementation (company enrichment)
export class ClearbitProvider extends BaseEnrichmentProvider {
  constructor(apiKey: string) {
    super(apiKey, 'https://person.clearbit.com', 2000);
  }

  async enrichCompany(domain: string): Promise<EnrichmentResult> {
    try {
      const data = await this.makeRequest(`${this.baseUrl}/v2/companies/find?domain=${domain}`);

      const enrichedData: CompanyEnrichmentData = {
        name: data.name,
        domain: data.domain,
        industry: data.category?.industry || 'Unknown',
        description: data.description,
        employees: data.metrics?.employees,
        employeeRange: data.metrics?.employeesRange,
        annualRevenue: data.metrics?.annualRevenue,
        fundingTotal: data.metrics?.raised,
        headquarters: data.geo?.city && data.geo?.state
          ? `${data.geo.city}, ${data.geo.state}`
          : undefined,
        website: data.domain,
        linkedinUrl: data.linkedin?.handle
          ? `https://linkedin.com/company/${data.linkedin.handle}`
          : undefined,
        twitterHandle: data.twitter?.handle,
        techStack: data.tech || [],
        phoneNumbers: data.phone ? [data.phone] : [],
      };

      return {
        success: true,
        data: enrichedData,
        source: 'Clearbit'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'Clearbit'
      };
    }
  }

  async enrichContact(email: string): Promise<EnrichmentResult> {
    try {
      const data = await this.makeRequest(`${this.baseUrl}/v2/people/find?email=${email}`);

      const enrichedData: ContactEnrichmentData = {
        firstName: data.name?.givenName || '',
        lastName: data.name?.familyName || '',
        fullName: data.name?.fullName || '',
        jobTitle: data.employment?.title || '',
        department: data.employment?.role || '',
        seniority: this.mapSeniority(data.employment?.seniority),
        email: data.email,
        linkedinUrl: data.linkedin?.handle
          ? `https://linkedin.com/in/${data.linkedin.handle}`
          : undefined,
        twitterHandle: data.twitter?.handle,
        githubUsername: data.github?.handle,
      };

      return {
        success: true,
        data: enrichedData,
        source: 'Clearbit'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'Clearbit'
      };
    }
  }

  async findContacts(domain: string): Promise<EnrichmentResult> {
    // Clearbit doesn't have a contact discovery endpoint in the free tier
    return {
      success: false,
      error: 'Contact discovery not supported with Clearbit',
      source: 'Clearbit'
    };
  }

  private mapSeniority(seniority?: string): 'entry' | 'mid' | 'senior' | 'executive' | 'c-level' {
    if (!seniority) return 'mid';

    const level = seniority.toLowerCase();
    if (level.includes('c-level') || level.includes('ceo') || level.includes('cto') || level.includes('cfo')) {
      return 'c-level';
    }
    if (level.includes('vp') || level.includes('director') || level.includes('head')) {
      return 'executive';
    }
    if (level.includes('senior') || level.includes('sr') || level.includes('lead')) {
      return 'senior';
    }
    if (level.includes('junior') || level.includes('jr') || level.includes('entry')) {
      return 'entry';
    }
    return 'mid';
  }
}

// Hunter.io implementation (email finder)
export class HunterProvider extends BaseEnrichmentProvider {
  constructor(apiKey: string) {
    super(apiKey, 'https://api.hunter.io', 1000);
  }

  async enrichCompany(domain: string): Promise<EnrichmentResult> {
    try {
      const data = await this.makeRequest(`${this.baseUrl}/v2/domain-search?domain=${domain}&api_key=${this.apiKey}`);

      const enrichedData: Partial<CompanyEnrichmentData> = {
        domain,
        emailPatterns: data.data?.pattern ? [data.data.pattern] : [],
        // Hunter provides limited company data
      };

      return {
        success: true,
        data: enrichedData,
        source: 'Hunter.io'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'Hunter.io'
      };
    }
  }

  async enrichContact(email: string): Promise<EnrichmentResult> {
    try {
      const data = await this.makeRequest(`${this.baseUrl}/v2/email-verifier?email=${email}&api_key=${this.apiKey}`);

      return {
        success: true,
        data: {
          email,
          verified: data.data?.result === 'deliverable',
          confidence: data.data?.score || 0
        },
        source: 'Hunter.io'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'Hunter.io'
      };
    }
  }

  async findContacts(domain: string, filters: { department?: string; seniority?: string } = {}): Promise<EnrichmentResult> {
    try {
      let url = `${this.baseUrl}/v2/domain-search?domain=${domain}&api_key=${this.apiKey}&limit=100`;

      if (filters.department) {
        url += `&department=${filters.department}`;
      }
      if (filters.seniority) {
        url += `&seniority=${filters.seniority}`;
      }

      const data = await this.makeRequest(url);

      const contacts = (data.data?.emails || []).map((email: any) => ({
        firstName: email.first_name,
        lastName: email.last_name,
        fullName: `${email.first_name} ${email.last_name}`,
        email: email.value,
        jobTitle: email.position || '',
        department: email.department || '',
        seniority: this.mapSeniority(email.seniority),
        linkedinUrl: email.linkedin,
        twitterHandle: email.twitter,
        verified: email.confidence > 75
      }));

      return {
        success: true,
        data: { contacts, total: data.data?.total || 0 },
        source: 'Hunter.io'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'Hunter.io'
      };
    }
  }

  private mapSeniority(seniority?: string): 'entry' | 'mid' | 'senior' | 'executive' | 'c-level' {
    if (!seniority) return 'mid';
    return seniority as any; // Hunter.io uses our enum values
  }
}

// Mock provider for development
export class MockEnrichmentProvider extends BaseEnrichmentProvider {
  constructor() {
    super('mock-key', 'mock-url', 100);
  }

  async enrichCompany(domain: string): Promise<EnrichmentResult> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const mockData: CompanyEnrichmentData = {
      name: this.generateCompanyName(domain),
      domain,
      industry: this.randomChoice(['Software', 'E-commerce', 'Fintech', 'Healthcare', 'Education']),
      description: `${this.generateCompanyName(domain)} is a growing company focused on innovative solutions.`,
      employees: this.randomNumber(10, 500),
      employeeRange: '50-200',
      annualRevenue: '$2M-$10M',
      headquarters: this.randomChoice(['San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA']),
      techStack: this.randomChoice([
        ['React', 'Node.js', 'PostgreSQL'],
        ['Vue.js', 'Python', 'MongoDB'],
        ['Angular', 'Java', 'MySQL'],
        ['React', 'Go', 'Redis']
      ]),
      linkedinUrl: `https://linkedin.com/company/${domain.split('.')[0]}`,
      phoneNumbers: [`+1-555-${this.randomNumber(100, 999)}-${this.randomNumber(1000, 9999)}`],
      recentNews: [
        {
          title: `${this.generateCompanyName(domain)} Raises Series A Funding`,
          url: `https://techcrunch.com/${domain.split('.')[0]}-funding`,
          date: '2024-01-15',
          source: 'TechCrunch'
        }
      ]
    };

    return {
      success: Math.random() > 0.1, // 90% success rate
      data: mockData,
      source: 'Mock'
    };
  }

  async enrichContact(email: string): Promise<EnrichmentResult> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const firstName = this.randomChoice(['John', 'Jane', 'Mike', 'Sarah', 'David', 'Emily']);
    const lastName = this.randomChoice(['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia']);

    const mockData: ContactEnrichmentData = {
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      jobTitle: this.randomChoice(['VP of Engineering', 'Head of Product', 'CTO', 'Engineering Manager', 'Product Manager']),
      department: this.randomChoice(['Engineering', 'Product', 'Marketing', 'Sales']),
      seniority: this.randomChoice(['senior', 'executive', 'c-level']),
      email,
      linkedinUrl: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
      previousCompanies: [
        {
          company: 'Previous Corp',
          role: 'Senior Developer',
          duration: '2 years'
        }
      ],
      education: [
        {
          school: this.randomChoice(['Stanford', 'MIT', 'Berkeley', 'Carnegie Mellon']),
          degree: 'BS',
          field: 'Computer Science',
          year: '2015'
        }
      ],
      skills: this.randomChoice([
        ['JavaScript', 'React', 'Node.js'],
        ['Python', 'Django', 'PostgreSQL'],
        ['Java', 'Spring', 'Microservices']
      ])
    };

    return {
      success: Math.random() > 0.15, // 85% success rate
      data: mockData,
      source: 'Mock'
    };
  }

  async findContacts(domain: string): Promise<EnrichmentResult> {
    await new Promise(resolve => setTimeout(resolve, 800));

    const contacts = Array.from({length: this.randomNumber(3, 8)}, (_, i) => {
      const firstName = this.randomChoice(['John', 'Jane', 'Mike', 'Sarah', 'David', 'Emily']);
      const lastName = this.randomChoice(['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia']);

      return {
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
        jobTitle: this.randomChoice(['VP of Engineering', 'Head of Product', 'CTO', 'Engineering Manager']),
        department: this.randomChoice(['Engineering', 'Product', 'Marketing']),
        seniority: this.randomChoice(['senior', 'executive', 'c-level']),
        verified: Math.random() > 0.2 // 80% verified rate
      };
    });

    return {
      success: true,
      data: { contacts, total: contacts.length },
      source: 'Mock'
    };
  }

  private randomChoice<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private randomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private generateCompanyName(domain: string): string {
    const name = domain.split('.')[0];
    return name.charAt(0).toUpperCase() + name.slice(1) + ' ' +
           this.randomChoice(['Inc', 'Corp', 'LLC', 'Technologies', 'Solutions', 'Systems']);
  }
}

// Import real providers
import { ApolloProvider } from './apollo-provider';
import { ZoomInfoProvider } from './zoominfo-provider';

// Main enrichment service
export class EnrichmentService {
  private providers: BaseEnrichmentProvider[] = [];
  private apolloProvider?: ApolloProvider;
  private zoomInfoProvider?: ZoomInfoProvider;
  private dataValidator: DataValidator;
  private booleanSearch: BooleanSearchEngine;
  private intentData: IntentDataService;

  constructor() {
    // Initialize services
    this.dataValidator = new DataValidator();
    this.booleanSearch = new BooleanSearchEngine();
    this.intentData = new IntentDataService();

    // Initialize real API providers if keys are available
    const apolloKey = process.env.APOLLO_API_KEY;
    const zoomInfoKey = process.env.ZOOMINFO_API_KEY;
    const clearbitKey = process.env.CLEARBIT_API_KEY;
    const hunterKey = process.env.HUNTER_API_KEY;

    // Add real providers first (highest priority)
    if (apolloKey) {
      this.apolloProvider = new ApolloProvider(apolloKey);
      this.providers.push(this.apolloProvider);
    }

    if (zoomInfoKey) {
      this.zoomInfoProvider = new ZoomInfoProvider(zoomInfoKey);
      this.providers.push(this.zoomInfoProvider);
    }

    if (clearbitKey) {
      this.providers.push(new ClearbitProvider(clearbitKey));
    }

    if (hunterKey) {
      this.providers.push(new HunterProvider(hunterKey));
    }

    // Always add mock provider as fallback
    this.providers.push(new MockEnrichmentProvider());
  }

  async enrichCompany(domain: string): Promise<EnrichmentResult> {
    try {
      const results = await Promise.allSettled(
        this.providers.map(provider => provider.enrichCompany(domain))
      );

      // Get all successful results for cross-validation
      const successfulResults = results
        .filter((result): result is PromiseFulfilledResult<EnrichmentResult> =>
          result.status === 'fulfilled' && result.value.success
        )
        .map(result => result.value);

      if (successfulResults.length === 0) {
        return {
          success: false,
          error: 'No providers returned valid data for this domain'
        };
      }

      // Merge company data from all sources
      const mergedData = this.mergeCompanyData(results);

      // Validate the merged data
      const validation = await this.dataValidator.validateCompanyData(mergedData);

      // Cross-validate against multiple sources if available
      const crossValidation = successfulResults.length > 1
        ? await this.dataValidator.crossValidate(successfulResults)
        : null;

      // Calculate overall confidence based on validation results
      const confidence = crossValidation?.confidence || validation.confidence;

      return {
        success: validation.isValid,
        data: mergedData,
        validation,
        confidence,
        source: successfulResults.map(r => r.source).filter(Boolean).join(', ') || 'Multiple sources'
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during company enrichment'
      };
    }
  }

  async enrichContact(email: string, domain?: string): Promise<EnrichmentResult> {
    try {
      const results = await Promise.allSettled(
        this.providers.map(provider => provider.enrichContact(email, domain))
      );

      // Get all successful results for cross-validation
      const successfulResults = results
        .filter((result): result is PromiseFulfilledResult<EnrichmentResult> =>
          result.status === 'fulfilled' && result.value.success
        )
        .map(result => result.value);

      if (successfulResults.length === 0) {
        return {
          success: false,
          error: 'No providers returned valid data for this contact'
        };
      }

      // Merge contact data from all sources
      const mergedData = this.mergeContactData(results);

      if (!mergedData) {
        return {
          success: false,
          error: 'Unable to merge contact data from available sources'
        };
      }

      // Validate the merged data
      const validation = await this.dataValidator.validateContactData(mergedData);

      // Cross-validate against multiple sources if available
      const crossValidation = successfulResults.length > 1
        ? await this.dataValidator.crossValidate(successfulResults)
        : null;

      // Calculate overall confidence based on validation results
      const confidence = crossValidation?.confidence || validation.confidence;

      return {
        success: validation.isValid,
        data: mergedData,
        validation,
        confidence,
        source: successfulResults.map(r => r.source).filter(Boolean).join(', ') || 'Multiple sources'
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during contact enrichment'
      };
    }
  }

  async findContacts(domain: string, filters?: any): Promise<ContactEnrichmentData[]> {
    const results = await Promise.allSettled(
      this.providers.map(provider => provider.findContacts(domain, filters))
    );

    const contacts: ContactEnrichmentData[] = [];

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value.success && result.value.data?.contacts) {
        contacts.push(...result.value.data.contacts);
      }
    }

    // Deduplicate by email
    const uniqueContacts = contacts.filter((contact, index, self) =>
      index === self.findIndex(c => c.email === contact.email)
    );

    return uniqueContacts;
  }

  private mergeCompanyData(results: PromiseSettledResult<EnrichmentResult>[]): CompanyEnrichmentData {
    const merged: Partial<CompanyEnrichmentData> = {};

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value.success) {
        const data = result.value.data as CompanyEnrichmentData;

        // Merge non-null values, preferring more complete data
        Object.keys(data).forEach(key => {
          const value = (data as any)[key];
          if (value && (!merged[key as keyof CompanyEnrichmentData] ||
              (Array.isArray(value) && value.length > 0))) {
            (merged as any)[key] = value;
          }
        });
      }
    }

    return merged as CompanyEnrichmentData;
  }

  private mergeContactData(results: PromiseSettledResult<EnrichmentResult>[]): ContactEnrichmentData | null {
    const merged: Partial<ContactEnrichmentData> = {};

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value.success) {
        const data = result.value.data as ContactEnrichmentData;

        // Merge non-null values
        Object.keys(data).forEach(key => {
          const value = (data as any)[key];
          if (value && !merged[key as keyof ContactEnrichmentData]) {
            (merged as any)[key] = value;
          }
        });
      }
    }

    return Object.keys(merged).length > 0 ? merged as ContactEnrichmentData : null;
  }

  // Enhanced search capabilities using Apollo.io and ZoomInfo
  async searchCompanies(criteria: {
    name?: string;
    domain?: string;
    industry?: string;
    size?: string;
    location?: string;
    techStack?: string[];
    revenue?: string;
    limit?: number;
  }) {
    // Try Apollo first if available
    if (this.apolloProvider) {
      const apolloResult = await this.apolloProvider.searchCompanies({
        companyName: criteria.name,
        domain: criteria.domain,
        industry: criteria.industry,
        companySize: criteria.size,
        location: criteria.location,
        techStack: criteria.techStack,
        revenue: criteria.revenue,
        limit: criteria.limit,
      });

      if (apolloResult.success) {
        return apolloResult;
      }
    }

    // Fallback to ZoomInfo if Apollo fails
    if (this.zoomInfoProvider) {
      const zoomInfoResult = await this.zoomInfoProvider.searchCompanies({
        companyName: criteria.name,
        website: criteria.domain,
        industry: criteria.industry,
        employeeCountMin: this.parseEmployeeMin(criteria.size),
        employeeCountMax: this.parseEmployeeMax(criteria.size),
        location: criteria.location,
        techStack: criteria.techStack,
        revenueMin: this.parseRevenueMin(criteria.revenue),
        revenueMax: this.parseRevenueMax(criteria.revenue),
        limit: criteria.limit,
      });

      if (zoomInfoResult.success) {
        return zoomInfoResult;
      }
    }

    // Fallback to mock data for development
    return {
      success: false,
      error: 'No real API providers configured - add APOLLO_API_KEY or ZOOMINFO_API_KEY to environment',
    };
  }

  async searchContacts(criteria: {
    firstName?: string;
    lastName?: string;
    jobTitle?: string;
    department?: string;
    companyName?: string;
    domain?: string;
    industry?: string;
    location?: string;
    limit?: number;
  }) {
    // Try Apollo first if available
    if (this.apolloProvider) {
      const apolloResult = await this.apolloProvider.searchContacts({
        personName: criteria.firstName ? `${criteria.firstName} ${criteria.lastName || ''}`.trim() : undefined,
        jobTitle: criteria.jobTitle,
        department: criteria.department,
        companyName: criteria.companyName,
        domain: criteria.domain,
        industry: criteria.industry,
        location: criteria.location,
        limit: criteria.limit,
        includeEmails: true,
      });

      if (apolloResult.success) {
        return apolloResult;
      }
    }

    // Fallback to ZoomInfo if Apollo fails
    if (this.zoomInfoProvider) {
      const zoomInfoResult = await this.zoomInfoProvider.searchContacts({
        firstName: criteria.firstName,
        lastName: criteria.lastName,
        jobTitle: criteria.jobTitle,
        companyName: criteria.companyName,
        website: criteria.domain,
        industry: criteria.industry,
        location: criteria.location,
        limit: criteria.limit,
      });

      if (zoomInfoResult.success) {
        return zoomInfoResult;
      }
    }

    // Fallback to mock data for development
    return {
      success: false,
      error: 'No real API providers configured - add APOLLO_API_KEY or ZOOMINFO_API_KEY to environment',
    };
  }

  // Verify that at least one real provider is configured
  async verifyConfiguration(): Promise<boolean> {
    const apollo = this.apolloProvider ? await this.apolloProvider.verifyConfiguration() : false;
    const zoomInfo = this.zoomInfoProvider ? await this.zoomInfoProvider.verifyConfiguration() : false;

    return apollo || zoomInfo;
  }

  // Get status of all providers
  getProviderStatus(): { apollo: boolean; zoominfo: boolean; mock: boolean } {
    return {
      apollo: !!this.apolloProvider,
      zoominfo: !!this.zoomInfoProvider,
      mock: true // Mock provider is always available as fallback
    };
  }

  /**
   * Boolean search for advanced prospect targeting
   * Supports LinkedIn-style boolean operators
   */
  async booleanSearchProspects(searchQuery: string, options: {
    limit?: number;
    offset?: number;
    includeCompanies?: boolean;
    includeContacts?: boolean;
  } = {}): Promise<{
    success: boolean;
    data?: {
      query: BooleanSearchQuery;
      companies?: any[];
      contacts?: any[];
      totalCompanies?: number;
      totalContacts?: number;
    };
    error?: string;
  }> {
    try {
      // Parse the boolean search query
      const parsedQuery = this.booleanSearch.parseQuery(searchQuery);
      const searchCriteria = this.booleanSearch.buildSearchCriteria(parsedQuery);

      const results: any = {
        query: parsedQuery,
        companies: [],
        contacts: [],
        totalCompanies: 0,
        totalContacts: 0
      };

      // Search for companies if requested
      if (options.includeCompanies !== false) {
        try {
          // Try Apollo first
          if (this.apolloProvider) {
            const apolloCompanies = await this.apolloProvider.searchCompanies({
              ...searchCriteria.apollo,
              limit: options.limit || 25,
              offset: options.offset || 0
            });

            if (apolloCompanies.success && apolloCompanies.data) {
              results.companies = apolloCompanies.data;
              results.totalCompanies = apolloCompanies.total || 0;
            }
          }

          // Fallback to ZoomInfo if Apollo didn't work
          if (results.companies.length === 0 && this.zoomInfoProvider) {
            const zoomInfoCompanies = await this.zoomInfoProvider.searchCompanies({
              ...searchCriteria.zoominfo,
              limit: options.limit || 25,
              offset: options.offset || 0
            });

            if (zoomInfoCompanies.success && zoomInfoCompanies.data) {
              results.companies = zoomInfoCompanies.data;
              results.totalCompanies = zoomInfoCompanies.total || 0;
            }
          }
        } catch (error) {
          console.error('Company search error:', error);
        }
      }

      // Search for contacts if requested
      if (options.includeContacts !== false) {
        try {
          // Try Apollo first
          if (this.apolloProvider) {
            const apolloContacts = await this.apolloProvider.searchContacts({
              ...searchCriteria.apollo,
              limit: options.limit || 25,
              offset: options.offset || 0,
              includeEmails: true
            });

            if (apolloContacts.success && apolloContacts.data) {
              results.contacts = apolloContacts.data;
              results.totalContacts = apolloContacts.total || 0;
            }
          }

          // Fallback to ZoomInfo if Apollo didn't work
          if (results.contacts.length === 0 && this.zoomInfoProvider) {
            const zoomInfoContacts = await this.zoomInfoProvider.searchContacts({
              ...searchCriteria.zoominfo,
              limit: options.limit || 25,
              offset: options.offset || 0
            });

            if (zoomInfoContacts.success && zoomInfoContacts.data) {
              results.contacts = zoomInfoContacts.data;
              results.totalContacts = zoomInfoContacts.total || 0;
            }
          }
        } catch (error) {
          console.error('Contact search error:', error);
        }
      }

      return {
        success: true,
        data: results
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Boolean search failed'
      };
    }
  }

  /**
   * Validate boolean search query syntax
   */
  validateBooleanQuery(searchQuery: string): {
    isValid: boolean;
    suggestions?: string[];
    errors?: string[];
  } {
    try {
      const parsed = this.booleanSearch.parseQuery(searchQuery);
      const errors: string[] = [];
      const suggestions: string[] = [];

      // Check for common issues
      if (!parsed.parsed.AND.length && !parsed.parsed.OR.length && !parsed.parsed.QUOTED.length) {
        errors.push('Query appears to be empty or contains only negations');
        suggestions.push('Add positive search terms using AND or OR operators');
      }

      if (parsed.parsed.NOT.length > parsed.parsed.AND.length + parsed.parsed.OR.length + parsed.parsed.QUOTED.length) {
        suggestions.push('Consider adding more positive terms to balance the exclusions');
      }

      // Check for target extraction
      const hasTargets = Object.keys(parsed.targets).some(key =>
        parsed.targets[key as keyof typeof parsed.targets]
      );

      if (!hasTargets) {
        suggestions.push('Consider adding specific job titles, companies, or skills for better targeting');
      }

      // Suggest improvements
      if (parsed.parsed.OR.length === 0 && parsed.parsed.AND.length > 1) {
        suggestions.push('Consider using OR operators to broaden your search');
      }

      if (parsed.parsed.QUOTED.length === 0) {
        suggestions.push('Use quoted phrases for exact job titles or company names');
      }

      return {
        isValid: errors.length === 0,
        errors: errors.length > 0 ? errors : undefined,
        suggestions: suggestions.length > 0 ? suggestions : undefined
      };

    } catch (error) {
      return {
        isValid: false,
        errors: ['Invalid query syntax'],
        suggestions: ['Check for balanced parentheses and proper operator usage']
      };
    }
  }

  /**
   * Get intent data profile for a company
   */
  async getIntentProfile(domain: string): Promise<IntentProfile | null> {
    return await this.intentData.getIntentProfile(domain);
  }

  /**
   * Find warm prospects based on intent signals
   */
  async findWarmProspects(filters: {
    minScore?: number;
    buyingStage?: string[];
    urgency?: string[];
    industries?: string[];
    companySize?: string;
    limit?: number;
  } = {}): Promise<IntentProfile[]> {
    return await this.intentData.findWarmProspects(filters);
  }

  /**
   * Get real-time alerts for warm prospects
   */
  async getWarmProspectAlerts(filters: {
    priority?: string[];
    alertType?: string[];
    since?: string;
    limit?: number;
  } = {}): Promise<WarmProspectAlert[]> {
    return await this.intentData.getWarmProspectAlerts(filters);
  }

  /**
   * Analyze intent for company with context
   */
  async analyzeCompanyIntent(domain: string, context: {
    yourSolution?: string;
    targetPersonas?: string[];
    competitors?: string[];
  } = {}): Promise<{
    score: number;
    insights: string[];
    nextBestActions: string[];
    timing: string;
    personalization: string[];
  }> {
    return await this.intentData.analyzeCompanyIntent(domain, context);
  }

  /**
   * Enhanced enrichment with intent data
   */
  async enrichWithIntent(domain: string): Promise<{
    enrichment: EnrichmentResult;
    intent: IntentProfile | null;
    recommendations: {
      priority: number;
      approach: string;
      timing: string;
      messaging: string[];
      confidence: number;
    };
  }> {
    try {
      // Run enrichment and intent analysis in parallel
      const [enrichment, intentProfile] = await Promise.all([
        this.enrichCompany(domain),
        this.getIntentProfile(domain)
      ]);

      // Generate combined recommendations
      const recommendations = this.generateCombinedRecommendations(enrichment, intentProfile);

      return {
        enrichment,
        intent: intentProfile,
        recommendations
      };

    } catch (error) {
      return {
        enrichment: {
          success: false,
          error: error instanceof Error ? error.message : 'Enrichment with intent failed'
        },
        intent: null,
        recommendations: {
          priority: 1,
          approach: 'nurture',
          timing: 'future',
          messaging: [],
          confidence: 0
        }
      };
    }
  }

  /**
   * Generate combined recommendations from enrichment and intent data
   */
  private generateCombinedRecommendations(
    enrichment: EnrichmentResult,
    intentProfile: IntentProfile | null
  ): {
    priority: number;
    approach: string;
    timing: string;
    messaging: string[];
    confidence: number;
  } {
    let priority = 3; // Base priority
    let approach = 'content_marketing';
    let timing = 'within_month';
    let messaging: string[] = [];
    let confidence = 0.5;

    // Boost priority and confidence based on enrichment quality
    if (enrichment.success && enrichment.validation?.confidence) {
      confidence = Math.max(confidence, enrichment.validation.confidence);
      if (enrichment.validation.confidence > 0.8) {
        priority += 1;
      }
    }

    // Adjust based on intent data
    if (intentProfile) {
      priority = Math.max(priority, intentProfile.recommendations.priority);
      approach = intentProfile.recommendations.approach;
      timing = intentProfile.recommendations.timing;
      messaging = intentProfile.recommendations.messaging;

      // Higher intent score means higher confidence
      confidence = Math.max(confidence, intentProfile.overallScore / 100);

      // Hot prospects get immediate priority
      if (intentProfile.categories.engagement_level === 'red_hot') {
        priority = Math.min(10, priority + 3);
        timing = 'immediate';
      } else if (intentProfile.categories.engagement_level === 'hot') {
        priority = Math.min(10, priority + 2);
        timing = 'within_week';
      }
    }

    // Add enrichment-based messaging
    if (enrichment.success && enrichment.data) {
      if (enrichment.data.techStack?.length > 0) {
        messaging.push(`Leverage their ${enrichment.data.techStack.slice(0, 2).join(' and ')} tech stack`);
      }

      if (enrichment.data.employees) {
        const sizeCategory = enrichment.data.employees < 50 ? 'small' :
                           enrichment.data.employees < 200 ? 'medium' : 'large';
        messaging.push(`Tailor pitch for ${sizeCategory} company dynamics`);
      }
    }

    return {
      priority: Math.min(10, priority),
      approach,
      timing,
      messaging,
      confidence: Math.min(1, confidence)
    };
  }

  private parseEmployeeMin(size?: string): number | undefined {
    if (!size) return undefined;
    const match = size.match(/(\d+)/);
    return match ? parseInt(match[1]) : undefined;
  }

  private parseEmployeeMax(size?: string): number | undefined {
    if (!size) return undefined;
    if (size.includes('+')) return undefined; // No upper limit
    const match = size.match(/-(\d+)/);
    return match ? parseInt(match[1]) : undefined;
  }

  private parseRevenueMin(revenue?: string): number | undefined {
    if (!revenue) return undefined;
    const match = revenue.match(/(\d+)/);
    return match ? parseInt(match[1]) * 1000000 : undefined; // Assume millions
  }

  private parseRevenueMax(revenue?: string): number | undefined {
    if (!revenue) return undefined;
    if (revenue.includes('+')) return undefined; // No upper limit
    const match = revenue.match(/-(\d+)/);
    return match ? parseInt(match[1]) * 1000000 : undefined; // Assume millions
  }

  static create(): EnrichmentService {
    const providers: BaseEnrichmentProvider[] = [];

    // Add Clearbit if API key is provided
    if (process.env.CLEARBIT_API_KEY) {
      providers.push(new ClearbitProvider(process.env.CLEARBIT_API_KEY));
    }

    // Add Hunter.io if API key is provided
    if (process.env.HUNTER_API_KEY) {
      providers.push(new HunterProvider(process.env.HUNTER_API_KEY));
    }

    // Always add mock provider for development
    if (providers.length === 0 || process.env.NODE_ENV === 'development') {
      providers.push(new MockEnrichmentProvider());
    }

    return new EnrichmentService(providers);
  }
}

export const enrichmentService = EnrichmentService.create();