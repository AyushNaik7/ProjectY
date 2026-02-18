# Design Document: Brand UI Enhancement

## Overview

This design document outlines the technical approach for enhancing the brand-facing user interface and implementing trust-building elements across the Collabo platform. The solution focuses on creating a cohesive, professional design system using Next.js 14, TypeScript, Tailwind CSS, and Shadcn/ui components, with Framer Motion for smooth animations.

The enhancement will improve five key brand pages: Dashboard, Onboarding, Campaigns List, Campaign Creation, and Creator Discovery. Each page will receive visual improvements, better information architecture, trust indicators, and comprehensive loading/error states.

## Architecture

### Design System Architecture

The design system follows an atomic design methodology with three layers:

1. **Foundation Layer**: Design tokens (colors, typography, spacing, shadows, animations)
2. **Component Layer**: Reusable UI components built on Shadcn/ui primitives
3. **Pattern Layer**: Composed patterns and page templates

### Component Structure

```
components/
├── ui/                          # Shadcn/ui base components
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   └── ...
├── brand/                       # Brand-specific components
│   ├── dashboard/
│   │   ├── MetricsCard.tsx
│   │   ├── CampaignCard.tsx
│   │   ├── CreatorSuggestion.tsx
│   │   └── DashboardStats.tsx
│   ├── campaigns/
│   │   ├── CampaignList.tsx
│   │   ├── CampaignCard.tsx
│   │   ├── CampaignForm.tsx
│   │   └── CampaignFilters.tsx
│   ├── creators/
│   │   ├── CreatorCard.tsx
│   │   ├── CreatorFilters.tsx
│   │   └── CreatorGrid.tsx
│   ├── onboarding/
│   │   ├── OnboardingStep.tsx
│   │   ├── ProgressIndicator.tsx
│   │   └── StepNavigation.tsx
│   └── trust/
│       ├── Testimonial.tsx
│       ├── SecurityBadge.tsx
│       ├── VerificationBadge.tsx
│       └── SocialProof.tsx
├── shared/
│   ├── EmptyState.tsx
│   ├── LoadingState.tsx
│   ├── ErrorState.tsx
│   └── DataVisualization.tsx
└── layout/
    ├── BrandLayout.tsx
    └── BrandNavigation.tsx
```

### Page Architecture

Each brand page follows a consistent structure:

1. **Layout Wrapper**: Provides navigation, header, and footer
2. **Page Container**: Main content area with consistent padding and max-width
3. **Section Components**: Logical groupings of related content
4. **Loading/Error Boundaries**: Suspense boundaries for async data

### State Management

- **Server Components**: Default for static content and initial data fetching
- **Client Components**: For interactive elements (filters, forms, animations)
- **React Query**: For client-side data fetching, caching, and mutations (if needed)
- **Form State**: React Hook Form for complex forms with validation

## Components and Interfaces

### Design Tokens

```typescript
// lib/design-tokens.ts

export const designTokens = {
  colors: {
    brand: {
      primary: 'hsl(262, 83%, 58%)',      // Purple
      secondary: 'hsl(221, 83%, 53%)',    // Blue
      accent: 'hsl(142, 76%, 36%)',       // Green
      muted: 'hsl(220, 13%, 91%)',        // Light gray
    },
    semantic: {
      success: 'hsl(142, 76%, 36%)',
      warning: 'hsl(38, 92%, 50%)',
      error: 'hsl(0, 84%, 60%)',
      info: 'hsl(221, 83%, 53%)',
    },
    trust: {
      verified: 'hsl(142, 76%, 36%)',
      secure: 'hsl(221, 83%, 53%)',
    }
  },
  typography: {
    fontFamily: {
      sans: 'var(--font-inter)',
      display: 'var(--font-cal-sans)',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    }
  },
  spacing: {
    section: '4rem',
    card: '1.5rem',
    element: '1rem',
  },
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  },
  animations: {
    duration: {
      fast: '150ms',
      normal: '250ms',
      slow: '350ms',
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    }
  }
} as const;
```

### Core Component Interfaces

```typescript
// types/brand-ui.ts

export interface MetricsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon?: React.ReactNode;
  loading?: boolean;
}

export interface CampaignCardProps {
  campaign: {
    id: string;
    name: string;
    status: 'active' | 'draft' | 'completed' | 'paused';
    budget: number;
    startDate: Date;
    endDate: Date;
    metrics: {
      reach: number;
      engagement: number;
      conversions: number;
    };
  };
  onEdit?: (id: string) => void;
  onView?: (id: string) => void;
}

export interface CreatorCardProps {
  creator: {
    id: string;
    name: string;
    avatar: string;
    verified: boolean;
    niche: string[];
    followers: number;
    engagementRate: number;
    averageViews: number;
  };
  onContact?: (id: string) => void;
  onViewProfile?: (id: string) => void;
  onAddToCampaign?: (id: string) => void;
}

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface LoadingStateProps {
  variant?: 'card' | 'list' | 'table' | 'skeleton';
  count?: number;
}

export interface TrustIndicatorProps {
  type: 'testimonial' | 'security' | 'verification' | 'social-proof';
  data: TestimonialData | SecurityBadgeData | VerificationData | SocialProofData;
}

export interface TestimonialData {
  quote: string;
  author: string;
  company: string;
  avatar?: string;
  rating?: number;
}

export interface SecurityBadgeData {
  type: 'ssl' | 'gdpr' | 'payment' | 'encryption';
  label: string;
}

export interface VerificationData {
  verified: boolean;
  verifiedAt?: Date;
  verificationType?: 'email' | 'phone' | 'identity' | 'business';
}

export interface SocialProofData {
  metric: string;
  value: string | number;
  label: string;
}
```

### Dashboard Components

```typescript
// components/brand/dashboard/MetricsCard.tsx

interface MetricsCardImplementation {
  // Displays a single metric with optional trend indicator
  // Uses Framer Motion for entrance animation
  // Shows skeleton loading state when loading prop is true
  // Includes icon, title, value, and percentage change
}

// components/brand/dashboard/DashboardStats.tsx

interface DashboardStatsImplementation {
  // Container for multiple MetricsCard components
  // Responsive grid layout (1 col mobile, 2 col tablet, 4 col desktop)
  // Fetches data from Supabase and handles loading/error states
}

// components/brand/dashboard/CampaignCard.tsx

interface CampaignCardImplementation {
  // Displays campaign summary with status badge
  // Shows key metrics in a compact format
  // Includes quick action buttons (View, Edit)
  // Hover animation using Framer Motion
  // Color-coded status indicator
}

// components/brand/dashboard/CreatorSuggestion.tsx

interface CreatorSuggestionImplementation {
  // Displays suggested creator with avatar and key stats
  // Shows verification badge if creator is verified
  // Includes "View Profile" and "Contact" CTAs
  // Compact card design for dashboard sidebar
}
```

### Campaign Components

```typescript
// components/brand/campaigns/CampaignList.tsx

interface CampaignListImplementation {
  // Displays campaigns in grid or list view
  // Supports filtering by status and sorting
  // Implements infinite scroll or pagination
  // Shows empty state when no campaigns exist
  // Handles loading state with skeleton cards
}

// components/brand/campaigns/CampaignForm.tsx

interface CampaignFormImplementation {
  // Multi-section form for campaign creation
  // Uses React Hook Form for validation
  // Real-time validation feedback
  // Preview mode before submission
  // Sections: Basic Info, Budget, Timeline, Target Audience, Content Requirements
}

// components/brand/campaigns/CampaignFilters.tsx

interface CampaignFiltersImplementation {
  // Filter controls for status, date range, budget
  // Collapsible on mobile devices
  // Clear filters button
  // Active filter count indicator
}
```

### Creator Discovery Components

```typescript
// components/brand/creators/CreatorCard.tsx

interface CreatorCardImplementation {
  // Displays creator profile with avatar and stats
  // Shows verification badge for verified creators
  // Displays niche tags
  // Key metrics: followers, engagement rate, avg views
  // Action buttons: View Profile, Contact, Add to Campaign
  // Hover effect reveals additional information
}

// components/brand/creators/CreatorFilters.tsx

interface CreatorFiltersImplementation {
  // Search input for creator name
  // Filter by niche (multi-select)
  // Filter by follower range (slider)
  // Filter by engagement rate (slider)
  // Filter by verification status (toggle)
  // Collapsible filter panel on mobile
}

// components/brand/creators/CreatorGrid.tsx

interface CreatorGridImplementation {
  // Responsive grid layout for creator cards
  // Infinite scroll implementation
  // Loading state with skeleton cards
  // Empty state when no creators match filters
}
```

### Onboarding Components

```typescript
// components/brand/onboarding/OnboardingStep.tsx

interface OnboardingStepImplementation {
  // Container for each onboarding step
  // Fade in/out animation between steps
  // Consistent padding and layout
  // Step title and description
}

// components/brand/onboarding/ProgressIndicator.tsx

interface ProgressIndicatorImplementation {
  // Visual progress bar showing current step
  // Step numbers and labels
  // Completed steps marked with checkmark
  // Current step highlighted
  // Clickable steps for navigation (if allowed)
}

// components/brand/onboarding/StepNavigation.tsx

interface StepNavigationImplementation {
  // Back and Next/Continue buttons
  // Disabled state when validation fails
  // Loading state during submission
  // Skip option for optional steps
}
```

### Trust Components

```typescript
// components/brand/trust/Testimonial.tsx

interface TestimonialImplementation {
  // Displays customer testimonial with quote
  // Shows author name, company, and avatar
  // Optional star rating
  // Card design with subtle shadow
}

// components/brand/trust/SecurityBadge.tsx

interface SecurityBadgeImplementation {
  // Displays security/compliance badge
  // Icon + label format
  // Types: SSL, GDPR, Payment Security, Encryption
  // Tooltip with additional information
}

// components/brand/trust/VerificationBadge.tsx

interface VerificationBadgeImplementation {
  // Small badge icon indicating verification
  // Tooltip showing verification type and date
  // Green checkmark icon
  // Can be inline or standalone
}

// components/brand/trust/SocialProof.tsx

interface SocialProofImplementation {
  // Displays platform statistics
  // Examples: "10,000+ brands", "50M+ reach", "98% satisfaction"
  // Large number with descriptive label
  // Animated counter on first view
}
```

### Shared Components

```typescript
// components/shared/EmptyState.tsx

interface EmptyStateImplementation {
  // Centered layout with icon, title, description
  // Optional CTA button
  // Friendly, helpful messaging
  // Consistent styling across all pages
}

// components/shared/LoadingState.tsx

interface LoadingStateImplementation {
  // Skeleton loaders matching content layout
  // Variants: card, list, table, custom skeleton
  // Animated shimmer effect
  // Configurable count for multiple items
}

// components/shared/ErrorState.tsx

interface ErrorStateImplementation {
  // Error icon and message
  // User-friendly error descriptions
  // Retry button
  // Optional support contact link
}

// components/shared/DataVisualization.tsx

interface DataVisualizationImplementation {
  // Chart components using Recharts or similar
  // Types: Line, Bar, Area, Pie
  // Responsive sizing
  // Tooltips on hover
  // Consistent color scheme
  // Loading state
}
```

## Data Models

### Dashboard Data

```typescript
// types/dashboard.ts

export interface DashboardMetrics {
  totalCampaigns: number;
  activeCampaigns: number;
  totalReach: number;
  totalEngagement: number;
  totalSpent: number;
  averageROI: number;
  trends: {
    campaigns: number;      // Percentage change
    reach: number;
    engagement: number;
    spent: number;
  };
}

export interface DashboardCampaign {
  id: string;
  name: string;
  status: CampaignStatus;
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  metrics: {
    reach: number;
    engagement: number;
    conversions: number;
    roi: number;
  };
  creators: {
    total: number;
    active: number;
  };
}

export interface SuggestedCreator {
  id: string;
  name: string;
  avatar: string;
  verified: boolean;
  niche: string[];
  followers: number;
  engagementRate: number;
  matchScore: number;      // 0-100 relevance score
  reason: string;          // Why suggested
}

export type CampaignStatus = 'active' | 'draft' | 'completed' | 'paused';
```

### Campaign Data

```typescript
// types/campaign.ts

export interface Campaign {
  id: string;
  brandId: string;
  name: string;
  description: string;
  status: CampaignStatus;
  budget: {
    total: number;
    spent: number;
    currency: string;
  };
  timeline: {
    startDate: string;
    endDate: string;
    createdAt: string;
    updatedAt: string;
  };
  targetAudience: {
    ageRange: [number, number];
    gender: 'all' | 'male' | 'female' | 'other';
    locations: string[];
    interests: string[];
  };
  contentRequirements: {
    platforms: string[];
    contentTypes: string[];
    guidelines: string;
    hashtags: string[];
  };
  metrics: CampaignMetrics;
  creators: string[];      // Creator IDs
}

export interface CampaignMetrics {
  reach: number;
  impressions: number;
  engagement: number;
  engagementRate: number;
  clicks: number;
  conversions: number;
  roi: number;
}

export interface CampaignFormData {
  name: string;
  description: string;
  budget: number;
  startDate: Date;
  endDate: Date;
  targetAudience: Campaign['targetAudience'];
  contentRequirements: Campaign['contentRequirements'];
}
```

### Creator Data

```typescript
// types/creator.ts

export interface Creator {
  id: string;
  name: string;
  email: string;
  avatar: string;
  verified: boolean;
  verifiedAt?: string;
  bio: string;
  niche: string[];
  location: string;
  socialMedia: {
    platform: string;
    handle: string;
    followers: number;
    engagementRate: number;
    averageViews: number;
    verified: boolean;
  }[];
  portfolio: {
    imageUrl: string;
    caption: string;
    platform: string;
    metrics: {
      likes: number;
      comments: number;
      shares: number;
      views: number;
    };
  }[];
  rates: {
    post: number;
    story: number;
    video: number;
    currency: string;
  };
  availability: boolean;
  rating: number;
  completedCampaigns: number;
}

export interface CreatorFilters {
  search: string;
  niche: string[];
  followerRange: [number, number];
  engagementRange: [number, number];
  verifiedOnly: boolean;
  availableOnly: boolean;
  platforms: string[];
}
```

### Onboarding Data

```typescript
// types/onboarding.ts

export interface BrandOnboardingData {
  step: number;
  completed: boolean;
  data: {
    // Step 1: Company Information
    companyName: string;
    industry: string;
    website: string;
    companySize: string;
    
    // Step 2: Brand Profile
    logo: string;
    description: string;
    targetAudience: string;
    brandValues: string[];
    
    // Step 3: Campaign Goals
    goals: string[];
    budget: {
      monthly: number;
      currency: string;
    };
    preferredPlatforms: string[];
    
    // Step 4: Contact & Billing
    contactPerson: {
      name: string;
      email: string;
      phone: string;
      role: string;
    };
    billingAddress: {
      street: string;
      city: string;
      state: string;
      zip: string;
      country: string;
    };
  };
}

export interface OnboardingStep {
  number: number;
  title: string;
  description: string;
  fields: OnboardingField[];
  optional: boolean;
}

export interface OnboardingField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'url' | 'textarea' | 'select' | 'multiselect' | 'file';
  placeholder?: string;
  helpText?: string;
  required: boolean;
  validation?: ValidationRule[];
}
```

### Trust Data

```typescript
// types/trust.ts

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  company: string;
  role: string;
  avatar?: string;
  rating: number;
  featured: boolean;
  createdAt: string;
}

export interface PlatformStats {
  totalBrands: number;
  totalCreators: number;
  totalCampaigns: number;
  totalReach: number;
  satisfactionRate: number;
  averageROI: number;
}

export interface SecurityFeature {
  type: 'ssl' | 'gdpr' | 'payment' | 'encryption' | 'backup';
  label: string;
  description: string;
  icon: string;
  certified: boolean;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property Reflection

After analyzing all acceptance criteria, I've identified the following consolidations to eliminate redundancy:

**Consolidations:**
1. Loading state properties (1.4, 9.1, 9.3, 9.5) can be combined into a single comprehensive property about loading indicators during async operations
2. Empty state properties (1.3, 3.3, 5.3) can be combined into a single property about empty states across all list/grid views
3. Card content properties (1.6, 3.2, 5.2) can be combined into a single property about required information on cards
4. Hover interaction properties (3.5, 5.5) can be combined into a single property about hover states on interactive cards
5. Responsive layout properties (8.1, 8.2, 8.4) can be combined into a single property about layout adaptation across breakpoints
6. Verification badge properties (5.6, 6.3) are identical and should be one property
7. CTA button properties (12.2, 12.4, 12.5) can be combined into a single property about CTAs on components

**Properties to Keep Separate:**
- Form validation properties (2.2, 2.3, 4.2, 4.4) address different aspects and should remain separate
- Trust indicator examples (6.1, 6.2, 6.4, 6.5) are specific to different pages and should remain separate
- Data visualization properties (10.2, 10.4, 10.5, 10.6) address different aspects and should remain separate

### Correctness Properties

Property 1: Loading indicators during async operations
*For any* component performing asynchronous data fetching, loading state indicators should be displayed until the operation completes
**Validates: Requirements 1.4, 9.1, 9.3, 9.5**

Property 2: Empty states with guidance
*For any* list or grid view with no items, an empty state component should be displayed with descriptive text and a relevant call-to-action
**Validates: Requirements 1.3, 3.3, 5.3**

Property 3: Required card information
*For any* card component (campaign, creator, metric), it should contain all required information fields specified for that card type
**Validates: Requirements 1.6, 3.2, 5.2**

Property 4: Progress indicator accuracy
*For any* step in the onboarding flow, the progress indicator should display the correct current step number and total step count
**Validates: Requirements 2.1**

Property 5: Form validation before progression
*For any* form step with validation rules, attempting to progress with invalid data should be prevented and validation errors should be displayed
**Validates: Requirements 2.2, 2.3**

Property 6: Data persistence across navigation
*For any* data entered in an onboarding step, navigating to a different step and returning should preserve the previously entered data
**Validates: Requirements 2.5**

Property 7: Contextual help text presence
*For any* form field in the onboarding or campaign creation forms, contextual help text should be present explaining the field's purpose
**Validates: Requirements 2.6**

Property 8: Filter and sort functionality
*For any* filter or sort operation applied to a list, the resulting items should match the specified criteria
**Validates: Requirements 3.1**

Property 9: Hover state feedback
*For any* interactive card component, hovering should trigger visual feedback (animation, additional information, or style changes)
**Validates: Requirements 3.5, 5.5**

Property 10: Status badge color coding
*For any* campaign with a status value, the displayed badge should use the color coding associated with that status
**Validates: Requirements 3.6**

Property 11: Real-time validation feedback
*For any* form field with validation rules, changing the field value should trigger validation and display feedback without requiring form submission
**Validates: Requirements 4.2**

Property 12: Placeholder text presence
*For any* input field in forms, placeholder text should be present providing examples or guidance
**Validates: Requirements 4.3**

Property 13: Required field validation
*For any* form with required fields, attempting submission with missing required fields should prevent submission and highlight the missing fields
**Validates: Requirements 4.4**

Property 14: Infinite scroll or pagination
*For any* large list of items (creators, campaigns), additional items should load when scrolling to the bottom or navigating to the next page
**Validates: Requirements 5.4**

Property 15: Verification badge display
*For any* verified creator, a verification badge should be displayed on their card and profile
**Validates: Requirements 5.6, 6.3**

Property 16: Security indicators for sensitive actions
*For any* sensitive action (payment, data submission), security confirmation dialogs and encryption indicators should be displayed
**Validates: Requirements 6.6**

Property 17: Responsive layout adaptation
*For any* viewport size (mobile, tablet, desktop), the layout should adapt appropriately with single-column on mobile, optimized grid on tablet, and multi-column on desktop
**Validates: Requirements 8.1, 8.2, 8.4**

Property 18: Collapsible filters on small screens
*For any* filter panel on small viewport sizes, the filters should be collapsible to save screen space
**Validates: Requirements 8.3**

Property 19: Minimum touch target and font sizes
*For any* interactive element and text content, minimum touch target sizes (44x44px) and readable font sizes (16px minimum) should be maintained across all breakpoints
**Validates: Requirements 8.5**

Property 20: Content reflow on orientation change
*For any* orientation change event, content should reflow without breaking layout or losing functionality
**Validates: Requirements 8.6**

Property 21: Error messages with recovery actions
*For any* error condition, a user-friendly error message with suggested recovery actions should be displayed
**Validates: Requirements 9.2**

Property 22: Time-series data visualization
*For any* time-series data, line or area charts should be used for visualization
**Validates: Requirements 10.2**

Property 23: Comparative data visualization
*For any* comparative metrics, bar charts or comparison cards should be used for visualization
**Validates: Requirements 10.4**

Property 24: Visualization tooltips
*For any* data visualization component, hovering over data points should display tooltips with detailed information
**Validates: Requirements 10.5**

Property 25: Responsive data visualizations
*For any* viewport size, data visualization components should adapt their dimensions while maintaining readability
**Validates: Requirements 10.6**

Property 26: Semantic heading hierarchy
*For any* page, heading elements should follow semantic hierarchy (H1 → H2 → H3) without skipping levels
**Validates: Requirements 11.6**

Property 27: Empty state CTAs
*For any* empty state component, a call-to-action button with a descriptive label should be present
**Validates: Requirements 12.2**

Property 28: Card action buttons
*For any* creator card, the specified action buttons (View Profile, Contact, Add to Campaign) should be present
**Validates: Requirements 12.4**

Property 29: Onboarding step navigation
*For any* onboarding step, a "Continue" or "Next Step" button should be present and enabled when validation passes
**Validates: Requirements 12.5**

## Error Handling

### Error Categories

1. **Network Errors**: Failed API requests, timeout errors, connection issues
2. **Validation Errors**: Invalid form inputs, missing required fields, format errors
3. **Authorization Errors**: Insufficient permissions, expired sessions, invalid tokens
4. **Data Errors**: Missing data, malformed responses, unexpected data types
5. **Client Errors**: JavaScript errors, rendering failures, state inconsistencies

### Error Handling Strategy

**Network Errors:**
- Display user-friendly error message explaining the issue
- Provide retry button for transient failures
- Show offline indicator when network is unavailable
- Implement exponential backoff for automatic retries
- Cache data when possible to show stale data during outages

**Validation Errors:**
- Display inline error messages next to relevant fields
- Highlight invalid fields with error styling
- Prevent form submission until errors are resolved
- Provide clear guidance on how to fix each error
- Show error summary at top of form for multiple errors

**Authorization Errors:**
- Redirect to login page for expired sessions
- Show permission denied message for insufficient access
- Provide contact support link for persistent issues
- Clear sensitive data from client state

**Data Errors:**
- Log errors to monitoring service for investigation
- Display generic error message to user
- Provide fallback UI or default values when safe
- Show empty state with explanation when data is unavailable

**Client Errors:**
- Implement error boundaries to catch React errors
- Log errors to monitoring service with stack traces
- Display fallback UI instead of blank screen
- Provide "Report Issue" button for users to submit feedback
- Implement automatic error recovery when possible

### Error UI Components

```typescript
// components/shared/ErrorBoundary.tsx
interface ErrorBoundaryImplementation {
  // Catches React errors in child components
  // Displays fallback UI with error message
  // Logs error to monitoring service
  // Provides reset button to attempt recovery
}

// components/shared/ErrorMessage.tsx
interface ErrorMessageImplementation {
  // Displays error with icon and message
  // Shows suggested actions (retry, contact support)
  // Supports different severity levels (error, warning, info)
  // Dismissible for non-critical errors
}

// components/shared/NetworkStatus.tsx
interface NetworkStatusImplementation {
  // Monitors online/offline status
  // Shows banner when offline
  // Automatically retries failed requests when back online
  // Indicates when showing cached data
}
```

### Error Recovery Patterns

1. **Automatic Retry**: Retry failed requests with exponential backoff
2. **Graceful Degradation**: Show partial UI with available data
3. **Optimistic Updates**: Update UI immediately, rollback on error
4. **Error Boundaries**: Isolate errors to prevent full page crashes
5. **Fallback Content**: Show cached or default content when fresh data unavailable

## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests for comprehensive coverage:

**Unit Tests** focus on:
- Specific examples of component rendering
- Edge cases (empty states, error states, loading states)
- User interaction flows (clicking buttons, filling forms)
- Integration between components
- Specific error conditions

**Property-Based Tests** focus on:
- Universal properties that hold for all inputs
- Component behavior across many generated inputs
- Validation logic with random valid/invalid data
- Responsive behavior across random viewport sizes
- Data transformation and display logic

### Testing Framework

**Framework**: Vitest + React Testing Library + Playwright
**Property-Based Testing Library**: fast-check (for TypeScript/JavaScript)
**Visual Regression**: Playwright screenshots
**Accessibility Testing**: axe-core + Playwright

### Property-Based Testing Configuration

- Each property test should run minimum 100 iterations
- Each test must reference its design document property
- Tag format: `// Feature: brand-ui-enhancement, Property {number}: {property_text}`
- Use fast-check generators for random test data

### Unit Testing Strategy

**Component Tests:**
- Test rendering with various props
- Test user interactions (clicks, hovers, form inputs)
- Test conditional rendering (loading, error, empty states)
- Test accessibility (ARIA labels, keyboard navigation)
- Mock Supabase calls and API responses

**Integration Tests:**
- Test complete user flows (onboarding, campaign creation)
- Test navigation between pages
- Test data persistence across navigation
- Test error recovery flows

**Visual Regression Tests:**
- Screenshot tests for each page at different breakpoints
- Compare against baseline images
- Test dark mode if implemented
- Test different data states (empty, loading, error, populated)

### Example Test Structure

```typescript
// Unit Test Example
describe('CampaignCard', () => {
  it('displays campaign name, status, and metrics', () => {
    const campaign = mockCampaign({ status: 'active' });
    render(<CampaignCard campaign={campaign} />);
    
    expect(screen.getByText(campaign.name)).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText(`${campaign.metrics.reach}`)).toBeInTheDocument();
  });
  
  it('shows empty state when no campaigns exist', () => {
    render(<CampaignList campaigns={[]} />);
    
    expect(screen.getByText(/no campaigns yet/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create campaign/i })).toBeInTheDocument();
  });
});

// Property-Based Test Example
describe('CampaignCard Properties', () => {
  it('Property 3: displays all required card information', () => {
    // Feature: brand-ui-enhancement, Property 3: For any campaign card, it should contain all required information fields
    
    fc.assert(
      fc.property(
        campaignArbitrary(),
        (campaign) => {
          const { container } = render(<CampaignCard campaign={campaign} />);
          
          // Verify all required fields are present
          expect(screen.getByText(campaign.name)).toBeInTheDocument();
          expect(screen.getByText(campaign.status)).toBeInTheDocument();
          expect(container.textContent).toContain(campaign.metrics.reach.toString());
          expect(container.textContent).toContain(campaign.metrics.engagement.toString());
          expect(screen.getByRole('button', { name: /view/i })).toBeInTheDocument();
          expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('Property 8: filters campaigns by criteria', () => {
    // Feature: brand-ui-enhancement, Property 8: For any filter operation, resulting items should match criteria
    
    fc.assert(
      fc.property(
        fc.array(campaignArbitrary(), { minLength: 10, maxLength: 50 }),
        fc.constantFrom('active', 'draft', 'completed', 'paused'),
        (campaigns, statusFilter) => {
          const { rerender } = render(<CampaignList campaigns={campaigns} />);
          
          // Apply filter
          const filterButton = screen.getByRole('button', { name: /filter/i });
          fireEvent.click(filterButton);
          const statusOption = screen.getByLabelText(statusFilter);
          fireEvent.click(statusOption);
          
          // Verify all displayed campaigns match filter
          const displayedCampaigns = screen.getAllByTestId('campaign-card');
          displayedCampaigns.forEach(card => {
            expect(card.textContent).toContain(statusFilter);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Accessibility Test Example
describe('Accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<BrandDashboard />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

// Visual Regression Test Example (Playwright)
test('dashboard matches screenshot at desktop size', async ({ page }) => {
  await page.goto('/dashboard/brand');
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveScreenshot('dashboard-desktop.png');
});
```

### Test Data Generators (fast-check)

```typescript
// test/generators.ts

import fc from 'fast-check';

export const campaignArbitrary = () => fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 5, maxLength: 50 }),
  status: fc.constantFrom('active', 'draft', 'completed', 'paused'),
  budget: fc.integer({ min: 1000, max: 100000 }),
  startDate: fc.date(),
  endDate: fc.date(),
  metrics: fc.record({
    reach: fc.integer({ min: 0, max: 1000000 }),
    engagement: fc.integer({ min: 0, max: 100000 }),
    conversions: fc.integer({ min: 0, max: 10000 }),
  }),
});

export const creatorArbitrary = () => fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 3, maxLength: 30 }),
  avatar: fc.webUrl(),
  verified: fc.boolean(),
  niche: fc.array(fc.constantFrom('fashion', 'tech', 'food', 'travel', 'fitness'), { minLength: 1, maxLength: 3 }),
  followers: fc.integer({ min: 1000, max: 10000000 }),
  engagementRate: fc.float({ min: 0.5, max: 15, noNaN: true }),
  averageViews: fc.integer({ min: 500, max: 5000000 }),
});

export const viewportArbitrary = () => fc.record({
  width: fc.integer({ min: 320, max: 2560 }),
  height: fc.integer({ min: 568, max: 1440 }),
});
```

### Testing Coverage Goals

- **Unit Test Coverage**: Minimum 80% code coverage
- **Property Test Coverage**: All 29 properties implemented as tests
- **Integration Test Coverage**: All critical user flows tested
- **Accessibility Coverage**: All pages pass axe-core audits
- **Visual Regression Coverage**: All pages at 3 breakpoints (mobile, tablet, desktop)

### Continuous Testing

- Run unit tests on every commit
- Run property tests on every pull request
- Run integration tests before deployment
- Run visual regression tests on UI changes
- Run accessibility tests on every pull request

## Implementation Notes

### Performance Considerations

1. **Code Splitting**: Split components by route for faster initial load
2. **Image Optimization**: Use Next.js Image component with proper sizing
3. **Lazy Loading**: Lazy load below-the-fold content and modals
4. **Memoization**: Use React.memo for expensive components
5. **Virtual Scrolling**: Implement virtual scrolling for long lists
6. **Debouncing**: Debounce search and filter inputs
7. **Caching**: Cache API responses with appropriate TTL

### Accessibility Requirements

1. **Keyboard Navigation**: All interactive elements accessible via keyboard
2. **Screen Reader Support**: Proper ARIA labels and landmarks
3. **Focus Management**: Visible focus indicators and logical focus order
4. **Color Contrast**: WCAG AA compliance (4.5:1 for normal text)
5. **Alternative Text**: Descriptive alt text for all images
6. **Form Labels**: Explicit labels for all form inputs
7. **Error Announcements**: Screen reader announcements for errors

### Browser Support

- Chrome/Edge: Last 2 versions
- Firefox: Last 2 versions
- Safari: Last 2 versions
- Mobile Safari: iOS 14+
- Chrome Mobile: Android 10+

### Animation Guidelines

- Use Framer Motion for complex animations
- Keep animations under 350ms for responsiveness
- Respect prefers-reduced-motion for accessibility
- Use GPU-accelerated properties (transform, opacity)
- Provide instant feedback for user interactions

### Design Token Usage

All components must use design tokens from `lib/design-tokens.ts` instead of hardcoded values. This ensures consistency and makes theme changes easier.

### Component Documentation

Each component should include:
- TypeScript interface for props
- JSDoc comments explaining purpose and usage
- Storybook story showing all variants
- Example usage in comments

### Migration Strategy

Since this is an enhancement of existing pages, the implementation should:
1. Create new components alongside existing ones
2. Test new components thoroughly
3. Gradually replace old components page by page
4. Keep old components as fallback during rollout
5. Monitor for issues and rollback if needed
6. Remove old components after successful migration
