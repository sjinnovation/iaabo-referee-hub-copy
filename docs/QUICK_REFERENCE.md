# Quick Reference: Database Migration Commands

## 🚀 Most Common Commands

```bash
# Check what needs to be synced
npm run db:status

# Fix migration sync issues
npm run db:migration:repair

# Push all local migrations to remote
npm run db:push:all

# Verify member progression system
npm run db:verify
```

## 📋 Full Command List

| Command | Description |
|---------|-------------|
| `npm run db:status` | Check migration sync status between local and remote |
| `npm run db:push` | Push pending migrations to remote database |
| `npm run db:push:all` | Push ALL migrations (including out-of-order) |
| `npm run db:pull` | Pull schema changes from remote database |
| `npm run db:reset` | Reset local database (DEVELOPMENT ONLY) |
| `npm run db:diff` | Show differences between local and remote |
| `npm run db:migration:new` | Create new migration file |
| `npm run db:migration:repair` | Analyze and fix migration issues |
| `npm run db:verify` | Verify member progression installation |
| `npm run supabase:start` | Start local Supabase instance |
| `npm run supabase:stop` | Stop local Supabase instance |
| `npm run supabase:link` | Link to remote Supabase project |

## 🔥 Emergency Fixes

### Problem: Migrations Out of Sync

```bash
npm run db:migration:repair
# Read output and follow suggestions
npm run db:push:all
npm run db:status  # Verify fixed
```

### Problem: Can't Push Migrations

```bash
# If error mentions "inserted before last migration"
npm run db:push:all

# If error mentions "not found in local"
npm run db:pull
npm run db:push:all
```

### Problem: Member Dashboard Not Showing Progression

```bash
# 1. Verify database
npm run db:verify

# 2. Check migration status
npm run db:status

# 3. If migrations not applied
npm run db:push:all

# 4. Restart dev server
npm run dev
```

### Problem: Network/Connection Errors

```bash
# Re-login to Supabase
supabase login

# Re-link project
npm run supabase:link

# Try again
npm run db:status
```

## 🎯 Common Workflows

### After Git Pull (New Migrations)

```bash
git pull
npm run db:status
npm run db:push:all
npm run db:verify
```

### Creating New Migration

```bash
npm run db:migration:new my_feature
# Edit file in supabase/migrations/
npm run db:push
```

### Fresh Setup

```bash
npm install
npm run supabase:link
npm run db:push:all
npm run db:verify
npm run dev
```

## 📊 Verification Queries (SQL Editor)

```sql
-- Check member progression table
SELECT COUNT(*) FROM member_progression;

-- Check all functions exist
SELECT proname FROM pg_proc 
WHERE proname IN (
  'initialize_member_progression',
  'update_progression_step',
  'get_member_progression_summary'
);

-- View progression summary
SELECT step_type, status, COUNT(*) as count
FROM member_progression
GROUP BY step_type, status;
```

## 🆘 When Nothing Works

```bash
# 1. Check status
npm run db:status

# 2. Try repair
npm run db:migration:repair

# 3. If still broken, apply via Dashboard:
#    - Go to Supabase Dashboard → SQL Editor
#    - Copy contents of migration file
#    - Paste and run
#    - Verify with: npm run db:verify

# 4. Last resort - get help:
#    - Check docs/TROUBLESHOOTING.md
#    - Check Supabase logs in dashboard
#    - Review error messages carefully
```

## 📚 Documentation Links

- **Full Guide**: `docs/MIGRATION_COMMANDS.md`
- **Testing**: `docs/TESTING_GUIDE.md`
- **Admin Help**: `docs/ADMIN_QUICK_REFERENCE.md`
- **System Info**: `docs/member-progression.md`

---

**💡 Pro Tip:** Run `npm run db:status` before and after any database command to see what changed.

**🔒 Safety:** Always run `npm run db:verify` after applying migrations to ensure everything works.

**⚡ Speed:** Use `npm run db:migration:repair` first - it tells you exactly what to do!
