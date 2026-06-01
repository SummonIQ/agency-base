import { JobBoard } from '@prisma/client';

export interface PlatformDetectionResult {
  platform: JobBoard;
  confidence: number;
  indicators: string[];
  metadata?: Record<string, any>;
}

export interface PlatformPattern {
  domains: string[];
  urlPatterns: string[];
  contentPatterns?: string[];
  priority: number;
}

// Platform detection patterns ordered by specificity and reliability
const PLATFORM_PATTERNS: Record<JobBoard, PlatformPattern> = {
  [JobBoard.LINKEDIN]: {
    domains: ['linkedin.com', 'www.linkedin.com'],
    urlPatterns: ['/jobs/', '/in/', 'linkedin.com/jobs'],
    contentPatterns: ['linkedin', 'professional network'],
    priority: 100,
  },
  [JobBoard.INDEED]: {
    domains: ['indeed.com', 'www.indeed.com', 'indeed.ca', 'indeed.co.uk'],
    urlPatterns: ['/viewjob', '/jobs/', 'indeed.com'],
    contentPatterns: ['indeed', 'job search'],
    priority: 100,
  },
  [JobBoard.GLASSDOOR]: {
    domains: ['glassdoor.com', 'www.glassdoor.com', 'glassdoor.ca'],
    urlPatterns: ['/job-listing/', '/jobs/', '/partner/jobListing'],
    contentPatterns: ['glassdoor', 'company reviews'],
    priority: 100,
  },
  [JobBoard.ZIPRECRUITER]: {
    domains: ['ziprecruiter.com', 'www.ziprecruiter.com'],
    urlPatterns: ['/jobs/', '/c/', '/candidate'],
    contentPatterns: ['ziprecruiter', 'quick apply'],
    priority: 100,
  },
  [JobBoard.ANGELLIST]: {
    domains: ['angel.co', 'www.angel.co'],
    urlPatterns: ['/company/', '/jobs/', '/l/'],
    contentPatterns: ['angellist', 'startup jobs'],
    priority: 100,
  },
  [JobBoard.WELLFOUND]: {
    domains: ['wellfound.com', 'www.wellfound.com'],
    urlPatterns: ['/company/', '/jobs/', '/l/'],
    contentPatterns: ['wellfound', 'startup jobs'],
    priority: 100,
  },
  [JobBoard.MONSTER]: {
    domains: ['monster.com', 'www.monster.com'],
    urlPatterns: ['/jobs/', '/job-openings/', '/monster'],
    contentPatterns: ['monster', 'job search'],
    priority: 90,
  },
  [JobBoard.DICE]: {
    domains: ['dice.com', 'www.dice.com'],
    urlPatterns: ['/jobs/', '/job/', '/dice'],
    contentPatterns: ['dice', 'tech jobs'],
    priority: 90,
  },
  [JobBoard.CAREER_BUILDER]: {
    domains: ['careerbuilder.com', 'www.careerbuilder.com'],
    urlPatterns: ['/job/', '/jobs/', '/careerbuilder'],
    contentPatterns: ['careerbuilder', 'career'],
    priority: 90,
  },
  [JobBoard.FLEXJOBS]: {
    domains: ['flexjobs.com', 'www.flexjobs.com'],
    urlPatterns: ['/jobs/', '/remote-jobs/'],
    contentPatterns: ['flexjobs', 'remote work', 'flexible'],
    priority: 90,
  },
  [JobBoard.REMOTE_OK]: {
    domains: ['remoteok.io', 'remoteok.com'],
    urlPatterns: ['/remote-jobs/', '/'],
    contentPatterns: ['remote ok', 'remote work'],
    priority: 85,
  },
  [JobBoard.WE_WORK_REMOTELY]: {
    domains: ['weworkremotely.com'],
    urlPatterns: ['/remote-jobs/', '/categories/'],
    contentPatterns: ['we work remotely', 'remote'],
    priority: 85,
  },
  [JobBoard.GOOGLE]: {
    domains: ['jobs.google.com', 'www.google.com'],
    urlPatterns: ['/jobs/', 'tbm=jobs'],
    contentPatterns: ['google jobs', 'google for jobs'],
    priority: 95,
  },
  [JobBoard.COMPANY_DIRECT]: {
    domains: [], // Will be determined by exclusion
    urlPatterns: ['/careers/', '/jobs/', '/opportunities/', '/apply/'],
    contentPatterns: ['careers', 'join our team', 'work with us'],
    priority: 10, // Lowest priority - catch-all
  },
  [JobBoard.OTHER]: {
    domains: [],
    urlPatterns: [],
    contentPatterns: [],
    priority: 1, // Absolute lowest
  },
};

// Common ATS detection patterns for company direct applications
const ATS_INDICATORS = {
  workday: ['myworkdayjobs.com', '/workday/', 'workday-application'],
  greenhouse: ['greenhouse.io', '/boards/', 'greenhouse-application'],
  lever: ['jobs.lever.co', '/lever/', 'lever-application'],
  bamboohr: ['bamboohr.com', '/bamboohr/', 'bamboo-application'],
  jobvite: ['jobvite.com', '/jobvite/', 'jobvite-application'],
  smartrecruiters: ['smartrecruiters.com', '/smartrecruiters/', 'smartrecruiters-form'],
  icims: ['icims.com', '/icims/', 'iCIMS'],
  taleo: ['taleo.net', '/taleo/', 'taleo-application'],
  successfactors: ['successfactors.com', '/sf/', 'successfactors'],
  cornerstone: ['csod.com', '/cornerstone/', 'cornerstone-application'],
};

export class PlatformDetectionService {
  /**
   * Detect the job board platform from a URL
   */
  static detectPlatform(url: string, content?: string): PlatformDetectionResult {
    if (!url) {
      return {
        platform: JobBoard.OTHER,
        confidence: 0,
        indicators: ['No URL provided'],
      };
    }

    const normalizedUrl = url.toLowerCase().trim();
    const results: Array<{ platform: JobBoard; confidence: number; indicators: string[] }> = [];

    // Check each platform pattern
    for (const [platform, pattern] of Object.entries(PLATFORM_PATTERNS)) {
      const confidence = this.calculateConfidence(normalizedUrl, content, pattern);
      if (confidence > 0) {
        results.push({
          platform: platform as JobBoard,
          confidence,
          indicators: this.getMatchingIndicators(normalizedUrl, content, pattern),
        });
      }
    }

    // Sort by confidence and priority
    results.sort((a, b) => {
      const aPattern = PLATFORM_PATTERNS[a.platform];
      const bPattern = PLATFORM_PATTERNS[b.platform];
      
      // First by confidence
      if (b.confidence !== a.confidence) {
        return b.confidence - a.confidence;
      }
      
      // Then by priority
      return bPattern.priority - aPattern.priority;
    });

    const topResult = results[0];
    if (!topResult || topResult.confidence < 30) {
      // If no strong match found, check if it's a company direct application
      const atsDetection = this.detectATS(normalizedUrl, content);
      if (atsDetection.detected) {
        return {
          platform: JobBoard.COMPANY_DIRECT,
          confidence: 60,
          indicators: [`ATS detected: ${atsDetection.provider}`, ...atsDetection.indicators],
          metadata: { atsProvider: atsDetection.provider },
        };
      }

      // Check if it looks like a company careers page
      if (this.isCompanyCareersPage(normalizedUrl)) {
        return {
          platform: JobBoard.COMPANY_DIRECT,
          confidence: 50,
          indicators: ['Company careers page detected'],
        };
      }

      return {
        platform: JobBoard.OTHER,
        confidence: topResult?.confidence || 0,
        indicators: topResult?.indicators || ['No platform patterns matched'],
      };
    }

    return {
      platform: topResult.platform,
      confidence: topResult.confidence,
      indicators: topResult.indicators,
    };
  }

  /**
   * Calculate confidence score for a platform match
   */
  private static calculateConfidence(
    url: string,
    content: string | undefined,
    pattern: PlatformPattern
  ): number {
    let confidence = 0;

    // Domain exact match (highest confidence)
    for (const domain of pattern.domains) {
      if (url.includes(domain)) {
        confidence += 90;
        break;
      }
    }

    // URL pattern matches
    let urlMatches = 0;
    for (const urlPattern of pattern.urlPatterns) {
      if (url.includes(urlPattern)) {
        urlMatches++;
      }
    }
    confidence += Math.min(urlMatches * 20, 60);

    // Content pattern matches (if content provided)
    if (content && pattern.contentPatterns) {
      const lowerContent = content.toLowerCase();
      let contentMatches = 0;
      for (const contentPattern of pattern.contentPatterns) {
        if (lowerContent.includes(contentPattern)) {
          contentMatches++;
        }
      }
      confidence += Math.min(contentMatches * 10, 30);
    }

    // Cap confidence at 100
    return Math.min(confidence, 100);
  }

  /**
   * Get list of matching indicators for debugging
   */
  private static getMatchingIndicators(
    url: string,
    content: string | undefined,
    pattern: PlatformPattern
  ): string[] {
    const indicators: string[] = [];

    // Check domain matches
    for (const domain of pattern.domains) {
      if (url.includes(domain)) {
        indicators.push(`Domain match: ${domain}`);
        break;
      }
    }

    // Check URL pattern matches
    for (const urlPattern of pattern.urlPatterns) {
      if (url.includes(urlPattern)) {
        indicators.push(`URL pattern: ${urlPattern}`);
      }
    }

    // Check content pattern matches
    if (content && pattern.contentPatterns) {
      const lowerContent = content.toLowerCase();
      for (const contentPattern of pattern.contentPatterns) {
        if (lowerContent.includes(contentPattern)) {
          indicators.push(`Content pattern: ${contentPattern}`);
        }
      }
    }

    return indicators;
  }

  /**
   * Detect ATS provider for company direct applications
   */
  private static detectATS(url: string, content?: string): {
    detected: boolean;
    provider?: string;
    indicators: string[];
  } {
    const indicators: string[] = [];
    
    for (const [provider, patterns] of Object.entries(ATS_INDICATORS)) {
      for (const pattern of patterns) {
        if (url.includes(pattern)) {
          indicators.push(`ATS URL pattern: ${pattern}`);
          return {
            detected: true,
            provider,
            indicators,
          };
        }
      }
      
      if (content) {
        const lowerContent = content.toLowerCase();
        for (const pattern of patterns) {
          if (lowerContent.includes(pattern.toLowerCase())) {
            indicators.push(`ATS content pattern: ${pattern}`);
            return {
              detected: true,
              provider,
              indicators,
            };
          }
        }
      }
    }

    return { detected: false, indicators: [] };
  }

  /**
   * Check if URL looks like a company careers page
   */
  private static isCompanyCareersPage(url: string): boolean {
    const careersIndicators = [
      '/careers', '/jobs', '/opportunities', '/work-with-us',
      '/join-us', '/employment', '/hiring', '/openings'
    ];

    const jobBoardDomains = [
      'linkedin.com', 'indeed.com', 'glassdoor.com', 'ziprecruiter.com',
      'monster.com', 'dice.com', 'careerbuilder.com', 'wellfound.com',
      'angel.co', 'flexjobs.com', 'remoteok.io', 'weworkremotely.com'
    ];

    // Check if it's NOT a known job board
    const isJobBoard = jobBoardDomains.some(domain => url.includes(domain));
    if (isJobBoard) {
      return false;
    }

    // Check if it has careers-related paths
    return careersIndicators.some(indicator => url.includes(indicator));
  }

  /**
   * Batch detect platforms for multiple URLs
   */
  static detectPlatforms(urls: string[]): Array<PlatformDetectionResult & { url: string }> {
    return urls.map(url => ({
      url,
      ...this.detectPlatform(url),
    }));
  }

  /**
   * Get platform-specific application capabilities
   */
  static getPlatformCapabilities(platform: JobBoard): {
    automationSupported: boolean;
    confidenceLevel: 'high' | 'medium' | 'low';
    features: string[];
    limitations: string[];
  } {
    const capabilities = {
      [JobBoard.LINKEDIN]: {
        automationSupported: true,
        confidenceLevel: 'high' as const,
        features: ['Easy Apply', 'Profile integration', 'Connection suggestions'],
        limitations: ['API rate limits', 'Premium features may be limited'],
      },
      [JobBoard.INDEED]: {
        automationSupported: true,
        confidenceLevel: 'high' as const,
        features: ['Quick Apply', 'Resume upload', 'Cover letter'],
        limitations: ['Anti-bot measures', 'Some jobs require external application'],
      },
      [JobBoard.GLASSDOOR]: {
        automationSupported: true,
        confidenceLevel: 'medium' as const,
        features: ['Direct application', 'Company insights'],
        limitations: ['Mixed internal/external applications', 'Complex forms'],
      },
      [JobBoard.ZIPRECRUITER]: {
        automationSupported: true,
        confidenceLevel: 'medium' as const,
        features: ['Quick Apply', 'Phone verification'],
        limitations: ['Employer redirects', 'Phone verification required'],
      },
      [JobBoard.ANGELLIST]: {
        automationSupported: true,
        confidenceLevel: 'medium' as const,
        features: ['Startup focus', 'Equity information', 'Portfolio links'],
        limitations: ['Startup-specific questions', 'Manual review often needed'],
      },
      [JobBoard.WELLFOUND]: {
        automationSupported: true,
        confidenceLevel: 'medium' as const,
        features: ['Startup focus', 'Equity information', 'Portfolio links'],
        limitations: ['Startup-specific questions', 'Manual review often needed'],
      },
      [JobBoard.COMPANY_DIRECT]: {
        automationSupported: true,
        confidenceLevel: 'low' as const,
        features: ['ATS detection', 'Form filling', 'Multi-step applications'],
        limitations: ['Highly variable', 'Manual intervention often required', 'ATS-dependent'],
      },
    };

    return capabilities[platform] || {
      automationSupported: false,
      confidenceLevel: 'low' as const,
      features: [],
      limitations: ['Not yet implemented'],
    };
  }

  /**
   * Validate if a URL is suitable for automation
   */
  static validateForAutomation(url: string): {
    suitable: boolean;
    platform: JobBoard;
    confidence: number;
    recommendations: string[];
    warnings: string[];
  } {
    const detection = this.detectPlatform(url);
    const capabilities = this.getPlatformCapabilities(detection.platform);
    
    const recommendations: string[] = [];
    const warnings: string[] = [];

    if (!capabilities.automationSupported) {
      warnings.push('Platform automation not yet implemented');
      recommendations.push('Consider manual application');
    }

    if (detection.confidence < 70) {
      warnings.push('Platform detection confidence is low');
      recommendations.push('Verify job posting manually before automation');
    }

    if (capabilities.confidenceLevel === 'low') {
      warnings.push('Automation success rate may be lower for this platform');
      recommendations.push('Review application before submission');
    }

    return {
      suitable: capabilities.automationSupported && detection.confidence >= 50,
      platform: detection.platform,
      confidence: detection.confidence,
      recommendations,
      warnings,
    };
  }
}

// Export helper functions
export const {
  detectPlatform,
  detectPlatforms,
  getPlatformCapabilities,
  validateForAutomation,
} = PlatformDetectionService;