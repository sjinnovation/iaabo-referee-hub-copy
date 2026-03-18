# API Documentation

## Overview

This directory contains API documentation for IAABO Referee Hub.

## API Architecture

The application uses Supabase as its API layer:

1. **Supabase Client API** - Direct database access via PostgREST
2. **Edge Functions** - Custom serverless functions for complex operations

## Contents

- `endpoints.md` - API endpoint documentation
- `authentication.md` - Auth flow documentation
- `edge-functions/` - Edge function documentation

## Quick Reference

### Supabase Client

```typescript
import { supabase } from '@/integrations/supabase/client';

// Query data
const { data, error } = await supabase
  .from('table_name')
  .select('*');

// Insert data
const { data, error } = await supabase
  .from('table_name')
  .insert({ column: value });

// Update data
const { data, error } = await supabase
  .from('table_name')
  .update({ column: value })
  .eq('id', id);

// Delete data
const { data, error } = await supabase
  .from('table_name')
  .delete()
  .eq('id', id);
```

### Edge Functions

```typescript
// Call an edge function
const { data, error } = await supabase.functions.invoke('function-name', {
  body: { param: value }
});
```

## Error Handling

All Supabase operations return `{ data, error }`:

```typescript
const { data, error } = await supabase.from('table').select();

if (error) {
  console.error('Error:', error.message);
  return;
}

// Use data
```

## Authentication

See [authentication.md](./authentication.md) for detailed auth documentation.

## Rate Limiting

Supabase handles rate limiting. For heavy operations, consider:
- Pagination
- Debouncing
- Caching with React Query

## Related Documentation

- [Supabase REST API](https://supabase.com/docs/guides/api)
- [PostgREST](https://postgrest.org/)
- [Architecture - Data Flow](../../architecture/data-flow.md)
