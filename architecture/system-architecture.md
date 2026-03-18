# System Architecture

## Overview

IAABO Referee Hub is a web application designed to manage referee-related operations for IAABO (International Association of Approved Basketball Officials). The system follows a modern JAMstack architecture with a React frontend and Supabase backend.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                              │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                 React SPA (Vite)                         │    │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │    │
│  │  │ Pages   │  │Components│  │ Hooks   │  │ Context │    │    │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘    │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Supabase Platform                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐     │
│  │   Auth      │  │  Database   │  │   Edge Functions    │     │
│  │  (GoTrue)   │  │ (PostgreSQL)│  │    (Deno Deploy)    │     │
│  └─────────────┘  └─────────────┘  └─────────────────────┘     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐     │
│  │   Storage   │  │  Realtime   │  │   Row Level Sec.    │     │
│  └─────────────┘  └─────────────┘  └─────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React 18 | UI Framework |
| Build | Vite | Fast development & bundling |
| Language | TypeScript | Type safety |
| Styling | Tailwind CSS | Utility-first CSS |
| UI Components | shadcn/ui | Accessible component library |
| Backend | Supabase | Backend-as-a-Service |
| Database | PostgreSQL | Relational database |
| Auth | Supabase Auth | Authentication & authorization |
| State | React Query | Server state management |

## Key Design Principles

1. **Serverless First**: Leverage Supabase for backend operations
2. **Type Safety**: Full TypeScript coverage across the codebase
3. **Component-Based**: Modular, reusable UI components
4. **Security by Default**: Row Level Security (RLS) on all tables
5. **Performance**: Optimized builds with Vite, lazy loading where appropriate

## External Integrations

- **Supabase**: Primary backend platform
- **Lovable**: Development and deployment platform

## Deployment Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Developer  │────▶│   Lovable    │────▶│    CDN       │
│   (Local)    │     │  (Build/CI)  │     │  (Hosting)   │
└──────────────┘     └──────────────┘     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │   Supabase   │
                     │  (Backend)   │
                     └──────────────┘
```

## Related Documentation

- [Application Architecture](./application-architecture.md)
- [Infrastructure](./infrastructure.md)
- [Security Architecture](./security-architecture.md)
- [Data Flow](./data-flow.md)
