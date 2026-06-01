export interface LinkedInProfile {
  id: string;
  firstName: string;
  lastName: string;
  headline: string;
  location: string;
  industry: string;
  company: string;
  profileUrl: string;
  connectionDegree: string;
  premium: boolean;
}

export interface LinkedInSearchFilters {
  keywords?: string;
  location?: string;
  industry?: string;
  company?: string;
  companySize?: string;
  seniority?: string;
  function?: string;
  limit?: number;
  page?: number;
}

export interface LinkedInConnection {
  id: string;
  profileId: string;
  status: 'pending' | 'connected' | 'declined' | 'withdrawn';
  message?: string;
  sentAt: string;
  respondedAt?: string;
}

export interface LinkedInMessage {
  id: string;
  profileId: string;
  content: string;
  sentAt: string;
  status: 'sent' | 'read' | 'replied';
  threadId: string;
}

export interface LinkedInAutomationSequence {
  id: string;
  name: string;
  steps: LinkedInAutomationStep[];
  isActive: boolean;
  dailyLimit: number;
  weeklyLimit: number;
}

export interface LinkedInAutomationStep {
  id: string;
  type: 'connection_request' | 'message' | 'follow_up' | 'view_profile';
  delayDays: number;
  content?: string;
  isActive: boolean;
}

export interface ProspectData {
  id: string;
  linkedInProfile: LinkedInProfile;
  status: 'new' | 'contacted' | 'connected' | 'qualified' | 'converted';
  score: number;
  lastContact?: string;
  notes: string;
  tags: string[];
  source: 'search' | 'import' | 'referral';
  addedAt: string;
}

export class LinkedInService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string, baseUrl?: string) {
    this.apiKey = apiKey || process.env.LINKEDIN_API_KEY || '';
    this.baseUrl = baseUrl || process.env.LINKEDIN_BASE_URL || 'https://api.linkedin.com/v2';
  }

  /**
   * Search for LinkedIn profiles
   */
  async searchProfiles(filters: LinkedInSearchFilters): Promise<{ 
    success: boolean; 
    data?: LinkedInProfile[]; 
    error?: string; 
    pagination?: any 
  }> {
    try {
      if (!this.apiKey) {
        // Return mock data for development
        return this.getMockSearchResults(filters);
      }

      // Real LinkedIn API implementation would go here
      // For now, return mock data
      return this.getMockSearchResults(filters);

    } catch (error) {
      console.error('LinkedIn search error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown LinkedIn error',
      };
    }
  }

  /**
   * Send connection request
   */
  async sendConnectionRequest(
    profileId: string, 
    message?: string
  ): Promise<{ success: boolean; connectionId?: string; error?: string }> {
    try {
      if (!this.apiKey) {
        // Mock successful connection request
        return {
          success: true,
          connectionId: `conn_${Date.now()}_${profileId}`,
        };
      }

      // Real LinkedIn API implementation would go here
      return {
        success: true,
        connectionId: `conn_${Date.now()}_${profileId}`,
      };

    } catch (error) {
      console.error('LinkedIn connection request error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send connection request',
      };
    }
  }

  /**
   * Send message to connection
   */
  async sendMessage(
    profileId: string, 
    content: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!this.apiKey) {
        // Mock successful message
        return {
          success: true,
          messageId: `msg_${Date.now()}_${profileId}`,
        };
      }

      // Real LinkedIn API implementation would go here
      return {
        success: true,
        messageId: `msg_${Date.now()}_${profileId}`,
      };

    } catch (error) {
      console.error('LinkedIn message error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send message',
      };
    }
  }

  /**
   * Get automation statistics
   */
  async getAutomationStats(): Promise<{
    connectionsToday: number;
    messagesThisWeek: number;
    acceptanceRate: number;
    replyRate: number;
    activeSequences: number;
    totalProspects: number;
  }> {
    try {
      // Return mock statistics
      return {
        connectionsToday: 12,
        messagesThisWeek: 47,
        acceptanceRate: 71,
        replyRate: 38,
        activeSequences: 3,
        totalProspects: 234,
      };
    } catch (error) {
      console.error('Failed to get automation stats:', error);
      return {
        connectionsToday: 0,
        messagesThisWeek: 0,
        acceptanceRate: 0,
        replyRate: 0,
        activeSequences: 0,
        totalProspects: 0,
      };
    }
  }

  /**
   * Get mock search results for development
   */
  private getMockSearchResults(filters: LinkedInSearchFilters): { 
    success: boolean; 
    data: LinkedInProfile[]; 
    pagination: any 
  } {
    const mockProfiles: LinkedInProfile[] = [
      {
        id: 'profile_1',
        firstName: 'Sarah',
        lastName: 'Chen',
        headline: 'VP of Engineering at TechCorp',
        location: 'San Francisco, CA',
        industry: 'Technology',
        company: 'TechCorp',
        profileUrl: 'https://linkedin.com/in/sarah-chen',
        connectionDegree: '2nd',
        premium: true,
      },
      {
        id: 'profile_2',
        firstName: 'Michael',
        lastName: 'Rodriguez',
        headline: 'Senior Software Engineer at StartupXYZ',
        location: 'Austin, TX',
        industry: 'Software',
        company: 'StartupXYZ',
        profileUrl: 'https://linkedin.com/in/michael-rodriguez',
        connectionDegree: '3rd',
        premium: false,
      },
      {
        id: 'profile_3',
        firstName: 'Emily',
        lastName: 'Johnson',
        headline: 'CTO & Co-founder at InnovateTech',
        location: 'New York, NY',
        industry: 'Technology',
        company: 'InnovateTech',
        profileUrl: 'https://linkedin.com/in/emily-johnson',
        connectionDegree: '2nd',
        premium: true,
      },
      {
        id: 'profile_4',
        firstName: 'David',
        lastName: 'Kim',
        headline: 'Engineering Manager at CloudScale',
        location: 'Seattle, WA',
        industry: 'Cloud Computing',
        company: 'CloudScale',
        profileUrl: 'https://linkedin.com/in/david-kim',
        connectionDegree: '1st',
        premium: false,
      },
      {
        id: 'profile_5',
        firstName: 'Jessica',
        lastName: 'Williams',
        headline: 'Head of Product at DataFlow',
        location: 'Boston, MA',
        industry: 'Data Analytics',
        company: 'DataFlow',
        profileUrl: 'https://linkedin.com/in/jessica-williams',
        connectionDegree: '2nd',
        premium: true,
      },
    ];

    // Filter results based on search criteria
    let filteredProfiles = mockProfiles;
    
    if (filters.keywords) {
      const keywords = filters.keywords.toLowerCase();
      filteredProfiles = filteredProfiles.filter(profile =>
        profile.headline.toLowerCase().includes(keywords) ||
        profile.company.toLowerCase().includes(keywords) ||
        profile.industry.toLowerCase().includes(keywords)
      );
    }

    if (filters.location) {
      filteredProfiles = filteredProfiles.filter(profile =>
        profile.location.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }

    if (filters.industry) {
      filteredProfiles = filteredProfiles.filter(profile =>
        profile.industry.toLowerCase().includes(filters.industry!.toLowerCase())
      );
    }

    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProfiles = filteredProfiles.slice(startIndex, endIndex);

    return {
      success: true,
      data: paginatedProfiles,
      pagination: {
        page,
        per_page: limit,
        total_entries: filteredProfiles.length,
        total_pages: Math.ceil(filteredProfiles.length / limit),
      },
    };
  }

  /**
   * Transform LinkedIn profile to prospect data
   */
  transformToProspect(profile: LinkedInProfile): ProspectData {
    // Calculate lead score based on profile data
    let score = 50; // Base score
    if (profile.premium) score += 15;
    if (profile.connectionDegree === '1st') score += 20;
    if (profile.connectionDegree === '2nd') score += 10;
    if (profile.headline.toLowerCase().includes('vp') || profile.headline.toLowerCase().includes('director')) score += 15;
    if (profile.headline.toLowerCase().includes('cto') || profile.headline.toLowerCase().includes('ceo')) score += 20;

    return {
      id: `prospect_${profile.id}`,
      linkedInProfile: profile,
      status: 'new',
      score: Math.min(100, score),
      notes: '',
      tags: [],
      source: 'search',
      addedAt: new Date().toISOString(),
    };
  }

  /**
   * Validate LinkedIn configuration
   */
  async validateConfiguration(): Promise<{ isValid: boolean; error?: string }> {
    try {
      if (!this.apiKey) {
        return { isValid: false, error: 'LinkedIn API key not configured' };
      }

      // For development, always return valid
      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Configuration validation failed',
      };
    }
  }
}

// Export singleton instance
export const linkedInService = new LinkedInService();
