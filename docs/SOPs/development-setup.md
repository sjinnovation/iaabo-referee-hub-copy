# SOP: Development Setup

## Purpose

Set up a local development environment for IAABO Referee Hub.

## Scope

Use this procedure when:
- Setting up a new development machine
- Onboarding new team members
- Resetting development environment

## Prerequisites

- Node.js 18+ installed ([install with nvm](https://github.com/nvm-sh/nvm))
- Git installed
- Access to the repository
- Supabase project credentials

## Procedure

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd iaabo-referee-hub
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Get these values from:
- Supabase Dashboard → Project Settings → API

### Step 4: Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Step 5: (Optional) Set Up Supabase CLI

For local database development:

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Start local Supabase
supabase start
```

## Verification

- [ ] `npm run dev` starts without errors
- [ ] Application loads in browser
- [ ] Can connect to Supabase (check network tab)
- [ ] Authentication works (if testing auth)

## Troubleshooting

### "Module not found" errors
```bash
rm -rf node_modules
npm install
```

### Port 5173 already in use
```bash
# Find and kill the process
lsof -i :5173
kill -9 <PID>

# Or use a different port
npm run dev -- --port 3000
```

### Environment variables not loading
- Ensure `.env` file is in project root
- Restart the dev server after changes
- Variables must start with `VITE_` to be exposed to client

### Supabase connection errors
- Verify `.env` values are correct
- Check Supabase project is active
- Ensure you're using anon key, not service role key

## Related

- [Infrastructure](../../architecture/infrastructure.md)
- [Deployment SOP](./deployment.md)

## Revision History

| Date | Author | Changes |
|------|--------|---------|
| 2024-XX-XX | - | Initial version |
