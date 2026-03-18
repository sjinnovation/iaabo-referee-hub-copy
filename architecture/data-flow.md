# Data Flow

## Overview

This document describes how data flows through the IAABO Referee Hub application.

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              React Components                            │   │
│  │  ┌────────────┐    ┌────────────┐    ┌────────────┐    │   │
│  │  │   Forms    │    │   Lists    │    │  Details   │    │   │
│  │  └─────┬──────┘    └─────┬──────┘    └─────┬──────┘    │   │
│  └────────┼─────────────────┼─────────────────┼───────────┘   │
└───────────┼─────────────────┼─────────────────┼───────────────┘
            │                 │                 │
            ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Custom Hooks Layer                          │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  useQuery / useMutation (React Query)                      │ │
│  │  - Caching                                                  │ │
│  │  - Optimistic Updates                                       │ │
│  │  - Background Refetching                                    │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Supabase Client Layer                          │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  - Query Builder                                            │ │
│  │  - Authentication                                           │ │
│  │  - Realtime Subscriptions                                   │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS/WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Supabase Backend                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  PostgreSQL  │  │    Auth      │  │   Storage    │          │
│  │   + RLS      │  │   (GoTrue)   │  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

## Read Operations

### Query Flow

1. **Component mounts** or triggers data fetch
2. **React Query** checks cache
   - If cached and fresh: return cached data
   - If stale or missing: fetch from server
3. **Supabase client** constructs query
4. **Request sent** to Supabase
5. **RLS policies** applied by PostgreSQL
6. **Data returned** to client
7. **React Query** caches response
8. **Component re-renders** with data

### Example

```typescript
// Component
const { data, isLoading } = useQuery({
  queryKey: ['referees'],
  queryFn: () => supabase.from('referees').select('*')
});

// Supabase processes:
// 1. Validate JWT
// 2. Apply RLS policies
// 3. Execute query
// 4. Return results
```

## Write Operations

### Mutation Flow

1. **User action** triggers mutation
2. **Form validation** (Zod + React Hook Form)
3. **Optimistic update** (optional)
4. **Supabase client** sends mutation
5. **RLS policies** validated
6. **Database updated**
7. **Response returned**
8. **React Query** invalidates related queries
9. **UI updates** with fresh data

### Example

```typescript
const mutation = useMutation({
  mutationFn: (data) => supabase.from('referees').insert(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['referees'] });
  }
});
```

## Authentication Flow

```
┌───────────┐     ┌───────────┐     ┌───────────┐
│   User    │────▶│  Auth UI  │────▶│ Supabase  │
│           │     │           │     │   Auth    │
└───────────┘     └───────────┘     └─────┬─────┘
                                          │
                  ┌───────────────────────┘
                  │ JWT Token
                  ▼
┌─────────────────────────────────────────────────┐
│              Auth Context                        │
│  ┌──────────────┐  ┌──────────────────────┐    │
│  │ User State   │  │ Session Management   │    │
│  └──────────────┘  └──────────────────────┘    │
└─────────────────────────────────────────────────┘
                  │
                  ▼ Protected Routes
┌─────────────────────────────────────────────────┐
│              Application                         │
└─────────────────────────────────────────────────┘
```

## Realtime Data (If Implemented)

```typescript
// Subscribe to changes
supabase
  .channel('referees')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'referees' },
    (payload) => {
      // Update local state
      queryClient.invalidateQueries({ queryKey: ['referees'] });
    }
  )
  .subscribe();
```

## Error Handling Flow

```
Error Occurs
     │
     ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ API Error   │────▶│ Hook Layer  │────▶│ Error Toast │
│             │     │ (onError)   │     │ / Boundary  │
└─────────────┘     └─────────────┘     └─────────────┘
```

## Data Caching Strategy

| Data Type | Cache Time | Stale Time | Refetch On |
|-----------|------------|------------|------------|
| User Profile | 5 min | 1 min | Window focus |
| List Data | 5 min | 30 sec | Mount, Focus |
| Static Data | 30 min | 10 min | Mount |

## Performance Optimizations

1. **Pagination**: Large lists paginated server-side
2. **Select fields**: Only fetch needed columns
3. **Debouncing**: Search/filter inputs debounced
4. **Lazy Loading**: Components/routes code-split
5. **Memoization**: Expensive computations cached
