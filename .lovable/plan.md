

## Verification Results

### What's confirmed working
- The `handle_new_user()` trigger function is correctly updated with all profile fields
- The trigger `on_auth_user_created` IS properly attached to `auth.users`
- The Supabase auth service restarted (confirming the "Confirm email" setting change was applied)
- The two existing users (superadmin, ratulsarkar) have profiles and roles

### What still needs fixing

**The test user `soumik.sarkar@sjinnovation.com` has no profile or role record.** This user was created BEFORE the trigger was fixed, so they were never backfilled. They exist in `auth.users` but not in `profiles` or `user_roles`.

### Plan: Backfill missing profile

Run a data operation to insert the missing profile and role for `soumik.sarkar@sjinnovation.com` by querying their ID from `auth.users` metadata.

Since we cannot query `auth.users` directly via the client, the approach is:

1. Use the Supabase Dashboard to find the user's UUID from **Authentication > Users**
2. Insert the profile row and `public_user` role using that UUID

Alternatively, the simplest fix: **delete the test user from Supabase Auth dashboard and re-register them**. Since the trigger is now working correctly and email confirmation is disabled, the new registration will create the complete profile automatically.

### Recommended approach

Delete `soumik.sarkar@sjinnovation.com` from the [Supabase Auth Users page](https://supabase.com/dashboard/project/wbwevpmcuvawykfyrxvi/auth/users), then re-register through the public registration form. This will:
- Create the auth user
- Trigger `handle_new_user()` which creates the full profile + `public_user` role
- No confirmation email will be sent
- The user will appear on the Admin Registrations page immediately

### To fully verify after re-registration
- Check `profiles` table for the new row with all fields populated
- Check `user_roles` table for the `public_user` role entry
- Log in as admin and confirm the user appears on the Registrations page

