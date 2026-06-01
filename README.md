<!-- SUMMONIQ-OSS-HEADER:START -->
<div align="center">

  <h1>Agency Base</h1>
  <p>A comprehensive agency management platform that helps agencies streamline their operations, manage clients, and grow their business. This application provides a powerful set of tools to m...</p>

  <p>
    <a href="https://github.com/SummonIQ/agency-base"><img alt="Repository" src="https://img.shields.io/badge/github-SummonIQ%2Fagency-base-24292f?logo=github"></a>
    <a href="https://unlicense.org/"><img alt="License: Unlicense" src="https://img.shields.io/badge/license-Unlicense-blue.svg"></a>
  </p>

</div>

---
<!-- SUMMONIQ-OSS-HEADER:END -->
# AgencyBase

A comprehensive agency management platform that helps agencies streamline their operations, manage clients, and grow their business. This application provides a powerful set of tools to manage projects, track performance, and optimize agency workflows.

## Features

### Client Management
- Comprehensive client database with contact information and project history
- Track client interactions, meetings, and communication
- Automated invoicing and billing management

### Advanced Analytics
- Dashboard with key metrics about agency performance and growth
- Visual representations of project outcomes and client satisfaction
- Insights to help optimize agency operations and profitability
- Customizable reports and filtering options for different stakeholders

### Project Management Tools
- Comprehensive project tracking with milestones and deadlines
- Resource allocation and team assignment features
- Time tracking and productivity monitoring
- Automated project reporting and status updates

### Team Management
- Comprehensive team member profiles with skills and availability
- Performance tracking and evaluation tools
- Resource planning and capacity management
- Professional development tracking and goal setting

### Business Development Tools
- Comprehensive lead and prospect management
- Track interactions, set reminders, and manage follow-ups
- Import contacts from various business platforms
- AI-powered lead scoring and opportunity assessment
- Integration with popular CRM and marketing platforms

### Collaboration and Sharing
- Share project updates with team members and stakeholders
- Share reports and analytics with clients
- Control access levels (view, comment, edit) for shared resources
- Feedback and approval system for deliverables
- Time-limited share links with expiration settings

### Enhanced Notifications
- Receive notifications for project status changes and client updates
- Customize notification preferences and delivery methods
- Smart reminders for deadlines and important milestones
- Real-time notifications via Pusher integration
- Browser notifications for critical business updates

### Professional Network Integration
- Import professional network data with seamless integrations
- View and manage team member profiles and credentials
- Get personalized connection suggestions for business development
- Compare agency capabilities with market opportunities
- Integrated professional networking tools throughout business processes

### Mobile Experience
- Fully responsive design optimized for mobile devices
- Mobile-specific navigation with bottom bar and easy access menus
- Comprehensive mobile responsiveness audit tool
- Progressive Web App capabilities for app-like experience on mobile
- Mobile-specific tips and guidance

## Getting Started

### Prerequisites
- Node.js (v16+)
- npm or yarn
- MongoDB database

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/agency-base.git
cd agency-base
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up environment variables
Copy the `.env.example` file to `.env` and fill in your API keys and configuration.

4. Run the development server
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3020](http://localhost:3020) in your browser

## Usage

### Client Management
1. Add client information and project details to your database
2. Browse and filter client opportunities and project status
3. Use automated workflows to track project progress
4. Monitor client satisfaction and project outcomes in your dashboard

### Team Management
1. Add team member profiles and track their skills and availability
2. Review team performance analytics and productivity reports
3. Assign resources to projects and manage capacity planning

### Business Development
1. Import leads or add them manually to your pipeline
2. Set reminders for follow-ups and business development activities
3. Use AI-powered lead scoring based on your agency's expertise
4. Track business development activities and conversion rates

### Project Collaboration
1. Go to any project or client detail page
2. Click the "Share" button to create a share link
3. Configure access level and expiration settings for stakeholders
4. Share project updates with team members via email or copy to clipboard
5. View and manage all shared resources in the collaboration management section

## Architecture

The application is built using:
- Next.js for the frontend and API routes
- React for UI components
- Prisma ORM for database operations
- OpenAI GPT-4 for AI-powered business insights
- PostgreSQL for data storage
- Better Auth for authentication

## Project Structure

```
/app           # Next.js app router pages
/components    # React components
/lib           # Core business logic and services
/prisma        # Database schema and migrations
/public        # Static assets
/styles        # Global styles
/types         # TypeScript type definitions
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
