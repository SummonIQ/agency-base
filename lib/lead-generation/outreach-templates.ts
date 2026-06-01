import { OutreachTemplate } from './types';

export const EMAIL_TEMPLATES: OutreachTemplate[] = [
  {
    id: 'tech-startup-intro',
    name: 'Tech Startup Introduction',
    type: 'email',
    subject: 'Quick question about {{companyName}}\'s development roadmap',
    content: `Hi {{firstName}},

I noticed {{companyName}} is using {{techStack}} for your platform - impressive tech stack choice for {{industry}} companies.

I'm {{senderName}} from {{agencyName}}. We've helped similar {{industry}} companies like {{similarClient}} scale their development teams and accelerate product delivery by 40-60%.

Given your recent {{recentActivity}}, I imagine you might be looking to:
• Scale your development capacity quickly
• Implement best practices for rapid growth
• Optimize your current tech stack for performance

Would you be open to a brief 15-minute call this week to discuss how we've helped companies in similar situations? I can share some specific examples relevant to your use case.

Best regards,
{{senderName}}

P.S. I saw your recent {{newsItem}} - congratulations! This kind of growth often creates interesting technical challenges that we love solving.`,
    variables: ['firstName', 'companyName', 'techStack', 'industry', 'senderName', 'agencyName', 'similarClient', 'recentActivity', 'newsItem'],
    industry: 'Software',
    companySize: '50-200',
    useCase: 'Initial outreach to tech startups',
    conversionRate: 12.5
  },
  {
    id: 'ecommerce-growth',
    name: 'E-commerce Growth Focus',
    type: 'email',
    subject: 'Scaling {{companyName}}\'s e-commerce platform',
    content: `Hi {{firstName}},

{{companyName}}'s growth in the {{industry}} space has been impressive - I've been following your journey since {{foundedYear}}.

I'm {{senderName}} from {{agencyName}}. We specialize in helping e-commerce companies optimize their platforms for scale. Our recent client {{similarClient}} saw a 3x increase in conversion rates and 50% reduction in page load times after our optimization work.

With your current growth trajectory, you might be experiencing:
• Performance bottlenecks during peak traffic
• Need for advanced analytics and personalization
• Integration challenges with new tools and platforms

I'd love to share how we've solved similar challenges for companies at your stage. Would you have 15 minutes this week for a quick call?

Looking forward to connecting,
{{senderName}}

P.S. Your {{recentFeature}} feature caught my attention - we've implemented similar solutions that drove significant engagement increases.`,
    variables: ['firstName', 'companyName', 'industry', 'foundedYear', 'senderName', 'agencyName', 'similarClient', 'recentFeature'],
    industry: 'E-commerce',
    companySize: '200-500',
    useCase: 'E-commerce platform optimization',
    conversionRate: 15.2
  },
  {
    id: 'follow-up-no-response',
    name: 'Follow-up - No Response',
    type: 'email',
    subject: 'Re: {{originalSubject}}',
    content: `Hi {{firstName}},

I know you're busy scaling {{companyName}}, so I'll keep this brief.

My previous email was about helping {{industry}} companies like yours optimize their development processes. Since then, I've been working with {{newClient}} on a similar challenge and thought you might find their results interesting:

• 60% faster feature deployment
• 40% reduction in technical debt
• 25% improvement in team productivity

If this resonates with challenges you're facing, I'd be happy to share more details in a quick 10-minute call.

If now isn't the right time, no worries - I'll check back in a few months.

Best,
{{senderName}}`,
    variables: ['firstName', 'companyName', 'industry', 'originalSubject', 'newClient', 'senderName'],
    useCase: 'First follow-up after no response',
    conversionRate: 8.3
  },
  {
    id: 'linkedin-connection',
    name: 'LinkedIn Connection Request',
    type: 'linkedin',
    content: `Hi {{firstName}}, I noticed we're both in the {{industry}} space. I'd love to connect and share insights about scaling development teams. I've been following {{companyName}}'s growth - impressive work!`,
    variables: ['firstName', 'industry', 'companyName'],
    useCase: 'LinkedIn connection request',
    conversionRate: 35.0
  },
  {
    id: 'linkedin-follow-up',
    name: 'LinkedIn Follow-up Message',
    type: 'linkedin',
    content: `Thanks for connecting, {{firstName}}! 

I see {{companyName}} is using {{techStack}} - we've helped several {{industry}} companies optimize similar tech stacks for scale. 

Would you be interested in a brief call to discuss how we've helped companies like {{similarClient}} accelerate their development velocity? I can share some specific examples that might be relevant to your current challenges.`,
    variables: ['firstName', 'companyName', 'techStack', 'industry', 'similarClient'],
    useCase: 'LinkedIn follow-up after connection',
    conversionRate: 18.7
  },
  {
    id: 'value-first-approach',
    name: 'Value-First Approach',
    type: 'email',
    subject: 'Free development audit for {{companyName}}',
    content: `Hi {{firstName}},

I've been researching {{industry}} companies using {{techStack}} and noticed some common optimization opportunities that could significantly impact performance and costs.

Rather than pitch our services, I'd like to offer {{companyName}} a complimentary 30-minute development audit where I'll:

• Review your current architecture for potential bottlenecks
• Identify 3-5 quick wins for performance improvement  
• Share best practices we've learned from similar companies
• Provide actionable recommendations (no strings attached)

This audit typically uncovers $10-50K in potential savings through optimization alone.

Would next Tuesday or Wednesday work for a brief call?

Best regards,
{{senderName}}
{{agencyName}}

P.S. I'll send you our "{{industry}} Development Optimization Checklist" regardless - it's helped companies like {{similarClient}} identify critical improvements.`,
    variables: ['firstName', 'companyName', 'industry', 'techStack', 'senderName', 'agencyName', 'similarClient'],
    useCase: 'Value-first approach with free audit',
    conversionRate: 22.1
  }
];

export const LINKEDIN_TEMPLATES: OutreachTemplate[] = EMAIL_TEMPLATES.filter(t => t.type === 'linkedin');

export class OutreachTemplateEngine {
  /**
   * Generate personalized message from template
   */
  generateMessage(
    template: OutreachTemplate, 
    variables: Record<string, string>
  ): { subject?: string; content: string; missingVariables: string[] } {
    const missingVariables: string[] = [];
    
    // Check for missing required variables
    template.variables.forEach(variable => {
      if (!variables[variable]) {
        missingVariables.push(variable);
      }
    });
    
    let content = template.content;
    let subject = template.subject;
    
    // Replace variables in content
    template.variables.forEach(variable => {
      const value = variables[variable] || `[${variable}]`;
      content = content.replace(new RegExp(`{{${variable}}}`, 'g'), value);
    });
    
    // Replace variables in subject
    if (subject) {
      template.variables.forEach(variable => {
        const value = variables[variable] || `[${variable}]`;
        subject = subject!.replace(new RegExp(`{{${variable}}}`, 'g'), value);
      });
    }
    
    return {
      subject,
      content,
      missingVariables
    };
  }

  /**
   * Get templates by criteria
   */
  getTemplates(criteria?: {
    type?: 'email' | 'linkedin';
    industry?: string;
    companySize?: string;
    useCase?: string;
  }): OutreachTemplate[] {
    let templates = EMAIL_TEMPLATES;
    
    if (criteria?.type) {
      templates = templates.filter(t => t.type === criteria.type);
    }
    
    if (criteria?.industry) {
      templates = templates.filter(t => 
        !t.industry || t.industry === criteria.industry
      );
    }
    
    if (criteria?.companySize) {
      templates = templates.filter(t => 
        !t.companySize || t.companySize === criteria.companySize
      );
    }
    
    if (criteria?.useCase) {
      templates = templates.filter(t => 
        t.useCase.toLowerCase().includes(criteria.useCase!.toLowerCase())
      );
    }
    
    return templates.sort((a, b) => (b.conversionRate || 0) - (a.conversionRate || 0));
  }

  /**
   * Get best performing template for criteria
   */
  getBestTemplate(criteria: {
    type: 'email' | 'linkedin';
    industry?: string;
    companySize?: string;
    useCase?: string;
  }): OutreachTemplate | null {
    const templates = this.getTemplates(criteria);
    return templates.length > 0 ? templates[0] : null;
  }

  /**
   * Generate variables from prospect data
   */
  generateVariablesFromProspect(
    company: any,
    contact: any,
    senderInfo: {
      name: string;
      agencyName: string;
      similarClient?: string;
    }
  ): Record<string, string> {
    return {
      firstName: contact.firstName || 'there',
      lastName: contact.lastName || '',
      companyName: company.name || 'your company',
      industry: company.industry || 'your industry',
      techStack: company.techStack?.slice(0, 3).join(', ') || 'modern technologies',
      foundedYear: company.foundedYear?.toString() || 'recent years',
      senderName: senderInfo.name,
      agencyName: senderInfo.agencyName,
      similarClient: senderInfo.similarClient || 'a similar company',
      recentActivity: company.funding?.lastRound ? `Series ${company.funding.stage} funding` : 'recent growth',
      newsItem: 'recent company updates',
      recentFeature: 'latest product updates',
      newClient: 'another client',
      originalSubject: 'our previous conversation'
    };
  }
}

export const outreachTemplateEngine = new OutreachTemplateEngine();
