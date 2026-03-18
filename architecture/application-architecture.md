# Application Architecture

## Overview

This document describes the frontend application architecture for IAABO Referee Hub.

## Directory Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui base components
│   └── [feature]/      # Feature-specific components
├── pages/              # Page components (routes)
├── hooks/              # Custom React hooks
├── contexts/           # React Context providers
├── services/           # Business logic services
├── integrations/       # External service integrations
│   └── supabase/       # Supabase client & types
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── data/               # Static data & constants
├── config/             # App configuration
├── lib/                # Library configurations
└── assets/             # Static assets
```

## Component Architecture

### Component Hierarchy

```
App
├── Providers (Auth, Theme, Query)
│   └── Router
│       └── Layout
│           ├── Header/Navigation
│           ├── Page Content
│           └── Footer
```

### Component Categories

1. **UI Components** (`components/ui/`)
   - Base components from shadcn/ui
   - Styled with Tailwind CSS
   - Accessible by default

2. **Feature Components** (`components/[feature]/`)
   - Domain-specific components
   - Compose UI components
   - Contain business logic

3. **Page Components** (`pages/`)
   - Route-level components
   - Handle data fetching
   - Compose feature components

## State Management

### Server State (React Query)

- All server data managed via React Query
- Automatic caching and refetching
- Optimistic updates where appropriate

### Client State

- **React Context**: Global UI state (auth, theme)
- **Component State**: Local UI state (forms, modals)
- **URL State**: Navigation and filters

## Data Flow

```
User Action → Component → Hook/Service → Supabase → Database
                                              ↓
                                         Response
                                              ↓
User ← Component ← React Query Cache ← Hook/Service
```

## Routing

Using React Router DOM v6:

- File-based route organization in `pages/`
- Protected routes for authenticated content
- Lazy loading for code splitting

## Error Handling

1. **API Errors**: Caught in hooks, displayed via toast
2. **Component Errors**: Error boundaries
3. **Form Errors**: React Hook Form validation

## Performance Considerations

- Code splitting via dynamic imports
- Image optimization
- Memoization of expensive computations
- Efficient re-renders with proper key usage
