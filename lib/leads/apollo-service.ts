export interface ApolloContact {
  id: string;
  first_name: string;
  last_name: string;
  name: string;
  email: string;
  title: string;
  linkedin_url?: string;
  phone_numbers?: string[];
  organization: {
    id: string;
    name: string;
    website_url?: string;
    industry?: string;
    estimated_num_employees?: number;
    annual_revenue?: number;
    city?: string;
    state?: string;
    country?: string;
  };
}

export interface ApolloSearchFilters {
  person_titles?: string[];
  person_locations?: string[];
  organization_locations?: string[];
  organization_industries?: string[];
  organization_num_employees_ranges?: string[];
  organization_annual_revenues?: string[];
  keywords?: string;
  limit?: number;
  page?: number;
}

export interface ApolloSearchResponse {
  contacts: ApolloContact[];
  pagination: {
    page: number;
    per_page: number;
    total_entries: number;
    total_pages: number;
  };
  breadcrumbs: any[];
}

export interface LeadData {
  id: string;
  name: string;
  email: string;
  company: string;
  title: string;
  location: string;
  industry: string;
  company_size: string;
  revenue: string;
  phone?: string;
  linkedin?: string;
  website?: string;
  source: 'apollo' | 'zoominfo' | 'manual';
  status: 'new' | 'contacted' | 'qualified' | 'converted';
  score: number;
  last_contact?: string;
}

export class ApolloService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string, baseUrl?: string) {
    this.apiKey = apiKey || process.env.APOLLO_API_KEY || '';
    this.baseUrl = baseUrl || process.env.APOLLO_BASE_URL || 'https://api.apollo.io/v1';
  }

  /**
   * Search for contacts using Apollo.io API
   */
  async searchContacts(filters: ApolloSearchFilters): Promise<{ success: boolean; data?: LeadData[]; error?: string; pagination?: any }> {
    try {
      if (!this.apiKey) {
        throw new Error('Apollo API key not configured');
      }

      const searchPayload = {
        ...filters,
        per_page: filters.limit || 25,
        page: filters.page || 1,
      };

      const response = await fetch(`${this.baseUrl}/mixed_people/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'X-Api-Key': this.apiKey,
        },
        body: JSON.stringify(searchPayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Apollo API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data: ApolloSearchResponse = await response.json();

      // Transform Apollo contacts to our LeadData format
      const leads: LeadData[] = data.contacts.map(contact => this.transformApolloContact(contact));

      return {
        success: true,
        data: leads,
        pagination: data.pagination,
      };

    } catch (error) {
      console.error('Apollo search error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown Apollo error',
      };
    }
  }

  /**
   * Enrich a contact with additional data
   */
  async enrichContact(email: string): Promise<{ success: boolean; data?: LeadData; error?: string }> {
    try {
      if (!this.apiKey) {
        throw new Error('Apollo API key not configured');
      }

      const response = await fetch(`${this.baseUrl}/people/match`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'X-Api-Key': this.apiKey,
        },
        body: JSON.stringify({
          email: email,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Apollo API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();

      if (!data.person) {
        return {
          success: false,
          error: 'Contact not found',
        };
      }

      const lead = this.transformApolloContact(data.person);

      return {
        success: true,
        data: lead,
      };

    } catch (error) {
      console.error('Apollo enrich error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown Apollo error',
      };
    }
  }

  /**
   * Get account information and credits
   */
  async getAccountInfo(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      if (!this.apiKey) {
        throw new Error('Apollo API key not configured');
      }

      const response = await fetch(`${this.baseUrl}/auth/health`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/json',
          'X-Api-Key': this.apiKey,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Apollo API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();

      return {
        success: true,
        data: {
          credits_remaining: data.credits_remaining || 'Unknown',
          plan: data.plan || 'Unknown',
          status: 'connected',
        },
      };

    } catch (error) {
      console.error('Apollo account info error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown Apollo error',
      };
    }
  }

  /**
   * Transform Apollo contact to our LeadData format
   */
  private transformApolloContact(contact: ApolloContact): LeadData {
    const org = contact.organization || {};
    
    // Calculate lead score based on available data
    let score = 50; // Base score
    if (contact.email) score += 20;
    if (contact.phone_numbers?.length) score += 10;
    if (contact.linkedin_url) score += 10;
    if (org.website_url) score += 5;
    if (contact.title?.toLowerCase().includes('vp') || contact.title?.toLowerCase().includes('director')) score += 15;
    if (contact.title?.toLowerCase().includes('cto') || contact.title?.toLowerCase().includes('ceo')) score += 20;

    // Format company size
    let companySize = 'Unknown';
    if (org.estimated_num_employees) {
      const employees = org.estimated_num_employees;
      if (employees < 10) companySize = '1-10';
      else if (employees < 50) companySize = '11-50';
      else if (employees < 100) companySize = '51-100';
      else if (employees < 500) companySize = '101-500';
      else if (employees < 1000) companySize = '501-1000';
      else companySize = '1000+';
    }

    // Format revenue
    let revenue = 'Unknown';
    if (org.annual_revenue) {
      const rev = org.annual_revenue;
      if (rev < 1000000) revenue = '<$1M';
      else if (rev < 5000000) revenue = '$1M-5M';
      else if (rev < 10000000) revenue = '$5M-10M';
      else if (rev < 50000000) revenue = '$10M-50M';
      else if (rev < 100000000) revenue = '$50M-100M';
      else revenue = '$100M+';
    }

    return {
      id: contact.id,
      name: contact.name || `${contact.first_name || ''} ${contact.last_name || ''}`.trim(),
      email: contact.email || '',
      company: org.name || 'Unknown Company',
      title: contact.title || 'Unknown Title',
      location: [org.city, org.state, org.country].filter(Boolean).join(', ') || 'Unknown',
      industry: org.industry || 'Unknown',
      company_size: companySize,
      revenue: revenue,
      phone: contact.phone_numbers?.[0],
      linkedin: contact.linkedin_url,
      website: org.website_url,
      source: 'apollo',
      status: 'new',
      score: Math.min(100, score),
    };
  }

  /**
   * Validate API configuration
   */
  async validateConfiguration(): Promise<{ isValid: boolean; error?: string }> {
    try {
      const result = await this.getAccountInfo();
      return {
        isValid: result.success,
        error: result.error,
      };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Configuration validation failed',
      };
    }
  }
}

// Export singleton instance
export const apolloService = new ApolloService();
