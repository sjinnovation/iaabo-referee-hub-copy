# Infrastructure

## Overview

IAABO Referee Hub uses a serverless infrastructure model, leveraging managed services for all backend operations.

## Environments

| Environment | Purpose | URL |
|-------------|---------|-----|
| Development | Local development | `localhost:5173` |
| Production | Live application | Via Lovable deployment |

## Supabase Infrastructure

### Database

- **Engine**: PostgreSQL 15+
- **Location**: Configured per Supabase project
- **Backups**: Automatic daily backups (Supabase managed)

### Authentication

- **Provider**: Supabase Auth (GoTrue)
- **Methods**: Email/Password, (add others as implemented)
- **Sessions**: JWT-based, managed by Supabase

### Edge Functions

- **Runtime**: Deno
- **Location**: `supabase/functions/`
- **Deployment**: Via Supabase CLI or dashboard

### Storage

- **Type**: S3-compatible object storage
- **Usage**: (Document if/when file uploads are needed)

## Frontend Hosting

### Development

```bash
npm run dev     # Start Vite dev server
npm run build   # Production build
npm run preview # Preview production build
```

### Production

- Deployed via Lovable platform
- Static assets served from CDN
- Automatic HTTPS

## Environment Variables

### Required Variables

| Variable | Description | Where Set |
|----------|-------------|-----------|
| `VITE_SUPABASE_URL` | Supabase project URL | `.env` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key | `.env` |

### Local Development

Create `.env` file in project root:

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## CI/CD Pipeline

### Current Flow

1. Push to repository
2. Lovable detects changes
3. Build and deploy automatically

### Build Process

1. Install dependencies (`npm install`)
2. Run linting (`npm run lint`)
3. Build application (`npm run build`)
4. Deploy to CDN

## Monitoring & Logging

### Supabase Dashboard

- Database metrics
- Auth analytics
- Function logs
- Storage usage

### Application

- Browser console (development)
- Error tracking (implement as needed)

## Disaster Recovery

### Database

- Point-in-time recovery via Supabase
- Manual backups recommended before major changes

### Application

- Git repository serves as source of truth
- Redeploy from any commit if needed
