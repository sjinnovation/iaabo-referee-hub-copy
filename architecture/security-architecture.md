# Security Architecture

## Overview

This document outlines the security measures and practices for IAABO Referee Hub.

## Authentication

### Implementation

- **Provider**: Supabase Auth
- **Token Type**: JWT (JSON Web Tokens)
- **Storage**: Handled by Supabase client (secure httpOnly cookies where possible)

### Authentication Flow

```
1. User submits credentials
2. Supabase Auth validates
3. JWT issued on success
4. Token stored securely
5. Token sent with subsequent requests
6. Supabase validates token server-side
```

### Session Management

- Automatic token refresh
- Session persistence across browser sessions
- Secure logout (token invalidation)

## Authorization

### Row Level Security (RLS)

All database tables use PostgreSQL Row Level Security:

```sql
-- Example policy
CREATE POLICY "Users can read own data"
ON users
FOR SELECT
USING (auth.uid() = id);
```

### Authorization Levels

| Role | Description | Access |
|------|-------------|--------|
| Anonymous | Not logged in | Public content only |
| Authenticated | Logged in user | Own data + public |
| Admin | Administrator | Full access (implement as needed) |

## Data Protection

### Data at Rest

- Database encrypted by Supabase
- Backups encrypted

### Data in Transit

- All connections over HTTPS/TLS
- Supabase enforces SSL for database connections

### Sensitive Data Handling

- Passwords hashed by Supabase Auth (bcrypt)
- API keys stored in environment variables
- No sensitive data in client-side code

## API Security

### Supabase Client

- Anon key is public (by design)
- RLS policies protect data
- Service role key never exposed to client

### Edge Functions

- Input validation required
- CORS configured appropriately
- Rate limiting via Supabase

## Frontend Security

### Content Security Policy

Consider implementing CSP headers for:
- Script sources
- Style sources
- Image sources
- Connect sources (API endpoints)

### XSS Prevention

- React's default escaping
- Avoid `dangerouslySetInnerHTML`
- Sanitize user input

### CSRF Protection

- Supabase handles CSRF for auth
- Use proper headers for custom endpoints

## Environment Security

### Development

- Use `.env` for local secrets
- Never commit `.env` files
- `.gitignore` includes sensitive files

### Production

- Secrets managed via Lovable/Supabase dashboards
- Rotate keys periodically
- Audit access regularly

## Security Checklist

- [ ] RLS enabled on all tables
- [ ] RLS policies tested
- [ ] Environment variables secured
- [ ] HTTPS enforced
- [ ] Input validation implemented
- [ ] Error messages don't leak info
- [ ] Dependencies regularly updated
- [ ] Security headers configured

## Incident Response

1. **Identify**: Detect the security issue
2. **Contain**: Limit the damage (rotate keys, disable access)
3. **Investigate**: Determine scope and cause
4. **Remediate**: Fix the vulnerability
5. **Document**: Record lessons learned

## Compliance Considerations

Document any relevant compliance requirements:
- Data privacy regulations
- Industry-specific requirements
- Organizational policies
