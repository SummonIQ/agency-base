import { EmailTemplate } from '@prisma/client';

// Template variable types
export interface TemplateVariable {
  key: string;
  label: string;
  description: string;
  category: 'personal' | 'company' | 'job' | 'custom';
  required?: boolean;
  defaultValue?: string;
}

// Template context for variable substitution
export interface TemplateContext {
  // Personal variables
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  
  // Company variables
  company?: string;
  companyDomain?: string;
  industry?: string;
  companySize?: string;
  location?: string;
  
  // Job variables
  jobTitle?: string;
  department?: string;
  seniority?: string;
  
  // Custom variables
  [key: string]: string | number | boolean | undefined;
}

// Template rendering result
export interface TemplateRenderResult {
  subject: string;
  htmlContent: string;
  textContent: string;
  missingVariables: string[];
  usedVariables: string[];
}

// Conditional logic types
export interface ConditionalBlock {
  condition: string;
  content: string;
  elseContent?: string;
}

export class EmailTemplateEngineService {
  // Available template variables
  private static readonly AVAILABLE_VARIABLES: TemplateVariable[] = [
    // Personal variables
    { key: 'firstName', label: 'First Name', description: 'Recipient\'s first name', category: 'personal', required: true },
    { key: 'lastName', label: 'Last Name', description: 'Recipient\'s last name', category: 'personal' },
    { key: 'fullName', label: 'Full Name', description: 'Recipient\'s full name', category: 'personal' },
    { key: 'email', label: 'Email', description: 'Recipient\'s email address', category: 'personal' },
    { key: 'phone', label: 'Phone', description: 'Recipient\'s phone number', category: 'personal' },
    
    // Company variables
    { key: 'company', label: 'Company', description: 'Company name', category: 'company', required: true },
    { key: 'companyDomain', label: 'Company Domain', description: 'Company website domain', category: 'company' },
    { key: 'industry', label: 'Industry', description: 'Company industry', category: 'company' },
    { key: 'companySize', label: 'Company Size', description: 'Number of employees', category: 'company' },
    { key: 'location', label: 'Location', description: 'Company or person location', category: 'company' },
    
    // Job variables
    { key: 'jobTitle', label: 'Job Title', description: 'Current job title', category: 'job' },
    { key: 'department', label: 'Department', description: 'Department or team', category: 'job' },
    { key: 'seniority', label: 'Seniority', description: 'Seniority level', category: 'job' },
    
    // Custom variables
    { key: 'customField1', label: 'Custom Field 1', description: 'Custom variable 1', category: 'custom' },
    { key: 'customField2', label: 'Custom Field 2', description: 'Custom variable 2', category: 'custom' },
    { key: 'customField3', label: 'Custom Field 3', description: 'Custom variable 3', category: 'custom' },
  ];

  /**
   * Get all available template variables
   */
  static getAvailableVariables(): TemplateVariable[] {
    return this.AVAILABLE_VARIABLES;
  }

  /**
   * Get variables by category
   */
  static getVariablesByCategory(category: string): TemplateVariable[] {
    return this.AVAILABLE_VARIABLES.filter(v => v.category === category);
  }

  /**
   * Render a template with the provided context
   */
  static renderTemplate(
    template: Pick<EmailTemplate, 'subject' | 'content' | 'textContent'>,
    context: TemplateContext
  ): TemplateRenderResult {
    const usedVariables: string[] = [];
    const missingVariables: string[] = [];

    // Render subject
    const subject = this.processTemplate(template.subject, context, usedVariables, missingVariables);
    
    // Render HTML content
    const htmlContent = this.processTemplate(template.content, context, usedVariables, missingVariables);
    
    // Render text content (fallback to HTML if not provided)
    const textContent = template.textContent 
      ? this.processTemplate(template.textContent, context, usedVariables, missingVariables)
      : this.htmlToText(htmlContent);

    return {
      subject,
      htmlContent,
      textContent,
      missingVariables: [...new Set(missingVariables)],
      usedVariables: [...new Set(usedVariables)]
    };
  }

  /**
   * Process template string with variable substitution and conditional logic
   */
  private static processTemplate(
    template: string,
    context: TemplateContext,
    usedVariables: string[],
    missingVariables: string[]
  ): string {
    let processed = template;

    // Process conditional blocks first
    processed = this.processConditionalBlocks(processed, context);

    // Process variable substitution
    processed = this.processVariableSubstitution(processed, context, usedVariables, missingVariables);

    return processed;
  }

  /**
   * Process conditional blocks in template
   * Syntax: {{#if variable}}content{{/if}} or {{#if variable}}content{{else}}other{{/if}}
   */
  private static processConditionalBlocks(template: string, context: TemplateContext): string {
    const conditionalRegex = /\{\{#if\s+(\w+)\}\}(.*?)\{\{\/if\}\}/gs;
    const conditionalWithElseRegex = /\{\{#if\s+(\w+)\}\}(.*?)\{\{else\}\}(.*?)\{\{\/if\}\}/gs;

    // Process conditionals with else first
    let processed = template.replace(conditionalWithElseRegex, (match, variable, ifContent, elseContent) => {
      const value = context[variable];
      const hasValue = value !== undefined && value !== null && value !== '';
      return hasValue ? ifContent.trim() : elseContent.trim();
    });

    // Process simple conditionals
    processed = processed.replace(conditionalRegex, (match, variable, content) => {
      const value = context[variable];
      const hasValue = value !== undefined && value !== null && value !== '';
      return hasValue ? content.trim() : '';
    });

    return processed;
  }

  /**
   * Process variable substitution
   * Syntax: {{variable}} or {{variable|default:"Default Value"}}
   */
  private static processVariableSubstitution(
    template: string,
    context: TemplateContext,
    usedVariables: string[],
    missingVariables: string[]
  ): string {
    const variableRegex = /\{\{(\w+)(?:\|default:"([^"]*)")?\}\}/g;

    return template.replace(variableRegex, (match, variable, defaultValue) => {
      usedVariables.push(variable);
      
      const value = context[variable];
      
      if (value !== undefined && value !== null && value !== '') {
        return String(value);
      }
      
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      
      // Check if variable is required
      const variableConfig = this.AVAILABLE_VARIABLES.find(v => v.key === variable);
      if (variableConfig?.required) {
        missingVariables.push(variable);
      }
      
      return `{{${variable}}}`;
    });
  }

  /**
   * Convert HTML to plain text (basic implementation)
   */
  private static htmlToText(html: string): string {
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  }

  /**
   * Validate template syntax
   */
  static validateTemplate(template: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for unclosed conditional blocks
    const ifCount = (template.match(/\{\{#if/g) || []).length;
    const endifCount = (template.match(/\{\{\/if\}\}/g) || []).length;
    
    if (ifCount !== endifCount) {
      errors.push('Unclosed conditional blocks detected');
    }

    // Check for invalid variable syntax
    const invalidVariables = template.match(/\{\{[^}]*[^}]\}/g);
    if (invalidVariables) {
      errors.push('Invalid variable syntax detected');
    }

    // Check for unknown variables
    const variableMatches = template.match(/\{\{(\w+)(?:\|[^}]*)?\}\}/g);
    if (variableMatches) {
      const usedVariables = variableMatches.map(match => {
        const variableMatch = match.match(/\{\{(\w+)/);
        return variableMatch ? variableMatch[1] : '';
      }).filter(Boolean);

      const availableVariableKeys = this.AVAILABLE_VARIABLES.map(v => v.key);
      const unknownVariables = usedVariables.filter(v => !availableVariableKeys.includes(v));
      
      if (unknownVariables.length > 0) {
        errors.push(`Unknown variables: ${unknownVariables.join(', ')}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate sample context for template preview
   */
  static generateSampleContext(): TemplateContext {
    return {
      firstName: 'John',
      lastName: 'Smith',
      fullName: 'John Smith',
      email: 'john.smith@example.com',
      phone: '+1 (555) 123-4567',
      company: 'TechCorp Inc',
      companyDomain: 'techcorp.com',
      industry: 'Technology',
      companySize: '500-1000',
      location: 'San Francisco, CA',
      jobTitle: 'Senior Software Engineer',
      department: 'Engineering',
      seniority: 'Senior',
      customField1: 'Custom Value 1',
      customField2: 'Custom Value 2',
      customField3: 'Custom Value 3'
    };
  }

  /**
   * Extract variables used in a template
   */
  static extractUsedVariables(template: string): string[] {
    const variableRegex = /\{\{(\w+)(?:\|[^}]*)?\}\}/g;
    const variables: string[] = [];
    let match;

    while ((match = variableRegex.exec(template)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }

    return variables;
  }

  /**
   * Get template statistics
   */
  static getTemplateStats(template: Pick<EmailTemplate, 'subject' | 'content' | 'textContent'>): {
    variableCount: number;
    conditionalCount: number;
    estimatedLength: number;
    usedVariables: string[];
  } {
    const fullTemplate = `${template.subject} ${template.content} ${template.textContent || ''}`;
    
    const usedVariables = this.extractUsedVariables(fullTemplate);
    const conditionalCount = (fullTemplate.match(/\{\{#if/g) || []).length;
    const estimatedLength = template.content.replace(/<[^>]*>/g, '').length;

    return {
      variableCount: usedVariables.length,
      conditionalCount,
      estimatedLength,
      usedVariables
    };
  }
}
