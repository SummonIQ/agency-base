export interface EnvironmentConfig {
  service: string;
  variables: EnvironmentVariable[];
  priority: 'high' | 'medium' | 'low';
  description: string;
  setupUrl?: string;
  estimatedTime: string;
  revenueImpact: string;
}

export interface EnvironmentVariable {
  key: string;
  description: string;
  example: string;
  required: boolean;
  sensitive: boolean;
  validation?: RegExp;
}

export const ENVIRONMENT_CONFIGS: EnvironmentConfig[] = [
  {
    service: 'SendGrid',
    priority: 'high',
    description: 'Email delivery and automation service',
    setupUrl: 'https://sendgrid.com/solutions/email-api/',
    estimatedTime: '10 minutes',
    revenueImpact: '$10K-50K/month',
    variables: [
      {
        key: 'SENDGRID_API_KEY',
        description: 'SendGrid API key for email delivery',
        example: 'SG.your_api_key_here',
        required: true,
        sensitive: true,
        validation: /^SG\./
      },
      {
        key: 'SENDGRID_FROM_EMAIL',
        description: 'Default sender email address',
        example: 'noreply@yourdomain.com',
        required: true,
        sensitive: false,
        validation: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      },
      {
        key: 'SENDGRID_FROM_NAME',
        description: 'Default sender name',
        example: 'Your Company Name',
        required: false,
        sensitive: false
      }
    ]
  },
  {
    service: 'Apollo.io',
    priority: 'high',
    description: 'Lead data and enrichment service',
    setupUrl: 'https://apollo.io/api',
    estimatedTime: '5 minutes',
    revenueImpact: '$5K-25K/month',
    variables: [
      {
        key: 'APOLLO_API_KEY',
        description: 'Apollo.io API key for lead data',
        example: 'your_apollo_api_key_here',
        required: true,
        sensitive: true
      },
      {
        key: 'APOLLO_BASE_URL',
        description: 'Apollo.io API base URL',
        example: 'https://api.apollo.io/v1',
        required: false,
        sensitive: false
      }
    ]
  },
  {
    service: 'LinkedIn',
    priority: 'medium',
    description: 'LinkedIn automation and sourcing',
    setupUrl: 'https://developer.linkedin.com/',
    estimatedTime: '15 minutes',
    revenueImpact: '$15K-75K/month',
    variables: [
      {
        key: 'LINKEDIN_CLIENT_ID',
        description: 'LinkedIn OAuth client ID',
        example: 'your_linkedin_client_id',
        required: true,
        sensitive: true
      },
      {
        key: 'LINKEDIN_CLIENT_SECRET',
        description: 'LinkedIn OAuth client secret',
        example: 'your_linkedin_client_secret',
        required: true,
        sensitive: true
      },
      {
        key: 'LINKEDIN_REDIRECT_URI',
        description: 'OAuth redirect URI',
        example: 'http://localhost:3100/api/auth/linkedin/callback',
        required: false,
        sensitive: false
      }
    ]
  },
  {
    service: 'Database',
    priority: 'high',
    description: 'PostgreSQL database connection',
    setupUrl: 'https://www.postgresql.org/',
    estimatedTime: '2 minutes',
    revenueImpact: 'Required',
    variables: [
      {
        key: 'DATABASE_URL',
        description: 'PostgreSQL connection string',
        example: 'postgresql://username:password@localhost:5440/database_name',
        required: true,
        sensitive: true,
        validation: /^postgresql:\/\//
      },
      {
        key: 'POSTGRES_USER',
        description: 'PostgreSQL username',
        example: 'your_username',
        required: false,
        sensitive: false
      },
      {
        key: 'POSTGRES_PASSWORD',
        description: 'PostgreSQL password',
        example: 'your_password',
        required: false,
        sensitive: true
      },
      {
        key: 'POSTGRES_DB',
        description: 'PostgreSQL database name',
        example: 'agency_base',
        required: false,
        sensitive: false
      }
    ]
  },
  {
    service: 'Authentication',
    priority: 'high',
    description: 'User authentication and security',
    setupUrl: 'https://next-auth.js.org/',
    estimatedTime: '5 minutes',
    revenueImpact: 'Security',
    variables: [
      {
        key: 'NEXTAUTH_SECRET',
        description: 'NextAuth.js secret for JWT signing',
        example: 'your_nextauth_secret_here',
        required: true,
        sensitive: true
      },
      {
        key: 'NEXTAUTH_URL',
        description: 'Application base URL',
        example: 'http://localhost:3100',
        required: true,
        sensitive: false,
        validation: /^https?:\/\//
      },
      {
        key: 'JWT_SECRET',
        description: 'JWT secret for token signing',
        example: 'your_jwt_secret_here',
        required: true,
        sensitive: true
      }
    ]
  }
];

export class EnvironmentSetupService {
  /**
   * Generate environment file content
   */
  generateEnvironmentFile(): string {
    let content = '# Agency Base - Environment Configuration\n';
    content += '# Copy this file to .env.local and fill in your API keys\n\n';

    ENVIRONMENT_CONFIGS.forEach(config => {
      content += `# ${config.service} - ${config.description}\n`;
      content += `# Priority: ${config.priority.toUpperCase()}\n`;
      content += `# Setup: ${config.setupUrl || 'Manual configuration'}\n`;
      content += `# Revenue Impact: ${config.revenueImpact}\n`;
      
      config.variables.forEach(variable => {
        content += `# ${variable.description}\n`;
        if (variable.required) {
          content += `${variable.key}=${variable.example}\n`;
        } else {
          content += `# ${variable.key}=${variable.example}\n`;
        }
      });
      
      content += '\n';
    });

    return content;
  }

  /**
   * Validate environment variable
   */
  validateVariable(key: string, value: string): { valid: boolean; error?: string } {
    const variable = this.findVariable(key);
    if (!variable) {
      return { valid: false, error: 'Unknown environment variable' };
    }

    if (variable.required && !value) {
      return { valid: false, error: 'This variable is required' };
    }

    if (variable.validation && value && !variable.validation.test(value)) {
      return { valid: false, error: 'Invalid format' };
    }

    return { valid: true };
  }

  /**
   * Find variable configuration
   */
  private findVariable(key: string): EnvironmentVariable | undefined {
    for (const config of ENVIRONMENT_CONFIGS) {
      const variable = config.variables.find(v => v.key === key);
      if (variable) return variable;
    }
    return undefined;
  }

  /**
   * Get setup instructions for a service
   */
  getSetupInstructions(serviceName: string): string {
    const config = ENVIRONMENT_CONFIGS.find(c => 
      c.service.toLowerCase() === serviceName.toLowerCase()
    );
    
    if (!config) return 'Service not found';

    let instructions = `## ${config.service} Setup\n\n`;
    instructions += `**Priority:** ${config.priority.toUpperCase()}\n`;
    instructions += `**Estimated Time:** ${config.estimatedTime}\n`;
    instructions += `**Revenue Impact:** ${config.revenueImpact}\n\n`;
    
    if (config.setupUrl) {
      instructions += `**Setup URL:** ${config.setupUrl}\n\n`;
    }

    instructions += '**Required Variables:**\n';
    config.variables.filter(v => v.required).forEach(variable => {
      instructions += `- \`${variable.key}\`: ${variable.description}\n`;
    });

    if (config.variables.some(v => !v.required)) {
      instructions += '\n**Optional Variables:**\n';
      config.variables.filter(v => !v.required).forEach(variable => {
        instructions += `- \`${variable.key}\`: ${variable.description}\n`;
      });
    }

    return instructions;
  }

  /**
   * Get configuration status
   */
  getConfigurationStatus(): {
    configured: number;
    total: number;
    missing: string[];
    percentage: number;
  } {
    const requiredVariables = ENVIRONMENT_CONFIGS.flatMap(config =>
      config.variables.filter(v => v.required).map(v => v.key)
    );

    const configured = requiredVariables.filter(key => 
      process.env[key] && process.env[key] !== ''
    );

    const missing = requiredVariables.filter(key => 
      !process.env[key] || process.env[key] === ''
    );

    return {
      configured: configured.length,
      total: requiredVariables.length,
      missing,
      percentage: (configured.length / requiredVariables.length) * 100
    };
  }

  /**
   * Generate secrets
   */
  generateSecrets(): Record<string, string> {
    const crypto = require('crypto');
    
    return {
      NEXTAUTH_SECRET: crypto.randomBytes(32).toString('base64'),
      JWT_SECRET: crypto.randomBytes(64).toString('base64')
    };
  }
}

export const environmentSetupService = new EnvironmentSetupService();
