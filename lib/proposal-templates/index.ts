export interface ProposalTemplate {
  id: string;
  name: string;
  description: string;
  category: 'development' | 'design' | 'consulting' | 'maintenance' | 'training';
  executiveSummary: string;
  scope: string;
  timeline: string;
  terms: string;
  defaultItems: {
    description: string;
    quantity: number;
    rate: number;
  }[];
}

export const proposalTemplates: ProposalTemplate[] = [
  {
    id: 'web-development',
    name: 'Web Development Project',
    description: 'Full-stack web application development',
    category: 'development',
    executiveSummary: `## Project Overview

We propose to develop a modern, responsive web application that meets your business requirements and provides an exceptional user experience. Our approach combines proven development methodologies with cutting-edge technologies to deliver a scalable, secure, and maintainable solution.

## Key Benefits
- Custom-built solution tailored to your specific needs
- Mobile-responsive design for all devices
- Modern technology stack for performance and scalability
- Comprehensive testing and quality assurance
- Ongoing support and maintenance options`,
    scope: `## Development Scope

### Frontend Development
- Custom responsive UI/UX design implementation
- Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- Mobile-first responsive design
- Performance optimization and best practices
- Accessibility compliance (WCAG 2.1 AA)

### Backend Development
- Secure API development with authentication
- Database design and implementation
- Third-party integrations as required
- Automated testing suite
- Security implementation and validation

### Deployment & DevOps
- Production deployment setup
- SSL certificate configuration
- Monitoring and logging setup
- Backup and recovery procedures

### Documentation
- Technical documentation for future maintenance
- User guide and training materials
- Deployment and configuration documentation`,
    timeline: `## Project Timeline

### Phase 1: Planning & Design (Weeks 1-2)
- Requirements gathering and analysis
- Technical architecture planning
- UI/UX design mockups and approval
- Development environment setup

### Phase 2: Core Development (Weeks 3-6)
- Backend API development and testing
- Frontend component development
- Database implementation
- Integration of core features

### Phase 3: Integration & Testing (Weeks 7-8)
- System integration testing
- User acceptance testing
- Performance optimization
- Security audit and fixes

### Phase 4: Deployment & Launch (Week 9)
- Production deployment
- Final testing and validation
- Training and documentation delivery
- Go-live support

### Phase 5: Post-Launch Support (Week 10)
- Monitoring and issue resolution
- Performance tuning
- Client training and handover`,
    terms: `## Payment Terms
- 30% upfront payment upon contract signing
- 40% upon completion of Phase 2 (Core Development)
- 30% upon final delivery and client approval

## Intellectual Property
All custom code and deliverables become the exclusive property of the client upon final payment.

## Revision Policy
- Up to 3 rounds of revisions included in each phase
- Additional revisions billed at $150/hour
- Major scope changes require separate change order

## Support & Maintenance
- 30 days of complimentary bug fixes post-launch
- Optional ongoing maintenance available at $200/month
- Emergency support available at $200/hour

## Cancellation Policy
Either party may cancel with 30 days written notice. Client responsible for work completed and expenses incurred.`,
    defaultItems: [
      { description: 'Frontend Development (React/Next.js)', quantity: 80, rate: 150 },
      { description: 'Backend Development (Node.js/Database)', quantity: 60, rate: 150 },
      { description: 'UI/UX Design & Implementation', quantity: 40, rate: 125 },
      { description: 'Testing & Quality Assurance', quantity: 20, rate: 125 },
      { description: 'Deployment & DevOps Setup', quantity: 16, rate: 150 },
      { description: 'Documentation & Training', quantity: 12, rate: 125 },
    ],
  },
  {
    id: 'mobile-app',
    name: 'Mobile App Development',
    description: 'Native or cross-platform mobile application',
    category: 'development',
    executiveSummary: `## Mobile App Development

We propose to develop a high-quality mobile application that delivers exceptional user experience across iOS and Android platforms. Our approach focuses on native performance, intuitive design, and seamless integration with your business requirements.

## Our Approach
- Cross-platform development using React Native
- Native performance with platform-specific optimizations
- Comprehensive testing on real devices
- App Store optimization and submission support
- Analytics and crash reporting integration`,
    scope: `## Development Scope

### Mobile App Development
- Cross-platform React Native application
- iOS and Android platform optimization
- Native device feature integration (camera, GPS, push notifications)
- Offline functionality and data synchronization
- Performance optimization for mobile devices

### Backend Services
- RESTful API development
- User authentication and authorization
- Push notification system
- Analytics tracking implementation
- Cloud storage and CDN setup

### Testing & Quality Assurance
- Automated testing suite
- Manual testing on multiple devices
- Performance testing and optimization
- Security testing and vulnerability assessment

### App Store Deployment
- iOS App Store submission and approval
- Google Play Store submission and approval
- App Store Optimization (ASO)
- Beta testing setup via TestFlight/Play Console`,
    timeline: `## Development Timeline

### Phase 1: Planning & Setup (Weeks 1-2)
- Requirements analysis and feature specification
- Technical architecture design
- UI/UX mockups and prototyping
- Development environment setup

### Phase 2: Core Development (Weeks 3-8)
- Core app functionality implementation
- API development and integration
- Database design and implementation
- Authentication and user management

### Phase 3: Advanced Features (Weeks 9-10)
- Native device integrations
- Push notifications implementation
- Offline functionality
- Performance optimization

### Phase 4: Testing & Refinement (Weeks 11-12)
- Comprehensive testing across devices
- Bug fixes and performance tuning
- User acceptance testing
- Final UI/UX refinements

### Phase 5: Deployment (Weeks 13-14)
- App store submission preparation
- Beta testing coordination
- Production deployment
- Launch support and monitoring`,
    terms: `## Payment Terms
- 25% upfront payment upon contract signing
- 25% upon completion of Phase 2
- 25% upon completion of Phase 4
- 25% upon successful app store approval

## Deliverables
- Complete mobile application for iOS and Android
- Backend API and database
- App store listings and assets
- Source code and documentation
- 90 days of post-launch support

## App Store Policies
Client acknowledges that app store approval is subject to platform policies beyond our control. We will work diligently to ensure compliance, with resubmission included if needed.

## Ongoing Maintenance
Optional maintenance packages available starting at $500/month including updates, monitoring, and support.`,
    defaultItems: [
      { description: 'Mobile App Development (React Native)', quantity: 120, rate: 150 },
      { description: 'Backend API Development', quantity: 40, rate: 150 },
      { description: 'UI/UX Design & Mobile Optimization', quantity: 32, rate: 125 },
      { description: 'Testing & Quality Assurance', quantity: 24, rate: 125 },
      { description: 'App Store Submission & Optimization', quantity: 16, rate: 125 },
      { description: 'Documentation & Handover', quantity: 8, rate: 125 },
    ],
  },
  {
    id: 'website-redesign',
    name: 'Website Redesign',
    description: 'Complete website redesign and modernization',
    category: 'design',
    executiveSummary: `## Website Redesign Project

We propose a comprehensive redesign of your existing website to improve user experience, increase conversions, and reflect your brand's evolution. Our approach combines modern design principles with proven UX methodologies to create a website that drives results.

## Goals
- Improve user engagement and conversion rates
- Modernize visual design and brand presentation
- Enhance mobile experience and performance
- Implement SEO best practices
- Streamline content management`,
    scope: `## Redesign Scope

### Design & User Experience
- Complete visual redesign with modern aesthetics
- User journey optimization and conversion path improvement
- Mobile-first responsive design
- Brand alignment and visual consistency
- Accessibility improvements (WCAG 2.1 compliance)

### Technical Implementation
- Modern frontend framework implementation
- Performance optimization (Core Web Vitals)
- SEO optimization and technical SEO audit
- Content management system integration
- Analytics and tracking implementation

### Content Strategy
- Content audit and optimization recommendations
- Information architecture restructuring
- Call-to-action optimization
- Image optimization and alt text implementation

### Testing & Launch
- Cross-browser and device testing
- Performance testing and optimization
- User acceptance testing
- Staging environment for review
- Production deployment and go-live support`,
    timeline: `## Project Timeline

### Phase 1: Discovery & Strategy (Week 1)
- Stakeholder interviews and requirements gathering
- Competitive analysis and market research
- User persona development
- Content audit and information architecture

### Phase 2: Design & Prototyping (Weeks 2-3)
- Wireframing and user flow design
- Visual design concepts and iterations
- Interactive prototypes
- Client feedback and revisions

### Phase 3: Development (Weeks 4-6)
- Frontend development and responsive implementation
- CMS integration and content migration
- SEO optimization implementation
- Performance optimization

### Phase 4: Testing & Launch (Week 7)
- Cross-platform testing and bug fixes
- Content review and final adjustments
- Performance testing and optimization
- Production deployment and launch

### Phase 5: Post-Launch (Week 8)
- Monitoring and issue resolution
- Analytics setup and initial reporting
- Training and documentation delivery
- Performance review and optimization`,
    terms: `## Payment Terms
- 40% upfront payment upon contract signing
- 40% upon design approval (end of Phase 2)
- 20% upon final launch and approval

## Included Services
- Complete website redesign and development
- Up to 3 rounds of revisions per phase
- 30 days of post-launch support and bug fixes
- Basic SEO optimization
- Analytics setup and configuration

## Additional Services (Optional)
- Content writing and copywriting: $125/hour
- Advanced SEO optimization: $2,500
- E-commerce integration: $3,500
- Custom integrations: $150/hour

## Timeline Dependencies
Timeline assumes timely client feedback and content provision. Delays in client responses may extend delivery dates proportionally.`,
    defaultItems: [
      { description: 'UX Research & Information Architecture', quantity: 16, rate: 125 },
      { description: 'Visual Design & Brand Implementation', quantity: 32, rate: 125 },
      { description: 'Frontend Development & Responsive Design', quantity: 48, rate: 150 },
      { description: 'CMS Integration & Content Migration', quantity: 16, rate: 150 },
      { description: 'SEO Optimization & Performance Tuning', quantity: 12, rate: 150 },
      { description: 'Testing, Launch & Documentation', quantity: 8, rate: 125 },
    ],
  },
  {
    id: 'tech-consulting',
    name: 'Technology Consulting',
    description: 'Strategic technology consulting and architecture review',
    category: 'consulting',
    executiveSummary: `## Technology Consulting Engagement

We propose a comprehensive technology consulting engagement to assess your current systems, identify optimization opportunities, and provide strategic recommendations for your technology roadmap.

## Consulting Focus
- Technology stack assessment and recommendations
- System architecture review and optimization
- Performance analysis and improvement strategies
- Security audit and compliance review
- Team development and best practices implementation`,
    scope: `## Consulting Scope

### Technology Assessment
- Current system architecture analysis
- Performance and scalability evaluation
- Security posture assessment
- Technology stack modernization opportunities
- Integration architecture review

### Strategic Recommendations
- Technology roadmap development
- Architecture improvement recommendations
- Tool and platform evaluations
- Team structure and skill gap analysis
- Budget and timeline planning for improvements

### Implementation Support
- Proof of concept development
- Migration strategy planning
- Risk assessment and mitigation
- Change management planning
- Knowledge transfer and training

### Deliverables
- Comprehensive assessment report
- Strategic technology roadmap
- Implementation recommendations
- Risk assessment documentation
- Executive summary presentation`,
    timeline: `## Engagement Timeline

### Week 1: Discovery & Assessment
- Stakeholder interviews
- System architecture documentation review
- Performance and security baseline assessment
- Current workflow and process analysis

### Week 2: Deep Analysis
- Technical deep-dive sessions
- Code quality and architecture review
- Scalability and performance analysis
- Security vulnerability assessment

### Week 3: Strategy Development
- Technology roadmap creation
- Implementation priority matrix
- Cost-benefit analysis
- Risk assessment and mitigation planning

### Week 4: Recommendations & Handover
- Final report preparation
- Executive presentation
- Implementation planning session
- Knowledge transfer and next steps`,
    terms: `## Payment Terms
- 50% upfront payment upon contract signing
- 50% upon delivery of final recommendations

## Confidentiality
All proprietary information will be kept strictly confidential and covered under mutual NDA.

## Deliverable Format
- Written assessment report (PDF and editable formats)
- Executive presentation deck
- Implementation roadmap with timelines
- Follow-up consultation session included

## Additional Services
- Implementation support: $200/hour
- Ongoing advisory retainer: $5,000/month
- Team training workshops: $2,500/day
- Code review services: $175/hour`,
    defaultItems: [
      { description: 'Technology Assessment & Analysis', quantity: 32, rate: 200 },
      { description: 'Strategic Planning & Roadmap Development', quantity: 16, rate: 200 },
      { description: 'Documentation & Report Preparation', quantity: 12, rate: 175 },
      { description: 'Executive Presentation & Handover', quantity: 4, rate: 200 },
    ],
  },
  {
    id: 'maintenance-support',
    name: 'Ongoing Maintenance & Support',
    description: 'Monthly maintenance and support retainer',
    category: 'maintenance',
    executiveSummary: `## Ongoing Maintenance & Support

We propose a comprehensive maintenance and support package to ensure your systems remain secure, performant, and up-to-date. Our proactive approach minimizes downtime and keeps your technology running smoothly.

## Service Benefits
- Proactive monitoring and issue prevention
- Regular security updates and patches
- Performance optimization and monitoring
- Priority support with guaranteed response times
- Monthly reporting and recommendations`,
    scope: `## Maintenance Services

### Proactive Monitoring
- 24/7 system monitoring and alerting
- Performance metrics tracking
- Uptime monitoring and reporting
- Security scanning and vulnerability detection
- Automated backup verification

### Regular Maintenance
- Security patches and updates
- Dependency updates and compatibility testing
- Performance optimization and tuning
- Database maintenance and optimization
- SSL certificate management

### Support Services
- Priority technical support (4-hour response)
- Bug fixes and issue resolution
- Emergency support during business hours
- System troubleshooting and debugging
- User support and training

### Monthly Deliverables
- System health report
- Performance metrics analysis
- Security scan results
- Recommendations for improvements
- Backup and recovery testing report`,
    timeline: `## Service Schedule

### Ongoing Monthly Activities
- **Week 1:** System health check and monitoring review
- **Week 2:** Security updates and patch management
- **Week 3:** Performance optimization and tuning
- **Week 4:** Monthly reporting and client consultation

### Emergency Response
- Critical issues: 2-hour response time
- High priority: 4-hour response time
- Medium priority: 1 business day response time
- Low priority: 3 business days response time

### Quarterly Reviews
- Comprehensive system assessment
- Technology roadmap review
- Performance trend analysis
- Security posture evaluation`,
    terms: `## Service Terms
- Monthly retainer billed in advance
- 30-day notice required for service changes
- Emergency support included during business hours (9 AM - 6 PM EST)
- After-hours emergency support available at $300/hour

## Service Level Agreement
- 99.9% uptime guarantee (excludes scheduled maintenance)
- 4-hour response time for critical issues
- Monthly service reports delivered by 5th of each month

## Included vs. Additional Services
### Included:
- Up to 8 hours of support/fixes per month
- Monitoring and reporting
- Security updates and patches
- Emergency response during business hours

### Additional (Billed Separately):
- New feature development
- Major system upgrades
- After-hours emergency support
- Additional hours beyond monthly allocation

## Contract Terms
- Minimum 6-month commitment
- Month-to-month after initial term
- 30-day cancellation notice required`,
    defaultItems: [
      { description: 'Monthly Maintenance & Monitoring', quantity: 1, rate: 2500 },
      { description: 'Security Updates & Patch Management', quantity: 1, rate: 800 },
      { description: 'Performance Optimization & Tuning', quantity: 1, rate: 600 },
      { description: 'Priority Support (up to 8 hours)', quantity: 1, rate: 1200 },
    ],
  },
];

export function getTemplateById(id: string): ProposalTemplate | undefined {
  return proposalTemplates.find(template => template.id === id);
}

export function getTemplatesByCategory(category: ProposalTemplate['category']): ProposalTemplate[] {
  return proposalTemplates.filter(template => template.category === category);
}