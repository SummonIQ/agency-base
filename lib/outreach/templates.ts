export interface OutreachTemplateDefinition {
  id: string;
  name: string;
  type: string;
  subject?: string;
  content: string;
  variables: string[];
  description: string;
  category: 'cold_outreach' | 'follow_up' | 'nurturing' | 'proposal' | 'social';
}

export const defaultOutreachTemplates: OutreachTemplateDefinition[] = [
  // Cold Outreach
  {
    id: 'cold-email-introduction',
    name: 'Cold Email - Introduction',
    type: 'cold_email',
    category: 'cold_outreach',
    subject: 'Quick question about {{company_name}}\'s digital strategy',
    content: `Hi {{first_name}},

I hope this email finds you well. I came across {{company_name}} and was impressed by {{specific_detail}}.

I'm {{your_name}}, and I help companies like yours {{value_proposition}}. I noticed that {{pain_point_observation}}, and I believe we could help you {{solution_preview}}.

Would you be open to a brief 15-minute conversation this week to discuss how we've helped similar companies achieve {{specific_result}}?

I'd be happy to share some case studies relevant to your industry.

Best regards,
{{your_name}}
{{your_title}}
{{company_name}}
{{phone}}`,
    variables: [
      'first_name',
      'company_name', 
      'specific_detail',
      'your_name',
      'value_proposition',
      'pain_point_observation',
      'solution_preview',
      'specific_result',
      'your_title',
      'phone'
    ],
    description: 'Professional introduction email for cold outreach to potential clients'
  },
  
  {
    id: 'cold-email-referral',
    name: 'Cold Email - Referral',
    type: 'cold_email',
    category: 'cold_outreach',
    subject: '{{referrer_name}} suggested I reach out',
    content: `Hi {{first_name}},

{{referrer_name}} from {{referrer_company}} suggested I reach out to you. They mentioned you might be interested in {{service_area}}.

I'm {{your_name}} from {{company_name}}, and we specialize in {{expertise_area}}. We recently helped {{referrer_company}} {{specific_achievement}}, and {{referrer_name}} thought our approach might be valuable for {{prospect_company}}.

Would you be interested in a brief conversation to explore how we might be able to help {{prospect_company}} {{potential_benefit}}?

I'd be happy to share the case study from our work with {{referrer_company}} if that would be helpful.

Best regards,
{{your_name}}
{{your_title}}
{{company_name}}`,
    variables: [
      'first_name',
      'referrer_name',
      'referrer_company',
      'service_area',
      'your_name',
      'company_name',
      'expertise_area',
      'specific_achievement',
      'prospect_company',
      'potential_benefit',
      'your_title'
    ],
    description: 'Warm introduction email leveraging a mutual connection'
  },

  // Follow-up Templates
  {
    id: 'follow-up-initial',
    name: 'Follow-up - Initial Response',
    type: 'follow_up',
    category: 'follow_up',
    subject: 'Re: {{original_subject}}',
    content: `Hi {{first_name}},

I wanted to follow up on my email from {{days_ago}} about {{topic}}.

I understand you're probably busy, but I wanted to make sure this didn't get lost in your inbox. 

To recap: we help companies like {{company_name}} {{brief_value_prop}}, and I believe we could help you {{specific_benefit}}.

If now isn't the right time, I'd love to know when might be better to reconnect. Alternatively, if this isn't a priority for {{company_name}}, just let me know and I'll stop following up.

Thanks for your time,
{{your_name}}`,
    variables: [
      'first_name',
      'original_subject',
      'days_ago',
      'topic',
      'company_name',
      'brief_value_prop',
      'specific_benefit',
      'your_name'
    ],
    description: 'First follow-up email after initial cold outreach'
  },

  {
    id: 'follow-up-value-add',
    name: 'Follow-up - Value Add',
    type: 'follow_up',
    category: 'follow_up',
    subject: 'Thought this might interest you - {{resource_title}}',
    content: `Hi {{first_name}},

I hope you've been well since my last email about {{previous_topic}}.

I came across this {{resource_type}} that I thought might be valuable for {{company_name}}: {{resource_title}}

{{resource_description}}

{{resource_link}}

Even if we never work together, I hope this helps with {{relevant_challenge}}.

If you're ever interested in discussing {{service_area}}, I'm just an email away.

Best,
{{your_name}}`,
    variables: [
      'first_name',
      'previous_topic',
      'company_name',
      'resource_type',
      'resource_title',
      'resource_description',
      'resource_link',
      'relevant_challenge',
      'service_area',
      'your_name'
    ],
    description: 'Follow-up email that provides value without asking for anything'
  },

  // Proposal Follow-ups
  {
    id: 'proposal-follow-up',
    name: 'Proposal Follow-up',
    type: 'proposal_follow_up',
    category: 'proposal',
    subject: 'Following up on our proposal for {{project_name}}',
    content: `Hi {{first_name}},

I wanted to follow up on the proposal I sent over {{days_ago}} for {{project_name}}.

I'm excited about the possibility of working with {{company_name}} on {{project_description}}, and I believe our approach would deliver {{key_benefit}}.

Do you have any questions about the proposal? I'm happy to jump on a call to discuss any aspects in more detail.

Also, if there are any concerns about timeline, budget, or approach, please let me know. I'm here to make this work for {{company_name}}.

What are your thoughts on next steps?

Best regards,
{{your_name}}`,
    variables: [
      'first_name',
      'days_ago',
      'project_name',
      'company_name',
      'project_description',
      'key_benefit',
      'your_name'
    ],
    description: 'Follow-up email after sending a project proposal'
  },

  // LinkedIn Templates
  {
    id: 'linkedin-connection',
    name: 'LinkedIn Connection Request',
    type: 'linkedin_connect',
    category: 'social',
    content: `Hi {{first_name}}, I'd love to connect with you. I help companies like {{company_name}} with {{service_area}} and thought we might have some interesting discussions about {{industry_trend}}.`,
    variables: [
      'first_name',
      'company_name',
      'service_area',
      'industry_trend'
    ],
    description: 'Personal message for LinkedIn connection requests'
  },

  {
    id: 'linkedin-message',
    name: 'LinkedIn Direct Message',
    type: 'linkedin_message',
    category: 'social',
    content: `Hi {{first_name}},

Thanks for connecting! I noticed you're leading {{department}} at {{company_name}}.

I specialize in helping {{target_role}}s at {{company_size}} companies {{value_proposition}}. Recently helped a similar company {{case_study_result}}.

Would you be open to a brief conversation about {{specific_topic}}? I'd love to learn more about your current priorities and share some insights that might be relevant.

Best,
{{your_name}}`,
    variables: [
      'first_name',
      'department',
      'company_name',
      'target_role',
      'company_size',
      'value_proposition',
      'case_study_result',
      'specific_topic',
      'your_name'
    ],
    description: 'Follow-up message after LinkedIn connection is accepted'
  },

  // Nurturing Templates
  {
    id: 'check-in-quarterly',
    name: 'Quarterly Check-in',
    type: 'check_in',
    category: 'nurturing',
    subject: 'Checking in - {{quarter}} update from {{company_name}}',
    content: `Hi {{first_name}},

Hope {{prospect_company}} is having a great {{quarter}}!

I wanted to check in and see how things are going with {{previous_topic}}. A lot has changed in {{industry}} since we last spoke.

Quick updates from our side:
- {{update_1}}
- {{update_2}}
- {{update_3}}

How are things going on your end? Any new projects or challenges I might be able to help with?

Would love to catch up over coffee if you're ever free.

Best,
{{your_name}}`,
    variables: [
      'first_name',
      'prospect_company',
      'quarter',
      'previous_topic',
      'industry',
      'update_1',
      'update_2',
      'update_3',
      'your_name'
    ],
    description: 'Quarterly check-in email to maintain relationships'
  },

  {
    id: 'industry-insights',
    name: 'Industry Insights Share',
    type: 'check_in',
    category: 'nurturing',
    subject: '{{industry}} trends worth watching',
    content: `Hi {{first_name}},

Hope you're doing well! I've been following some interesting developments in {{industry}} and thought you might find them relevant for {{company_name}}.

Key trends I'm seeing:

1. {{trend_1}}
   Impact: {{impact_1}}

2. {{trend_2}}
   Impact: {{impact_2}}

3. {{trend_3}}
   Impact: {{impact_3}}

I'd be curious to hear your thoughts on these trends and how they might affect {{company_name}}'s strategy.

If any of these resonate, I'd love to discuss how companies are adapting to these changes.

Best,
{{your_name}}`,
    variables: [
      'first_name',
      'industry',
      'company_name',
      'trend_1',
      'impact_1',
      'trend_2',
      'impact_2',
      'trend_3',
      'impact_3',
      'your_name'
    ],
    description: 'Share industry insights to provide value and stay top-of-mind'
  },

  // Thank You Templates
  {
    id: 'thank-you-meeting',
    name: 'Thank You - After Meeting',
    type: 'thank_you',
    category: 'follow_up',
    subject: 'Thanks for your time today',
    content: `Hi {{first_name}},

Thank you for taking the time to meet with me today. I really enjoyed our conversation about {{discussion_topic}}.

As discussed, I'm attaching {{attachment_description}} for your review.

Key next steps:
- {{next_step_1}}
- {{next_step_2}}
- {{next_step_3}}

I'll follow up by {{follow_up_date}} with {{deliverable}}.

Please don't hesitate to reach out if you have any questions in the meantime.

Best regards,
{{your_name}}`,
    variables: [
      'first_name',
      'discussion_topic',
      'attachment_description',
      'next_step_1',
      'next_step_2',
      'next_step_3',
      'follow_up_date',
      'deliverable',
      'your_name'
    ],
    description: 'Thank you email to send after client meetings'
  },

  // Referral Request
  {
    id: 'referral-request',
    name: 'Referral Request',
    type: 'referral_request',
    category: 'nurturing',
    subject: 'Quick favor - {{service_type}} referrals',
    content: `Hi {{first_name}},

Hope you're doing well! Things have been going great at {{company_name}} - we just wrapped up {{recent_project}} and the results have been fantastic.

I'm reaching out because I know you're well-connected in {{industry}}, and I'm looking to help more companies like {{client_type}} with {{service_area}}.

Do you know any {{target_role}}s who might benefit from {{service_description}}? I'm particularly good at helping with {{specialty_area}}.

I'd be happy to provide a referral fee or simply return the favor however I can.

No pressure at all - just thought I'd ask!

Thanks,
{{your_name}}`,
    variables: [
      'first_name',
      'company_name',
      'recent_project',
      'industry',
      'client_type',
      'service_area',
      'target_role',
      'service_description',
      'specialty_area',
      'your_name'
    ],
    description: 'Request referrals from satisfied clients or partners'
  }
];