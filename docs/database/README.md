# Database Documentation

## Overview

This directory contains documentation for the IAABO Referee Hub database, powered by Supabase (PostgreSQL).

## Contents

- `schema.md` - Database schema documentation
- `migrations.md` - Migration history and guidelines
- `rls-policies.md` - Row Level Security policies

## Quick Reference

### Database Access

- **Dashboard**: Supabase project dashboard
- **Local Development**: `supabase start` (Supabase CLI)
- **Migrations**: `supabase/migrations/`

### Schema Management

1. Create migrations locally:
   ```bash
   supabase migration new migration_name
   ```

2. Apply migrations:
   ```bash
   supabase db push
   ```

3. Generate TypeScript types:
   ```bash
   supabase gen types typescript --local > src/integrations/supabase/types.ts
   ```

## Best Practices

1. **Always use migrations** - Never modify production schema directly
2. **Enable RLS** - All tables should have Row Level Security
3. **Document changes** - Update schema docs when adding tables/columns
4. **Test locally** - Verify migrations work before deploying
5. **Backup first** - Take backups before major schema changes

## Related Documentation

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Architecture - Data Flow](../../architecture/data-flow.md)
