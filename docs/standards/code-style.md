# Code Style Guide

## Overview

This document defines the code style standards for IAABO Referee Hub.

## General Principles

1. **Readability over cleverness** - Write code that's easy to understand
2. **Consistency** - Follow existing patterns in the codebase
3. **Self-documenting** - Use clear names; comments for "why" not "what"

## Formatting

### Indentation and Spacing

- Use 2 spaces for indentation
- No trailing whitespace
- Single blank line between logical sections
- No multiple consecutive blank lines

### Line Length

- Soft limit: 100 characters
- Break long lines at logical points

### Braces and Brackets

```typescript
// Functions
function example() {
  // ...
}

// Conditionals
if (condition) {
  // ...
} else {
  // ...
}

// Objects
const obj = {
  key: value,
  anotherKey: anotherValue,
};

// Arrays
const arr = [
  item1,
  item2,
];
```

### Trailing Commas

Use trailing commas for multi-line arrays and objects:

```typescript
const config = {
  option1: true,
  option2: false, // trailing comma
};
```

## Imports

### Order

1. React and external libraries
2. Internal absolute imports
3. Relative imports
4. Type imports
5. Style imports

```typescript
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

import { formatDate } from './utils';

import type { User } from '@/types';
```

### Path Aliases

Use `@/` alias for absolute imports from `src/`:

```typescript
// Good
import { Button } from '@/components/ui/button';

// Avoid deep relative paths
import { Button } from '../../../components/ui/button';
```

## Functions

### Arrow Functions vs Function Declarations

- Use arrow functions for callbacks and inline functions
- Use function declarations for top-level functions

```typescript
// Top-level
function processData(data: Data): Result {
  return transform(data);
}

// Callback
const items = data.map((item) => item.id);
```

### Function Parameters

- Destructure objects when accessing multiple properties
- Use default parameters when appropriate

```typescript
function createUser({ name, email, role = 'user' }: CreateUserParams) {
  // ...
}
```

## Error Handling

```typescript
// Use try-catch for async operations
try {
  const result = await fetchData();
} catch (error) {
  console.error('Failed to fetch data:', error);
  // Handle error appropriately
}

// For Supabase operations
const { data, error } = await supabase.from('table').select();
if (error) {
  throw new Error(error.message);
}
```

## Comments

### When to Comment

- Complex business logic
- Non-obvious workarounds
- TODO items with context
- Public API documentation

### When NOT to Comment

- Obvious code behavior
- What the code does (should be clear from code)
- Commented-out code (delete it)

```typescript
// Good: Explains why
// Using setTimeout to debounce rapid state changes that cause flickering

// Bad: Explains what (obvious from code)
// Loop through users
for (const user of users) {
```

## Related

- [TypeScript Guidelines](./typescript-guidelines.md)
- [Component Guidelines](./component-guidelines.md)
