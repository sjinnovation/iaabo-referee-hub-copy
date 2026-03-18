# SOP: Deployment

## Purpose

Deploy IAABO Referee Hub to production.

## Scope

Use this procedure when:
- Releasing new features
- Deploying bug fixes
- Updating production environment

## Prerequisites

- All tests passing
- Code reviewed and approved
- Changes merged to main branch
- Access to deployment platform

## Procedure

### Step 1: Verify Code is Ready

```bash
# Ensure on latest main
git checkout main
git pull origin main

# Run linting
npm run lint

# Build locally to verify
npm run build
```

### Step 2: Deploy via Lovable

1. Open [Lovable Dashboard](https://lovable.dev/projects/222e730d-6de4-4798-8c3e-75852472fff9)
2. Navigate to Share → Publish
3. Confirm deployment

*Note: Lovable automatically deploys on push to main.*

### Step 3: Verify Deployment

1. Visit production URL
2. Check key functionality:
   - [ ] Page loads correctly
   - [ ] Authentication works
   - [ ] Core features function
   - [ ] No console errors

### Step 4: Monitor

- Check browser console for errors
- Monitor Supabase dashboard for issues
- Watch for user-reported problems

## Rollback Procedure

If issues are detected:

1. **Identify the problem** - Check console, network, Supabase logs
2. **Revert if necessary**:
   ```bash
   git revert <commit-hash>
   git push origin main
   ```
3. **Redeploy** - Lovable will auto-deploy the revert
4. **Document** - Record the issue in [Issues](../issues/)

## Verification

- [ ] Production site loads
- [ ] No critical errors in console
- [ ] Authentication functional
- [ ] Key features working
- [ ] Database operations successful

## Troubleshooting

### Build fails
- Check `npm run build` output
- Fix TypeScript/ESLint errors
- Verify all dependencies installed

### Site shows old version
- Hard refresh (Ctrl+Shift+R)
- Clear browser cache
- Check CDN propagation (may take a few minutes)

### Features broken in production only
- Verify environment variables set correctly
- Check Supabase RLS policies
- Review browser console for errors

## Related

- [Development Setup](./development-setup.md)
- [Infrastructure](../../architecture/infrastructure.md)
- [Changelog](../changelog.md)

## Revision History

| Date | Author | Changes |
|------|--------|---------|
| 2024-XX-XX | - | Initial version |
