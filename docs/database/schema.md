# Database Schema

## Overview

This document describes the database schema for IAABO Referee Hub.

## Entity Relationship Diagram

```
┌─────────────────┐
│     users       │
│ (Supabase Auth) │
└────────┬────────┘
         │
         │ 1:1
         ▼
┌─────────────────┐
│    profiles     │
│                 │
└─────────────────┘

(Add more entities as the schema grows)
```

## Tables

### profiles

User profile information extending Supabase Auth.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | - | Primary key, references auth.users |
| created_at | timestamptz | NO | now() | Creation timestamp |
| updated_at | timestamptz | YES | - | Last update timestamp |
| ... | ... | ... | ... | (Add columns as needed) |

**Indexes:**
- `profiles_pkey` - Primary key on `id`

**RLS Policies:**
- Users can read their own profile
- Users can update their own profile

---

<!-- Template for additional tables:

### table_name

Brief description of what this table stores.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| ... | ... | ... | ... | ... |

**Relationships:**
- `column_name` references `other_table(column)`

**Indexes:**
- Index description

**RLS Policies:**
- Policy description

-->

## Enums

Document any custom PostgreSQL enums here:

```sql
-- Example:
-- CREATE TYPE user_role AS ENUM ('admin', 'referee', 'assignor');
```

## Functions

Document any PostgreSQL functions:

```sql
-- Example:
-- CREATE FUNCTION function_name() RETURNS type AS $$
-- ...
-- $$ LANGUAGE plpgsql;
```

## Triggers

Document any database triggers:

| Trigger | Table | Event | Description |
|---------|-------|-------|-------------|
| ... | ... | ... | ... |

## Maintenance Notes

- Keep this document updated when schema changes
- Run `supabase gen types` after schema changes
- Test RLS policies thoroughly
