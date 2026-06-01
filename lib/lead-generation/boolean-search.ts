/**
 * Boolean Search Engine for Lead Generation
 * Supports LinkedIn-style boolean operators for targeted prospect discovery
 */

export interface BooleanSearchOperators {
  AND: string[];
  OR: string[];
  NOT: string[];
  QUOTED: string[];
  PARENTHESES: BooleanSearchQuery[];
}

export interface BooleanSearchQuery {
  raw: string;
  parsed: BooleanSearchOperators;
  targets: {
    jobTitles?: BooleanSearchOperators;
    companies?: BooleanSearchOperators;
    industries?: BooleanSearchOperators;
    keywords?: BooleanSearchOperators;
    skills?: BooleanSearchOperators;
    locations?: BooleanSearchOperators;
  };
}

export interface SearchTarget {
  field: 'jobTitle' | 'company' | 'industry' | 'keywords' | 'skills' | 'location';
  value: string;
}

/**
 * Boolean search parser and query builder
 * Converts natural language boolean queries into structured search criteria
 */
export class BooleanSearchEngine {
  private readonly operators = {
    AND: ['AND', '&', '+'],
    OR: ['OR', '|'],
    NOT: ['NOT', '-', '!'],
    QUOTE: ['"', "'"],
    PAREN_OPEN: ['('],
    PAREN_CLOSE: [')']
  };

  /**
   * Parse boolean search string into structured query
   */
  parseQuery(searchString: string): BooleanSearchQuery {
    const cleaned = this.cleanQuery(searchString);
    const tokens = this.tokenize(cleaned);
    const parsed = this.parse(tokens);

    return {
      raw: searchString,
      parsed,
      targets: this.extractTargets(parsed)
    };
  }

  /**
   * Build search criteria for different providers based on boolean query
   */
  buildSearchCriteria(query: BooleanSearchQuery): {
    apollo: any;
    zoominfo: any;
    general: any;
  } {
    return {
      apollo: this.buildApolloQuery(query),
      zoominfo: this.buildZoomInfoQuery(query),
      general: this.buildGeneralQuery(query)
    };
  }

  /**
   * Clean and normalize query string
   */
  private cleanQuery(query: string): string {
    return query
      .trim()
      .replace(/\s+/g, ' ') // Multiple spaces to single
      .replace(/(\(|\))/g, ' $1 ') // Add spaces around parentheses
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Tokenize query string into meaningful parts
   */
  private tokenize(query: string): string[] {
    const tokens: string[] = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';

    for (let i = 0; i < query.length; i++) {
      const char = query[i];

      if (!inQuotes && this.operators.QUOTE.includes(char)) {
        if (current.trim()) {
          tokens.push(current.trim());
          current = '';
        }
        inQuotes = true;
        quoteChar = char;
        current += char;
      } else if (inQuotes && char === quoteChar) {
        current += char;
        tokens.push(current);
        current = '';
        inQuotes = false;
        quoteChar = '';
      } else if (inQuotes) {
        current += char;
      } else if (char === ' ') {
        if (current.trim()) {
          tokens.push(current.trim());
          current = '';
        }
      } else {
        current += char;
      }
    }

    if (current.trim()) {
      tokens.push(current.trim());
    }

    return tokens;
  }

  /**
   * Parse tokens into boolean operators structure
   */
  private parse(tokens: string[]): BooleanSearchOperators {
    const result: BooleanSearchOperators = {
      AND: [],
      OR: [],
      NOT: [],
      QUOTED: [],
      PARENTHESES: []
    };

    let currentGroup: string[] = [];
    let currentOperator = 'AND'; // Default operator
    let i = 0;

    while (i < tokens.length) {
      const token = tokens[i];

      if (this.isOperator(token, 'AND')) {
        this.flushGroup(result, currentGroup, currentOperator);
        currentOperator = 'AND';
        currentGroup = [];
      } else if (this.isOperator(token, 'OR')) {
        this.flushGroup(result, currentGroup, currentOperator);
        currentOperator = 'OR';
        currentGroup = [];
      } else if (this.isOperator(token, 'NOT')) {
        this.flushGroup(result, currentGroup, currentOperator);
        currentOperator = 'NOT';
        currentGroup = [];
      } else if (token.startsWith('(')) {
        // Handle parentheses - find matching closing
        const parenGroup = this.extractParenthesesGroup(tokens, i);
        if (parenGroup.tokens.length > 0) {
          const nestedQuery = this.parse(parenGroup.tokens);
          result.PARENTHESES.push({
            raw: parenGroup.raw,
            parsed: nestedQuery,
            targets: this.extractTargets(nestedQuery)
          });
        }
        i = parenGroup.endIndex;
      } else if (this.isQuoted(token)) {
        result.QUOTED.push(this.removeQuotes(token));
      } else {
        currentGroup.push(token);
      }

      i++;
    }

    // Flush remaining group
    this.flushGroup(result, currentGroup, currentOperator);

    return result;
  }

  /**
   * Extract field-specific targets from parsed query
   */
  private extractTargets(parsed: BooleanSearchOperators): BooleanSearchQuery['targets'] {
    const targets: BooleanSearchQuery['targets'] = {};

    // Combine all terms for analysis
    const allTerms = [
      ...parsed.AND,
      ...parsed.OR,
      ...parsed.NOT,
      ...parsed.QUOTED
    ];

    // Job title keywords
    const jobTitleKeywords = this.extractJobTitleKeywords(allTerms);
    if (jobTitleKeywords.length > 0) {
      targets.jobTitles = this.createTargetOperators(jobTitleKeywords, parsed);
    }

    // Company keywords
    const companyKeywords = this.extractCompanyKeywords(allTerms);
    if (companyKeywords.length > 0) {
      targets.companies = this.createTargetOperators(companyKeywords, parsed);
    }

    // Industry keywords
    const industryKeywords = this.extractIndustryKeywords(allTerms);
    if (industryKeywords.length > 0) {
      targets.industries = this.createTargetOperators(industryKeywords, parsed);
    }

    // Skills and keywords
    const skillKeywords = this.extractSkillKeywords(allTerms);
    if (skillKeywords.length > 0) {
      targets.skills = this.createTargetOperators(skillKeywords, parsed);
    }

    // Location keywords
    const locationKeywords = this.extractLocationKeywords(allTerms);
    if (locationKeywords.length > 0) {
      targets.locations = this.createTargetOperators(locationKeywords, parsed);
    }

    // General keywords (anything not categorized)
    const generalKeywords = allTerms.filter(term =>
      !jobTitleKeywords.includes(term) &&
      !companyKeywords.includes(term) &&
      !industryKeywords.includes(term) &&
      !skillKeywords.includes(term) &&
      !locationKeywords.includes(term)
    );

    if (generalKeywords.length > 0) {
      targets.keywords = this.createTargetOperators(generalKeywords, parsed);
    }

    return targets;
  }

  /**
   * Create operator structure for specific target terms
   */
  private createTargetOperators(terms: string[], original: BooleanSearchOperators): BooleanSearchOperators {
    return {
      AND: terms.filter(term => original.AND.includes(term)),
      OR: terms.filter(term => original.OR.includes(term)),
      NOT: terms.filter(term => original.NOT.includes(term)),
      QUOTED: terms.filter(term => original.QUOTED.includes(term)),
      PARENTHESES: []
    };
  }

  /**
   * Extract job title related keywords
   */
  private extractJobTitleKeywords(terms: string[]): string[] {
    const jobTitleTerms = [
      'CEO', 'CTO', 'CIO', 'CMO', 'CFO', 'VP', 'Director', 'Manager', 'Lead', 'Head',
      'Senior', 'Junior', 'Principal', 'Staff', 'Engineer', 'Developer', 'Designer',
      'Product', 'Marketing', 'Sales', 'Operations', 'Finance', 'HR', 'Legal',
      'Consultant', 'Analyst', 'Specialist', 'Coordinator', 'Administrator',
      'Founder', 'Owner', 'President', 'Executive', 'Officer'
    ];

    return terms.filter(term =>
      jobTitleTerms.some(jobTerm =>
        term.toLowerCase().includes(jobTerm.toLowerCase()) ||
        jobTerm.toLowerCase().includes(term.toLowerCase())
      )
    );
  }

  /**
   * Extract company related keywords
   */
  private extractCompanyKeywords(terms: string[]): string[] {
    const companyTerms = [
      'Inc', 'Corp', 'LLC', 'Ltd', 'Company', 'Technologies', 'Tech', 'Software',
      'Solutions', 'Services', 'Group', 'Systems', 'Labs', 'Studios'
    ];

    return terms.filter(term =>
      companyTerms.some(companyTerm =>
        term.toLowerCase().includes(companyTerm.toLowerCase())
      ) ||
      term.length > 6 && term.match(/^[A-Z][a-z]+(?:[A-Z][a-z]+)*$/) // PascalCase company names
    );
  }

  /**
   * Extract industry related keywords
   */
  private extractIndustryKeywords(terms: string[]): string[] {
    const industryTerms = [
      'Software', 'Technology', 'Healthcare', 'Finance', 'Fintech', 'Banking',
      'Insurance', 'Real Estate', 'Education', 'E-commerce', 'Retail', 'Manufacturing',
      'Automotive', 'Energy', 'Media', 'Entertainment', 'Gaming', 'SaaS', 'AI',
      'Machine Learning', 'Blockchain', 'Cybersecurity', 'Cloud', 'Mobile'
    ];

    return terms.filter(term =>
      industryTerms.some(industryTerm =>
        term.toLowerCase().includes(industryTerm.toLowerCase())
      )
    );
  }

  /**
   * Extract skill related keywords
   */
  private extractSkillKeywords(terms: string[]): string[] {
    const skillTerms = [
      'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'AWS', 'Docker',
      'Kubernetes', 'SQL', 'MongoDB', 'PostgreSQL', 'Git', 'Agile', 'Scrum',
      'REST', 'API', 'GraphQL', 'TypeScript', 'Vue.js', 'Angular', 'PHP',
      'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin', 'C++', 'C#', '.NET'
    ];

    return terms.filter(term =>
      skillTerms.some(skillTerm =>
        term.toLowerCase() === skillTerm.toLowerCase() ||
        term.toLowerCase().includes(skillTerm.toLowerCase())
      )
    );
  }

  /**
   * Extract location related keywords
   */
  private extractLocationKeywords(terms: string[]): string[] {
    const locationTerms = [
      'San Francisco', 'New York', 'Seattle', 'Austin', 'Boston', 'Chicago',
      'Los Angeles', 'Denver', 'Atlanta', 'Dallas', 'Miami', 'Portland',
      'Remote', 'California', 'Texas', 'Florida', 'Washington', 'Oregon',
      'NYC', 'SF', 'LA', 'DC', 'UK', 'London', 'Berlin', 'Toronto', 'Vancouver'
    ];

    return terms.filter(term =>
      locationTerms.some(locationTerm =>
        term.toLowerCase().includes(locationTerm.toLowerCase()) ||
        locationTerm.toLowerCase().includes(term.toLowerCase())
      )
    );
  }

  /**
   * Build Apollo.io specific query
   */
  private buildApolloQuery(query: BooleanSearchQuery): any {
    const criteria: any = {};

    if (query.targets.jobTitles) {
      criteria.person_titles = this.combineTerms(query.targets.jobTitles);
    }

    if (query.targets.companies) {
      criteria.organization_names = this.combineTerms(query.targets.companies);
    }

    if (query.targets.industries) {
      criteria.organization_industry_tag_ids = this.combineTerms(query.targets.industries);
    }

    if (query.targets.locations) {
      criteria.person_locations = this.combineTerms(query.targets.locations);
    }

    if (query.targets.skills || query.targets.keywords) {
      const skills = query.targets.skills ? this.combineTerms(query.targets.skills) : [];
      const keywords = query.targets.keywords ? this.combineTerms(query.targets.keywords) : [];
      criteria.keywords = [...skills, ...keywords];
    }

    return criteria;
  }

  /**
   * Build ZoomInfo specific query
   */
  private buildZoomInfoQuery(query: BooleanSearchQuery): any {
    const criteria: any = {};

    if (query.targets.jobTitles) {
      criteria.jobTitle = this.combineTermsWithOperators(query.targets.jobTitles);
    }

    if (query.targets.companies) {
      criteria.companyName = this.combineTermsWithOperators(query.targets.companies);
    }

    if (query.targets.industries) {
      criteria.industry = this.combineTermsWithOperators(query.targets.industries);
    }

    if (query.targets.locations) {
      criteria.location = this.combineTermsWithOperators(query.targets.locations);
    }

    if (query.targets.skills) {
      criteria.techStack = this.combineTerms(query.targets.skills);
    }

    return criteria;
  }

  /**
   * Build general search criteria
   */
  private buildGeneralQuery(query: BooleanSearchQuery): any {
    const criteria: any = {
      includeTerms: [],
      excludeTerms: [],
      exactPhrases: [],
      optionalTerms: []
    };

    criteria.includeTerms = query.parsed.AND;
    criteria.excludeTerms = query.parsed.NOT;
    criteria.exactPhrases = query.parsed.QUOTED;
    criteria.optionalTerms = query.parsed.OR;

    return criteria;
  }

  /**
   * Helper methods
   */
  private isOperator(token: string, type: 'AND' | 'OR' | 'NOT'): boolean {
    return this.operators[type].includes(token.toUpperCase());
  }

  private isQuoted(token: string): boolean {
    return (token.startsWith('"') && token.endsWith('"')) ||
           (token.startsWith("'") && token.endsWith("'"));
  }

  private removeQuotes(token: string): string {
    return token.slice(1, -1);
  }

  private flushGroup(result: BooleanSearchOperators, group: string[], operator: string): void {
    if (group.length > 0) {
      result[operator as keyof BooleanSearchOperators].push(...group);
    }
  }

  private extractParenthesesGroup(tokens: string[], startIndex: number): {
    tokens: string[];
    raw: string;
    endIndex: number;
  } {
    let depth = 0;
    let endIndex = startIndex;
    const groupTokens: string[] = [];

    for (let i = startIndex; i < tokens.length; i++) {
      const token = tokens[i];

      if (token.includes('(')) depth++;
      if (token.includes(')')) depth--;

      if (depth === 0 && i > startIndex) {
        endIndex = i;
        break;
      }

      if (i > startIndex || !token.startsWith('(')) {
        groupTokens.push(token.replace(/^\(|\)$/g, ''));
      }
    }

    return {
      tokens: groupTokens,
      raw: tokens.slice(startIndex, endIndex + 1).join(' '),
      endIndex
    };
  }

  private combineTerms(operators: BooleanSearchOperators): string[] {
    return [
      ...operators.AND,
      ...operators.OR,
      ...operators.QUOTED,
      // Note: NOT terms are excluded from positive matches
    ];
  }

  private combineTermsWithOperators(operators: BooleanSearchOperators): string {
    const parts: string[] = [];

    if (operators.AND.length > 0) {
      parts.push(operators.AND.join(' AND '));
    }

    if (operators.OR.length > 0) {
      parts.push(`(${operators.OR.join(' OR ')})`);
    }

    if (operators.QUOTED.length > 0) {
      parts.push(...operators.QUOTED.map(term => `"${term}"`));
    }

    if (operators.NOT.length > 0) {
      parts.push(...operators.NOT.map(term => `NOT ${term}`));
    }

    return parts.join(' AND ');
  }
}

/**
 * Pre-built boolean search templates for common use cases
 */
export class BooleanSearchTemplates {
  static readonly TECH_LEADERSHIP = '(CTO OR "Chief Technology Officer" OR "VP Engineering" OR "Engineering Director") AND (startup OR scale-up OR growth) NOT consultant';

  static readonly PRODUCT_MANAGERS = '"Product Manager" OR "Product Lead" OR "Head of Product" AND (SaaS OR software OR tech) AND (remote OR "San Francisco" OR "New York")';

  static readonly SALES_LEADERS = '("VP Sales" OR "Sales Director" OR "Head of Sales") AND B2B AND (software OR SaaS) NOT agency';

  static readonly MARKETING_EXECUTIVES = '(CMO OR "Marketing Director" OR "VP Marketing") AND (digital OR growth OR performance) AND startup';

  static readonly FRONTEND_DEVELOPERS = '("Frontend Developer" OR "Front-end Developer" OR "UI Developer") AND (React OR Vue OR Angular) AND (remote OR "San Francisco")';

  static readonly DATA_SCIENTISTS = '"Data Scientist" OR "ML Engineer" OR "Machine Learning" AND (Python OR R OR TensorFlow) NOT intern';

  static readonly HEALTHCARE_IT = '("CTO" OR "IT Director") AND (healthcare OR medical OR hospital) AND (cloud OR security OR HIPAA)';

  static readonly FINTECH_EXECUTIVES = '(CEO OR founder OR "VP Product") AND fintech AND (payments OR banking OR cryptocurrency)';

  static readonly ECOMMERCE_LEADERS = '("E-commerce Director" OR "Digital Commerce" OR "Online Retail") AND (Shopify OR Magento OR WooCommerce)';

  static readonly CYBERSECURITY_EXPERTS = '("Security Engineer" OR "InfoSec" OR CISO) AND (penetration OR vulnerability OR compliance)';

  /**
   * Get all available templates
   */
  static getAllTemplates(): Record<string, string> {
    return {
      TECH_LEADERSHIP: this.TECH_LEADERSHIP,
      PRODUCT_MANAGERS: this.PRODUCT_MANAGERS,
      SALES_LEADERS: this.SALES_LEADERS,
      MARKETING_EXECUTIVES: this.MARKETING_EXECUTIVES,
      FRONTEND_DEVELOPERS: this.FRONTEND_DEVELOPERS,
      DATA_SCIENTISTS: this.DATA_SCIENTISTS,
      HEALTHCARE_IT: this.HEALTHCARE_IT,
      FINTECH_EXECUTIVES: this.FINTECH_EXECUTIVES,
      ECOMMERCE_LEADERS: this.ECOMMERCE_LEADERS,
      CYBERSECURITY_EXPERTS: this.CYBERSECURITY_EXPERTS
    };
  }

  /**
   * Generate custom template based on parameters
   */
  static generateCustom(params: {
    jobTitles: string[];
    industries?: string[];
    skills?: string[];
    locations?: string[];
    exclude?: string[];
  }): string {
    const parts: string[] = [];

    // Job titles (OR relationship)
    if (params.jobTitles.length > 0) {
      const titles = params.jobTitles.map(title =>
        title.includes(' ') ? `"${title}"` : title
      );
      parts.push(`(${titles.join(' OR ')})`);
    }

    // Industries (AND relationship)
    if (params.industries && params.industries.length > 0) {
      parts.push(`AND (${params.industries.join(' OR ')})`);
    }

    // Skills (AND relationship)
    if (params.skills && params.skills.length > 0) {
      parts.push(`AND (${params.skills.join(' OR ')})`);
    }

    // Locations (OR relationship)
    if (params.locations && params.locations.length > 0) {
      const locations = params.locations.map(location =>
        location.includes(' ') ? `"${location}"` : location
      );
      parts.push(`AND (${locations.join(' OR ')})`);
    }

    // Exclusions
    if (params.exclude && params.exclude.length > 0) {
      const exclusions = params.exclude.map(term => `NOT ${term}`);
      parts.push(exclusions.join(' '));
    }

    return parts.join(' ').replace(/^AND\s+/, '');
  }
}