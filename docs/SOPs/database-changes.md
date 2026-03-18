# SOP: Database Changes

## Purpose

Safely make changes to the database schema.

## Scope

Use this procedure when:
- Adding new tables
- Modifying existing columns
- Creating indexes
- Adding or modifying RLS policies
- Creating database functions/triggers

## Prerequisites

- Supabase CLI installed (`npm install -g supabase`)
- Project linked (`supabase link`)
- Understanding of the change required
- Backup strategy for production (if applicable)

## Procedure

### Step 1: Create Migration File

```bash
supabase migration new descriptive_migration_name
```

This creates a new file in `supabase/migrations/`.

### Step 2: Write Migration SQL

Edit the created file with your SQL:

```sql
-- Example: Add new table
CREATE TABLE IF NOT EXISTS new_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- other columns
);

-- Enable RLS
ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own data"
ON new_table
FOR SELECT
USING (auth.uid() = user_id);
```

### Step 3: Test Locally

```bash
# Reset local database and apply all migrations
supabase db reset

# Or apply just the new migration
supabase db push --local
```

### Step 4: Generate Types

```bash
supabase gen types typescript --local > src/integrations/supabase/types.ts
```

### Step 5: Test Application

- Run the application locally
- Verify new schema works as expected
- Test RLS policies

### Step 6: Deploy to Production

```bash
# Push migrations to production
supabase db push
```

*Or use Supabase Dashboard for manual deployment.*

### Step 7: Update Documentation

- Update `docs/database/schema.md`
- Update changelog if significant

## Verification

- [ ] Migration applies without errors
- [ ] Application works with new schema
- [ ] RLS policies tested
- [ ] TypeScript types regenerated
- [ ] Documentation updated

## Rollback Procedure

**Warning**: Database rollbacks can be destructive.

1. **Create a rollback migration**:
   ```bash
   supabase migration new rollback_previous_change
   ```

2. **Write reversal SQL** (if possible)

3. **For production issues**, consider:
   - Point-in-time recovery (via Supabase)
   - Manual data correction
   - Temporary hotfix

## Best Practices

1. **Always use migrations** - Never modify production directly
2. **Small, incremental changes** - Easier to debug and rollback
3. **Test RLS policies** - Use Supabase dashboard to verify
4. **Non-destructive first** - Add columns as nullable initially
5. **Backup before major changes** - Especially on production

## Troubleshooting

### Migration fails to apply
- Check SQL syntax
- Verify referenced tables/columns exist
- Check for conflicts with existing data

### RLS policy blocks access
- Test in Supabase dashboard SQL editor
- Verify `auth.uid()` returns expected value
- Check policy conditions

### Types not updating
- Regenerate types: `supabase gen types typescript --local`
- Restart TypeScript server in IDE
- Check for import errors

## Related

- [Database Documentation](../database/)
- [Security Architecture](../../architecture/security-architecture.md)
- [Supabase Migrations Guide](https://supabase.com/docs/guides/cli/local-development#database-migrations)

## Revision History

| Date | Author | Changes |
|------|--------|---------|
| 2024-XX-XX | - | Initial version |
