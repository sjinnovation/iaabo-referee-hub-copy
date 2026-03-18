# Database Management Scripts

This folder contains helper scripts for managing database migrations and verifying system installation.

## Scripts

### `repair-migrations.js`

Analyzes migration status and suggests repair commands when local and remote migrations are out of sync.

**Usage:**
```bash
npm run db:migration:repair
```

**What it does:**
- Checks migration sync status
- Identifies local-only migrations
- Identifies remote-only migrations
- Suggests specific repair commands
- Provides actionable next steps

### `verify-db.js`

Verifies that the member progression system is properly installed and configured.

**Usage:**
```bash
npm run db:verify
```

**What it checks:**
- Member progression table exists
- Database functions are installed
- Enum types are created
- Triggers are configured
- Members have progression data
- Progression summary statistics

## Requirements

- Node.js (v18 or higher)
- Supabase CLI installed
- Project linked to remote database
- Network access

## Common Use Cases

### After Fresh Clone

```bash
npm install
npm run supabase:link
npm run db:push:all
npm run db:verify
```

### When Migrations are Out of Sync

```bash
npm run db:migration:repair
# Follow suggested commands
npm run db:status
```

### After Applying New Migration

```bash
npm run db:push
npm run db:verify
```

### Debugging Database Issues

```bash
npm run db:status
npm run db:verify
# Check output for specific errors
```

## Troubleshooting

### Scripts Don't Run

**Error: Cannot find module**
```bash
# Make sure you're in the project root
cd /path/to/iaabo-referee-hub
npm install
```

**Error: supabase: command not found**
```bash
# Install Supabase CLI
npm install -g supabase
# OR use npx
npx supabase --version
```

### Permission Issues

```bash
# Make scripts executable
chmod +x scripts/*.js
```

### Network Errors

```bash
# Check Supabase login
supabase login

# Check project link
supabase projects list
supabase link --project-ref YOUR_PROJECT_ID
```

## Adding New Scripts

When adding new database management scripts:

1. Create the script in this folder
2. Make it executable: `chmod +x scripts/your-script.js`
3. Add npm script to `package.json`:
   ```json
   "db:your-command": "node scripts/your-script.js"
   ```
4. Document it in this README
5. Update `docs/MIGRATION_COMMANDS.md`

## Related Documentation

- **Migration Commands Guide**: `../docs/MIGRATION_COMMANDS.md`
- **Testing Guide**: `../docs/TESTING_GUIDE.md`
- **Member Progression Docs**: `../docs/member-progression.md`
