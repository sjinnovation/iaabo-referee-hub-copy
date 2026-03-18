# Authentication

## Overview

IAABO Referee Hub uses Supabase Auth for user authentication.

## Authentication Methods

### Email/Password

Primary authentication method.

```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});

// Sign out
const { error } = await supabase.auth.signOut();
```

## Session Management

### Getting Current Session

```typescript
const { data: { session } } = await supabase.auth.getSession();
```

### Getting Current User

```typescript
const { data: { user } } = await supabase.auth.getUser();
```

### Listening for Auth Changes

```typescript
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    // User signed in
  } else if (event === 'SIGNED_OUT') {
    // User signed out
  }
});
```

## Protected Routes

Routes that require authentication should check session:

```typescript
// In route component or guard
const { data: { session } } = await supabase.auth.getSession();

if (!session) {
  // Redirect to login
}
```

## Password Reset

```typescript
// Request reset
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: 'https://yourapp.com/reset-password'
});

// Update password (after user clicks link)
const { error } = await supabase.auth.updateUser({
  password: 'new-password'
});
```

## Email Verification

Configure in Supabase Dashboard:
- Settings → Authentication → Email Templates
- Enable/disable email confirmation requirement

## Token Refresh

Supabase client handles token refresh automatically. Sessions persist across browser sessions by default.

## Security Considerations

1. **Never expose service role key** - Only use anon key in frontend
2. **Use RLS** - Protect data at database level
3. **Validate on server** - Don't trust client-side validation alone
4. **HTTPS only** - All auth traffic over secure connections

## Related Documentation

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Security Architecture](../../architecture/security-architecture.md)
