# Native App Technical Implementation Strategy

## Code Sharing Architecture

### Monorepo Structure
We recommend using a monorepo approach with a structure similar to:

```
gimme-job/
├── packages/
│   ├── api/                   # Shared API client and types
│   ├── core/                  # Shared business logic
│   ├── ui/                    # Design system (may have platform-specific implementations)
│   └── utils/                 # Shared utilities
├── apps/
│   ├── web/                   # Current Next.js web app
│   └── mobile/                # React Native app
│       ├── android/           # Android-specific code
│       └── ios/               # iOS-specific code
└── docs/                      # Documentation
```

### Dependencies and Package Management

We recommend using **Yarn Workspaces** or **pnpm** for dependency management, which will allow:
- Sharing dependencies between packages
- Avoiding duplication of node_modules
- Running commands across all packages

Example `package.json` at root:

```json
{
  "name": "gimme-job-monorepo",
  "private": true,
  "workspaces": [
    "packages/*",
    "apps/*"
  ],
  "scripts": {
    "web": "yarn workspace web dev",
    "mobile": "yarn workspace mobile start",
    "build:api": "yarn workspace @gimme-job/api build",
    "build:core": "yarn workspace @gimme-job/core build"
  }
}
```

## State Management Sharing

### Recommended Approach
Use a combination of **React Context API** and **Zustand** for state management across platforms:

1. **Zustand**: Light-weight state management solution that works seamlessly across React and React Native
   - Persists well with AsyncStorage/localStorage
   - Works with React Suspense
   - TypeScript-friendly

2. **React Query/TanStack Query**: For server state management
   - Cache API responses
   - Handle loading/error states
   - Revalidation strategies
   - Works consistently across platforms

### Example Implementation

Shared state store in `packages/core/src/stores/job-listings.ts`:

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { JobListing } from '@gimme-job/api';

interface JobListingsState {
  listings: JobListing[];
  savedListings: string[]; // IDs of saved listings
  dismissedListings: string[]; // IDs of dismissed listings
  addListing: (listing: JobListing) => void;
  saveListing: (id: string) => void;
  dismissListing: (id: string) => void;
}

// Platform-specific persistence adapter should be injected
export const createJobListingsStore = (storage: any) => 
  create<JobListingsState>()(
    persist(
      (set) => ({
        listings: [],
        savedListings: [],
        dismissedListings: [],
        addListing: (listing) => 
          set((state) => ({
            listings: [...state.listings, listing],
          })),
        saveListing: (id) => 
          set((state) => ({
            savedListings: [...state.savedListings, id],
          })),
        dismissListing: (id) => 
          set((state) => ({
            dismissedListings: [...state.dismissedListings, id],
          })),
      }),
      {
        name: 'job-listings-storage',
        storage,
      }
    )
  );
```

## API Layer Sharing

Create a shared API client in `packages/api` that can be used by both web and mobile apps:

```typescript
// packages/api/src/client.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export class ApiClient {
  private client: AxiosInstance;
  
  constructor(baseURL: string, options?: AxiosRequestConfig) {
    this.client = axios.create({
      baseURL,
      ...options,
    });
  }
  
  async getJobListings(params?: object) {
    const response = await this.client.get('/api/jobs', { params });
    return response.data;
  }
  
  async saveJob(jobId: string) {
    return this.client.post(`/api/jobs/${jobId}/save`);
  }
  
  // More API methods...
}
```

## UI Component Strategy

### Approach Options

1. **Platform-specific implementations with shared design tokens**
   - Design tokens (colors, spacing, typography) defined once
   - Components implemented separately for web and mobile
   - Best for optimal platform-specific experiences

2. **Shared base components with platform-specific adapters**
   - Core logic shared
   - Platform-specific rendering
   - Good balance between sharing and platform optimization

### Recommended Libraries

- **React Native Paper**: Material Design components for React Native
- **React Native Vector Icons**: Icon support
- **React Native Reanimated**: Advanced animations
- **React Native Gesture Handler**: Touch interactions

## Authentication Implementation

Share authentication logic while implementing platform-specific storage:

```typescript
// packages/core/src/auth/auth-service.ts
export class AuthService {
  constructor(
    private apiClient: ApiClient,
    private tokenStorage: TokenStorage,
  ) {}
  
  async login(email: string, password: string) {
    const { token, user } = await this.apiClient.login(email, password);
    await this.tokenStorage.saveToken(token);
    return user;
  }
  
  async logout() {
    await this.tokenStorage.removeToken();
  }
  
  async getAuthenticatedUser() {
    const token = await this.tokenStorage.getToken();
    if (!token) return null;
    
    try {
      return await this.apiClient.getCurrentUser();
    } catch (error) {
      await this.tokenStorage.removeToken();
      return null;
    }
  }
}

// Platform-specific implementation
// TokenStorage for web (Next.js)
export class WebTokenStorage implements TokenStorage {
  async saveToken(token: string): Promise<void> {
    localStorage.setItem('auth-token', token);
  }
  
  async getToken(): Promise<string | null> {
    return localStorage.getItem('auth-token');
  }
  
  async removeToken(): Promise<void> {
    localStorage.removeItem('auth-token');
  }
}

// TokenStorage for React Native
export class NativeTokenStorage implements TokenStorage {
  async saveToken(token: string): Promise<void> {
    await AsyncStorage.setItem('auth-token', token);
  }
  
  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem('auth-token');
  }
  
  async removeToken(): Promise<void> {
    await AsyncStorage.removeItem('auth-token');
  }
}
```

## Navigation Structure

### React Navigation Setup

For the mobile app, we'll use React Navigation with a structure similar to the web app's routes:

```typescript
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function JobsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="JobListings" component={JobListingsScreen} />
      <Stack.Screen name="JobDetails" component={JobDetailsScreen} />
      <Stack.Screen name="SavedJobs" component={SavedJobsScreen} />
    </Stack.Navigator>
  );
}

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Overview" component={OverviewScreen} />
        <Tab.Screen name="Jobs" component={JobsStack} />
        <Tab.Screen name="Leads" component={LeadsScreen} />
        <Tab.Screen name="Tools" component={ToolsScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
```

## Mobile-specific Features

1. **Push Notifications**
   - Job application updates
   - Interview reminders
   - New job matches

2. **Offline Support**
   - Cache job listings
   - Queue actions for when connectivity returns
   - Syncing mechanism for offline changes

3. **Deep Linking**
   - Open specific screens from notifications
   - Share job listings via social media
   - Resume editing links

## Testing Strategy

1. **Shared Tests**
   - Business logic tests in core package
   - API client tests
   - State management tests

2. **Platform-specific Tests**
   - UI component tests
   - Integration tests
   - E2E tests with Detox (mobile) and Cypress (web)

## Development Workflow

1. **Initial Setup**
   - Set up monorepo structure
   - Extract shared code from web app
   - Create mobile app scaffold

2. **Iterative Development**
   - Implement core features one by one
   - Focus on auth and job listings first
   - Add platform-specific optimizations

3. **CI/CD Pipeline**
   - Run tests for affected packages
   - Build and deploy web and mobile separately
   - Use Expo EAS for mobile builds

## Next Steps

1. Set up the monorepo structure and create initial packages
2. Extract API client and types from the current web app
3. Create shared state management
4. Initialize the React Native project with Expo
5. Implement authentication flow
6. Build the job listings screen as proof of concept

## Timeline

| Phase | Duration | Description |
|-------|----------|-------------|
| 1 | 3 weeks | Monorepo setup, shared packages extraction |
| 2 | 4 weeks | Auth, job listings, basic navigation |
| 3 | 6 weeks | Complete feature implementation |
| 4 | 3 weeks | UI polish, performance optimization |
| 5 | 2 weeks | Testing, bug fixes, app store preparation |

Total: ~18 weeks from start to production-ready app
