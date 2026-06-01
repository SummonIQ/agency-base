import { apolloService } from '@/lib/leads/apollo-service';
import { sendGridService } from '@/lib/email/sendgrid';
import { linkedInService } from '@/lib/linkedin/linkedin-service';

export interface APIValidationResult {
  service: string;
  isValid: boolean;
  status: 'connected' | 'error' | 'missing_key' | 'invalid_key';
  message: string;
  details?: any;
  lastTested: string;
}

export interface SystemValidation {
  overall: {
    status: 'healthy' | 'partial' | 'critical';
    connectedServices: number;
    totalServices: number;
    lastValidated: string;
  };
  services: APIValidationResult[];
  recommendations: string[];
}

export class APIValidationService {
  
  /**
   * Validate all API integrations
   */
  async validateAllAPIs(): Promise<SystemValidation> {
    const services = [
      { name: 'Apollo.io', validator: () => this.validateApollo() },
      { name: 'SendGrid', validator: () => this.validateSendGrid() },
      { name: 'LinkedIn', validator: () => this.validateLinkedIn() },
    ];

    const results: APIValidationResult[] = [];
    
    // Test all services in parallel
    const validationPromises = services.map(async (service) => {
      try {
        return await service.validator();
      } catch (error) {
        return {
          service: service.name,
          isValid: false,
          status: 'error' as const,
          message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          lastTested: new Date().toISOString(),
        };
      }
    });

    const validationResults = await Promise.all(validationPromises);
    results.push(...validationResults);

    // Calculate overall system health
    const connectedServices = results.filter(r => r.isValid).length;
    const totalServices = results.length;
    
    let overallStatus: 'healthy' | 'partial' | 'critical';
    if (connectedServices === totalServices) {
      overallStatus = 'healthy';
    } else if (connectedServices > 0) {
      overallStatus = 'partial';
    } else {
      overallStatus = 'critical';
    }

    // Generate recommendations
    const recommendations = this.generateRecommendations(results);

    return {
      overall: {
        status: overallStatus,
        connectedServices,
        totalServices,
        lastValidated: new Date().toISOString(),
      },
      services: results,
      recommendations,
    };
  }

  /**
   * Validate Apollo.io API connection
   */
  private async validateApollo(): Promise<APIValidationResult> {
    try {
      const validation = await apolloService.validateConfiguration();
      
      if (!validation.isValid) {
        return {
          service: 'Apollo.io',
          isValid: false,
          status: validation.error?.includes('not configured') ? 'missing_key' : 'invalid_key',
          message: validation.error || 'Configuration validation failed',
          lastTested: new Date().toISOString(),
        };
      }

      // Test actual API call
      const testSearch = await apolloService.searchContacts({
        limit: 1,
      });

      if (testSearch.success) {
        return {
          service: 'Apollo.io',
          isValid: true,
          status: 'connected',
          message: 'Successfully connected to Apollo.io API',
          details: {
            testResults: `Found ${testSearch.data?.length || 0} contacts in test search`,
            apiKeyPresent: true,
          },
          lastTested: new Date().toISOString(),
        };
      } else {
        return {
          service: 'Apollo.io',
          isValid: false,
          status: 'invalid_key',
          message: testSearch.error || 'API test call failed',
          lastTested: new Date().toISOString(),
        };
      }

    } catch (error) {
      return {
        service: 'Apollo.io',
        isValid: false,
        status: 'error',
        message: `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        lastTested: new Date().toISOString(),
      };
    }
  }

  /**
   * Validate SendGrid API connection
   */
  private async validateSendGrid(): Promise<APIValidationResult> {
    try {
      const validation = await sendGridService.validateConfiguration();
      
      if (!validation.isValid) {
        return {
          service: 'SendGrid',
          isValid: false,
          status: validation.error?.includes('not configured') ? 'missing_key' : 'invalid_key',
          message: validation.error || 'Configuration validation failed',
          lastTested: new Date().toISOString(),
        };
      }

      // Test getting email stats (non-destructive test)
      const stats = await sendGridService.getEmailStats();
      
      return {
        service: 'SendGrid',
        isValid: true,
        status: 'connected',
        message: 'Successfully connected to SendGrid API',
        details: {
          emailsSent: stats.sent || 0,
          emailsDelivered: stats.delivered || 0,
          apiKeyPresent: true,
        },
        lastTested: new Date().toISOString(),
      };

    } catch (error) {
      return {
        service: 'SendGrid',
        isValid: false,
        status: 'error',
        message: `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        lastTested: new Date().toISOString(),
      };
    }
  }

  /**
   * Validate LinkedIn API connection
   */
  private async validateLinkedIn(): Promise<APIValidationResult> {
    try {
      const validation = await linkedInService.validateConfiguration();
      
      if (!validation.isValid) {
        return {
          service: 'LinkedIn',
          isValid: false,
          status: validation.error?.includes('not configured') ? 'missing_key' : 'invalid_key',
          message: validation.error || 'Configuration validation failed',
          lastTested: new Date().toISOString(),
        };
      }

      // Test getting automation stats (non-destructive test)
      const stats = await linkedInService.getAutomationStats();
      
      return {
        service: 'LinkedIn',
        isValid: true,
        status: 'connected',
        message: 'Successfully connected to LinkedIn API',
        details: {
          connectionsToday: stats.connectionsToday || 0,
          totalProspects: stats.totalProspects || 0,
          acceptanceRate: stats.acceptanceRate || 0,
          apiKeyPresent: true,
        },
        lastTested: new Date().toISOString(),
      };

    } catch (error) {
      return {
        service: 'LinkedIn',
        isValid: false,
        status: 'error',
        message: `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        lastTested: new Date().toISOString(),
      };
    }
  }

  /**
   * Generate recommendations based on validation results
   */
  private generateRecommendations(results: APIValidationResult[]): string[] {
    const recommendations: string[] = [];
    
    results.forEach(result => {
      if (!result.isValid) {
        switch (result.status) {
          case 'missing_key':
            recommendations.push(`Add ${result.service} API key to your environment variables`);
            break;
          case 'invalid_key':
            recommendations.push(`Verify ${result.service} API key is correct and has proper permissions`);
            break;
          case 'error':
            recommendations.push(`Check ${result.service} service status and network connectivity`);
            break;
        }
      }
    });

    // Add general recommendations
    const connectedCount = results.filter(r => r.isValid).length;
    if (connectedCount === 0) {
      recommendations.push('Set up at least one API integration to start using the system');
    } else if (connectedCount < results.length) {
      recommendations.push('Complete remaining API integrations for full system functionality');
    }

    // Service-specific recommendations
    const apolloConnected = results.find(r => r.service === 'Apollo.io')?.isValid;
    const sendGridConnected = results.find(r => r.service === 'SendGrid')?.isValid;
    const linkedInConnected = results.find(r => r.service === 'LinkedIn')?.isValid;

    if (!apolloConnected) {
      recommendations.push('Apollo.io integration is essential for lead discovery and enrichment');
    }
    if (!sendGridConnected) {
      recommendations.push('SendGrid integration is required for email automation and tracking');
    }
    if (!linkedInConnected) {
      recommendations.push('LinkedIn integration enables prospect automation and networking');
    }

    return recommendations;
  }

  /**
   * Get environment variable status (without exposing values)
   */
  getEnvironmentStatus(): {
    variable: string;
    present: boolean;
    description: string;
  }[] {
    const requiredVars = [
      { var: 'APOLLO_API_KEY', desc: 'Apollo.io API key for lead data' },
      { var: 'SENDGRID_API_KEY', desc: 'SendGrid API key for email automation' },
      { var: 'SENDGRID_FROM_EMAIL', desc: 'SendGrid sender email address' },
      { var: 'LINKEDIN_API_KEY', desc: 'LinkedIn API key for automation' },
    ];

    return requiredVars.map(({ var: variable, desc: description }) => ({
      variable,
      present: !!process.env[variable],
      description,
    }));
  }

  /**
   * Test specific service
   */
  async validateService(serviceName: string): Promise<APIValidationResult> {
    switch (serviceName.toLowerCase()) {
      case 'apollo':
      case 'apollo.io':
        return this.validateApollo();
      case 'sendgrid':
        return this.validateSendGrid();
      case 'linkedin':
        return this.validateLinkedIn();
      default:
        throw new Error(`Unknown service: ${serviceName}`);
    }
  }
}

// Export singleton instance
export const apiValidationService = new APIValidationService();
