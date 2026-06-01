import { EnrichmentResult } from './enrichment-service';

export interface ValidationResult {
  isValid: boolean;
  confidence: number; // 0-1 score
  issues: ValidationIssue[];
  suggestions?: string[];
}

export interface ValidationIssue {
  field: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  suggested_fix?: string;
}

export interface EmailValidationResult {
  isValid: boolean;
  isDisposable: boolean;
  isRole: boolean;
  confidence: number;
  syntax: boolean;
  domain: {
    exists: boolean;
    mx_records: boolean;
    spf_record: boolean;
  };
  deliverability: 'high' | 'medium' | 'low' | 'unknown';
}

export interface DomainValidationResult {
  exists: boolean;
  isActive: boolean;
  hasWebsite: boolean;
  ssl_valid: boolean;
  dns_records: {
    a_record: boolean;
    mx_record: boolean;
    cname_record: boolean;
  };
  reputation: {
    spam_score: number;
    blacklisted: boolean;
    trust_score: number;
  };
}

/**
 * Real-time data validation and verification service
 * Validates enrichment data quality and suggests improvements
 */
export class DataValidator {
  private disposableDomains = new Set([
    '10minutemail.com',
    'guerrillamail.com',
    'mailinator.com',
    'tempmail.org',
    'yopmail.com',
    'throwaway.email',
    'temp-mail.org'
  ]);

  private rolePrefixes = new Set([
    'admin', 'support', 'help', 'info', 'contact', 'sales',
    'marketing', 'noreply', 'no-reply', 'postmaster', 'webmaster',
    'hr', 'jobs', 'careers', 'billing', 'accounting'
  ]);

  /**
   * Validate company enrichment data
   */
  async validateCompanyData(data: any): Promise<ValidationResult> {
    const issues: ValidationIssue[] = [];
    let confidence = 1.0;

    // Validate required fields
    if (!data.name || data.name.length < 2) {
      issues.push({
        field: 'name',
        severity: 'high',
        message: 'Company name is missing or too short',
        suggested_fix: 'Verify company name through official sources'
      });
      confidence -= 0.3;
    }

    // Validate domain
    if (data.domain) {
      const domainValidation = await this.validateDomain(data.domain);
      if (!domainValidation.exists) {
        issues.push({
          field: 'domain',
          severity: 'medium',
          message: 'Domain does not exist or is not reachable',
          suggested_fix: 'Double-check domain spelling'
        });
        confidence -= 0.2;
      } else if (!domainValidation.isActive) {
        issues.push({
          field: 'domain',
          severity: 'low',
          message: 'Domain appears inactive',
          suggested_fix: 'Verify company is still operating'
        });
        confidence -= 0.1;
      }
    }

    // Validate employee count
    if (data.employees !== undefined) {
      if (typeof data.employees !== 'number' || data.employees < 0) {
        issues.push({
          field: 'employees',
          severity: 'medium',
          message: 'Invalid employee count',
          suggested_fix: 'Use numeric value or remove if uncertain'
        });
        confidence -= 0.1;
      } else if (data.employees === 0) {
        issues.push({
          field: 'employees',
          severity: 'low',
          message: 'Zero employees reported',
          suggested_fix: 'Verify if company is active'
        });
        confidence -= 0.05;
      }
    }

    // Validate industry
    if (data.industry && data.industry.length < 3) {
      issues.push({
        field: 'industry',
        severity: 'low',
        message: 'Industry classification too vague',
        suggested_fix: 'Use more specific industry categories'
      });
      confidence -= 0.05;
    }

    // Validate tech stack
    if (data.techStack && Array.isArray(data.techStack)) {
      const invalidTech = data.techStack.filter((tech: string) =>
        typeof tech !== 'string' || tech.length < 2
      );
      if (invalidTech.length > 0) {
        issues.push({
          field: 'techStack',
          severity: 'low',
          message: `${invalidTech.length} invalid technology entries`,
          suggested_fix: 'Remove invalid or very short technology names'
        });
        confidence -= 0.05;
      }
    }

    // Validate social profiles
    if (data.socialProfiles) {
      if (data.socialProfiles.linkedin && !this.isValidLinkedInUrl(data.socialProfiles.linkedin)) {
        issues.push({
          field: 'socialProfiles.linkedin',
          severity: 'medium',
          message: 'Invalid LinkedIn URL format',
          suggested_fix: 'Ensure LinkedIn URL follows proper format'
        });
        confidence -= 0.1;
      }
    }

    return {
      isValid: issues.filter(i => i.severity === 'high').length === 0,
      confidence: Math.max(0, confidence),
      issues,
      suggestions: this.generateCompanySuggestions(data, issues)
    };
  }

  /**
   * Validate contact enrichment data
   */
  async validateContactData(data: any): Promise<ValidationResult> {
    const issues: ValidationIssue[] = [];
    let confidence = 1.0;

    // Validate name fields
    if (!data.firstName || data.firstName.length < 1) {
      issues.push({
        field: 'firstName',
        severity: 'high',
        message: 'First name is missing',
        suggested_fix: 'Extract from full name or other sources'
      });
      confidence -= 0.3;
    }

    if (!data.lastName || data.lastName.length < 1) {
      issues.push({
        field: 'lastName',
        severity: 'high',
        message: 'Last name is missing',
        suggested_fix: 'Extract from full name or other sources'
      });
      confidence -= 0.3;
    }

    // Validate email
    if (data.email) {
      const emailValidation = await this.validateEmail(data.email);
      if (!emailValidation.isValid) {
        issues.push({
          field: 'email',
          severity: 'high',
          message: 'Invalid email format',
          suggested_fix: 'Correct email syntax'
        });
        confidence -= 0.4;
      } else {
        if (emailValidation.isDisposable) {
          issues.push({
            field: 'email',
            severity: 'medium',
            message: 'Disposable email detected',
            suggested_fix: 'Look for professional email address'
          });
          confidence -= 0.2;
        }
        if (emailValidation.isRole) {
          issues.push({
            field: 'email',
            severity: 'low',
            message: 'Role-based email (not personal)',
            suggested_fix: 'Find personal contact email if possible'
          });
          confidence -= 0.1;
        }
      }
    }

    // Validate job title
    if (!data.jobTitle || data.jobTitle.length < 2) {
      issues.push({
        field: 'jobTitle',
        severity: 'medium',
        message: 'Job title missing or too short',
        suggested_fix: 'Research current position on LinkedIn'
      });
      confidence -= 0.2;
    }

    // Validate LinkedIn URL
    if (data.linkedinUrl && !this.isValidLinkedInUrl(data.linkedinUrl)) {
      issues.push({
        field: 'linkedinUrl',
        severity: 'medium',
        message: 'Invalid LinkedIn URL format',
        suggested_fix: 'Ensure LinkedIn URL follows proper format'
      });
      confidence -= 0.1;
    }

    // Validate phone number
    if (data.phoneNumber && !this.isValidPhoneNumber(data.phoneNumber)) {
      issues.push({
        field: 'phoneNumber',
        severity: 'low',
        message: 'Phone number format may be invalid',
        suggested_fix: 'Verify phone number format'
      });
      confidence -= 0.05;
    }

    return {
      isValid: issues.filter(i => i.severity === 'high').length === 0,
      confidence: Math.max(0, confidence),
      issues,
      suggestions: this.generateContactSuggestions(data, issues)
    };
  }

  /**
   * Validate email address
   */
  async validateEmail(email: string): Promise<EmailValidationResult> {
    // Basic syntax validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const syntax = emailRegex.test(email);

    if (!syntax) {
      return {
        isValid: false,
        isDisposable: false,
        isRole: false,
        confidence: 0,
        syntax: false,
        domain: { exists: false, mx_records: false, spf_record: false },
        deliverability: 'unknown'
      };
    }

    const [localPart, domain] = email.toLowerCase().split('@');

    // Check if disposable
    const isDisposable = this.disposableDomains.has(domain);

    // Check if role-based
    const isRole = this.rolePrefixes.has(localPart) ||
      localPart.includes('noreply') ||
      localPart.includes('donotreply');

    // Validate domain (simplified - in production, use DNS lookup)
    const domainValidation = await this.validateDomain(domain);

    let confidence = 1.0;
    if (isDisposable) confidence -= 0.5;
    if (isRole) confidence -= 0.2;
    if (!domainValidation.exists) confidence -= 0.4;

    return {
      isValid: syntax && domainValidation.exists,
      isDisposable,
      isRole,
      confidence: Math.max(0, confidence),
      syntax,
      domain: {
        exists: domainValidation.exists,
        mx_records: domainValidation.dns_records.mx_record,
        spf_record: false // Would need DNS lookup
      },
      deliverability: confidence > 0.7 ? 'high' : confidence > 0.4 ? 'medium' : 'low'
    };
  }

  /**
   * Validate domain
   */
  async validateDomain(domain: string): Promise<DomainValidationResult> {
    try {
      // In a real implementation, this would make DNS/HTTP requests
      // For now, we'll do basic validation and mock some checks

      const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;
      const isValidFormat = domainRegex.test(domain);

      // Mock implementation - in production, would check actual DNS records
      const commonInvalidDomains = ['localhost', 'example.com', 'test.com', 'invalid.com'];
      const exists = isValidFormat && !commonInvalidDomains.includes(domain.toLowerCase());

      return {
        exists,
        isActive: exists,
        hasWebsite: exists,
        ssl_valid: exists,
        dns_records: {
          a_record: exists,
          mx_record: exists,
          cname_record: false
        },
        reputation: {
          spam_score: 0.1,
          blacklisted: false,
          trust_score: exists ? 0.8 : 0.2
        }
      };
    } catch (error) {
      return {
        exists: false,
        isActive: false,
        hasWebsite: false,
        ssl_valid: false,
        dns_records: {
          a_record: false,
          mx_record: false,
          cname_record: false
        },
        reputation: {
          spam_score: 1.0,
          blacklisted: true,
          trust_score: 0.0
        }
      };
    }
  }

  /**
   * Cross-reference data between multiple sources
   */
  async crossValidate(results: EnrichmentResult[]): Promise<ValidationResult> {
    const issues: ValidationIssue[] = [];
    let confidence = 1.0;

    // Find successful results
    const validResults = results.filter(r => r.success && r.data);

    if (validResults.length === 0) {
      return {
        isValid: false,
        confidence: 0,
        issues: [{
          field: 'general',
          severity: 'high',
          message: 'No valid data sources available',
          suggested_fix: 'Check API configurations and try again'
        }]
      };
    }

    if (validResults.length === 1) {
      issues.push({
        field: 'general',
        severity: 'medium',
        message: 'Single data source - unable to cross-validate',
        suggested_fix: 'Configure additional data sources for verification'
      });
      confidence -= 0.2;
    }

    // Cross-validate common fields between sources
    if (validResults.length > 1) {
      const companyNames = validResults.map(r => r.data?.name).filter(Boolean);
      const uniqueNames = [...new Set(companyNames)];

      if (uniqueNames.length > 1) {
        issues.push({
          field: 'name',
          severity: 'medium',
          message: 'Company name inconsistency between sources',
          suggested_fix: 'Verify correct company name manually'
        });
        confidence -= 0.2;
      }

      // Check employee count consistency
      const employeeCounts = validResults
        .map(r => r.data?.employees)
        .filter(e => typeof e === 'number' && e > 0);

      if (employeeCounts.length > 1) {
        const minEmployees = Math.min(...employeeCounts);
        const maxEmployees = Math.max(...employeeCounts);
        const variance = (maxEmployees - minEmployees) / minEmployees;

        if (variance > 0.5) { // More than 50% difference
          issues.push({
            field: 'employees',
            severity: 'low',
            message: 'Employee count varies significantly between sources',
            suggested_fix: 'Use most recent or reliable source'
          });
          confidence -= 0.1;
        }
      }
    }

    return {
      isValid: issues.filter(i => i.severity === 'high').length === 0,
      confidence: Math.max(0, confidence),
      issues,
      suggestions: this.generateCrossValidationSuggestions(validResults, issues)
    };
  }

  private isValidLinkedInUrl(url: string): boolean {
    const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/(in|company)\/[a-zA-Z0-9-]+\/?$/;
    return linkedinRegex.test(url);
  }

  private isValidPhoneNumber(phone: string): boolean {
    // Basic international phone number validation
    const phoneRegex = /^\+?[\d\s\-\(\)\.]{7,15}$/;
    return phoneRegex.test(phone);
  }

  private generateCompanySuggestions(data: any, issues: ValidationIssue[]): string[] {
    const suggestions: string[] = [];

    if (issues.some(i => i.field === 'domain')) {
      suggestions.push('Verify domain through company website or official documentation');
    }

    if (!data.techStack || data.techStack.length === 0) {
      suggestions.push('Add technology stack information to improve targeting accuracy');
    }

    if (!data.socialProfiles?.linkedin) {
      suggestions.push('Find company LinkedIn page for additional verification');
    }

    if (!data.employees || data.employees === 0) {
      suggestions.push('Research company size on LinkedIn or Crunchbase');
    }

    return suggestions;
  }

  private generateContactSuggestions(data: any, issues: ValidationIssue[]): string[] {
    const suggestions: string[] = [];

    if (issues.some(i => i.field === 'email')) {
      suggestions.push('Search for professional email on company website or LinkedIn');
    }

    if (!data.linkedinUrl) {
      suggestions.push('Find LinkedIn profile to verify professional information');
    }

    if (!data.phoneNumber) {
      suggestions.push('Contact information may be available through company directory');
    }

    if (issues.some(i => i.field === 'jobTitle')) {
      suggestions.push('Check LinkedIn profile for current job title and responsibilities');
    }

    return suggestions;
  }

  private generateCrossValidationSuggestions(results: EnrichmentResult[], issues: ValidationIssue[]): string[] {
    const suggestions: string[] = [];

    if (results.length === 1) {
      suggestions.push('Configure additional data sources (Apollo.io, ZoomInfo) for cross-validation');
    }

    if (issues.some(i => i.field === 'name')) {
      suggestions.push('Manually verify company name through official sources');
    }

    if (issues.some(i => i.field === 'employees')) {
      suggestions.push('Use the most recent employee count from the most reliable source');
    }

    suggestions.push('Review data quality scores when making outreach decisions');

    return suggestions;
  }
}