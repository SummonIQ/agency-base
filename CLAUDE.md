# CLAUDE.md - AgencyBase

This file provides guidance to Claude Code (claude.ai/code) when working with AgencyBase, a modern agency management platform.

## Development Commands

### Database Operations
- `bun db:generate` - Generate Prisma client
- `bun db:migrate` - Run database migrations in development
- `bun db:push` - Push schema changes to database
- `bun db:reset` - Reset database (skip generate)
- `bun db:studio` - Open Prisma Studio on port 5558

### Development & Building
- `bun dev` - Start development server with Turbopack on port 3030
- `bun build` - Build the application (includes Prisma generation)
- `bun start` - Start production server
- `bun lint` - Run ESLint
- `bun test` - Run Jest tests
- `bun test:a11y` - Run accessibility tests specifically

### Utility Commands
- `bun deps:check` - Check for dependency updates using ncu
- `bun yolo` - Quick git add, commit, and push (development shortcut)

## Architecture Overview

### Technology Stack
- **Framework**: Next.js 15 (App Router) with React 19
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Better Auth with session-based authentication
- **Styling**: Tailwind CSS with Radix UI components
- **AI Integration**: Vercel AI SDK with OpenAI
- **Real-time**: Pusher for notifications and live updates
- **Testing**: Jest with accessibility testing via @axe-core/react

### Project Structure

#### App Router Structure (`/app`)
- `(app)/` - Main authenticated application routes
- `(marketing)/` - Public marketing pages with separate layout
- `api/` - API routes organized by feature domain
- `shared/[token]/` - Public sharing functionality

#### Core Business Logic (`/lib`)
- **Job Management**: `job-leads/`, `job-listings/`, `job-searches/`
- **Resume Processing**: `resumes/` with analysis, optimization, and refinement
- **AI Features**: `interviews/`, `skills/`, resume analysis
- **Integrations**: `api/` (LinkedIn, Indeed), `applications/` (auto-submission)
- **Infrastructure**: `auth/`, `db/`, `cache/`, `events/`, `notifications/`

#### Database Architecture
The Prisma schema defines a comprehensive agency management platform with:
- **User Management**: Users, roles, permissions, teams
- **Client System**: Clients, contacts, communication history
- **Project Pipeline**: Leads → Projects → Tasks → Deliverables
- **Resource Management**: Team members, skills, availability
- **Financial**: Invoices, payments, expenses, budgets
- **Notifications**: Real-time notifications with read/unread status

### Key Patterns

#### Authentication & Middleware
- Session-based auth using Better Auth
- Middleware protects authenticated routes, redirects to `/login` with original URL
- Public routes: `/`, `/login`, marketing pages

#### Caching Strategy
Uses Next.js 15 cache patterns:
```typescript
'use cache';
cacheTag(`user:${userId}:resumes`);
// Revalidate with: revalidateTag(`user:${userId}:resumes`);
```

#### Error Handling
- Proper error boundaries with `error.tsx` files
- API error handling in `/lib/errors/`
- Prisma-specific error handling patterns

#### Component Architecture
- Favor React Server Components over client components
- Use `'use client'` directive sparingly
- Named exports for components with displayName
- Default exports for page components
- Interface-based prop definitions

### Database Workflow
1. Always run `bun db:generate` after schema changes
2. Use `bun db:migrate` for development migrations
3. Use descriptive migration names
4. Never modify existing migrations

### Core Features
- **Client Management**: Track clients, projects, and relationships
- **Project Pipeline**: Manage projects from lead to completion
- **Team Collaboration**: Assign tasks, track progress, communicate
- **Resource Planning**: Schedule team members and resources
- **Financial Tracking**: Invoicing, payments, budgets
- **Analytics Dashboard**: Business metrics and insights

### Real-time Features
- Pusher integration for live notifications
- Job search progress tracking
- Application status updates
- Browser notifications for critical updates

### Testing Strategy
- Jest for unit tests
- Accessibility tests with jest-axe
- Run `bun test:a11y` for a11y-specific test suite
- Mobile responsiveness auditing tools included



## Linear Project Management Integration

### Overview
- Linear is used for project management and issue tracking
- Linear is integrated via MCP (Model Context Protocol)
- **Always follow the rules** defined in `.windsurf/rules/project-management.md`

### Environment Configuration
Linear team/project info is located in the `.env` files:
- `LINEAR_TEAM_ID` - The project team's ID in Linear
- `LINEAR_PROJECT_NAME` - The name of the project
- `LINEAR_PROJECT_URL` - The URL to the project
- `LINEAR_DEFAULT_ASSIGNEE_USER` - Default assignee user ID
- `LINEAR_DEFAULT_ASSIGNEE_USER_EMAIL` - Default assignee email

### Label Structure
Every Linear ticket must have labels from these three groups:

**Type** (What kind of work):
- `Bug` - Fixing existing functionality
- `Feature` - New functionality or capabilities  
- `Refactor` - Code improvements, technical debt, performance
- `Task` - General work items, research, setup

**Product Area** (What part of the application):
- `Analytics & Reporting` - Dashboards, metrics, reporting features
- `Application Settings` - System/admin configuration
- `Authentication` - Login, signup, password management
- `Billing & Payments` - Payment processing, subscriptions, invoicing
- `Notifications` - Email, in-app, push notifications
- `Onboarding` - User signup flow, initial setup
- `Search` - Search functionality and filters
- `User Preferences` - App settings (theme, language, personal preferences)
- `User Profile` - Public user profiles, team member visibility

**Focus** (Primary area of concern):
- `Accessibility` - Screen readers, keyboard navigation, WCAG compliance
- `APIs & Integrations` - Third-party services, external APIs
- `Code Quality` - Refactoring, code cleanup, maintainability
- `Database` - Queries, migrations, data management
- `DevOps` - CI/CD, deployment, monitoring
- `Documentation` - Technical docs, user guides, specifications
- `Infrastructure` - Servers, hosting, networking
- `Localization / Internationalization` - Multi-language support
- `Performance` - Speed optimization, caching, efficiency
- `Security` - Authentication, authorization, data protection
- `Testing / QA` - Test writing, automation, quality assurance
- `UI / UX Enhancement` - User interface improvements, user experience

### Ticket Creation Guidelines
- **Confirm before creating tickets** unless explicitly instructed otherwise
- **Include clear acceptance criteria** with functional and non-functional requirements
- **Choose appropriate labels** from all three required groups
- **Set meaningful priorities**: No Priority, Low, Medium (default), High, Urgent
- **Reference the AI rules** in `.windsurf/rules/project-management.md` for detailed guidance

## Safety Rules

### Process Management
- **NEVER use `pkill` or similar commands** that could kill processes beyond this project
- **NEVER kill Next.js servers** with broad process killing commands - the user may have multiple apps running
- If you need to restart the dev server, ask the user to do it manually
- Only use process commands that are specific to files or directories within this project

# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
