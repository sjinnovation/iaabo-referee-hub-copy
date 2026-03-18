# TypeScript Guidelines

## Overview

TypeScript conventions for IAABO Referee Hub.

## Configuration

The project uses strict TypeScript configuration. See `tsconfig.json` for full settings.

## Type Definitions

### Interfaces vs Types

Prefer interfaces for object shapes, types for unions/primitives:

```typescript
// Interface for objects
interface User {
  id: string;
  name: string;
  email: string;
}

// Type for unions
type Status = 'pending' | 'active' | 'inactive';

// Type for complex types
type AsyncResult<T> = { data: T; error: null } | { data: null; error: Error };
```

### Naming Conventions

- PascalCase for types and interfaces
- Avoid Hungarian notation (`IUser`, `TData`)
- Use descriptive names

```typescript
// Good
interface UserProfile {}
type PaymentStatus = 'pending' | 'completed';

// Avoid
interface IUser {}
type TStatus = string;
```

### Exporting Types

Export types from dedicated files:

```typescript
// types/user.ts
export interface User {
  id: string;
  name: string;
}

export type UserRole = 'admin' | 'user';
```

## Function Types

### Return Types

Explicitly type function return values:

```typescript
function getUser(id: string): User | null {
  // ...
}

async function fetchUsers(): Promise<User[]> {
  // ...
}
```

### Callback Types

Define callback signatures clearly:

```typescript
interface Props {
  onChange: (value: string) => void;
  onSubmit: (data: FormData) => Promise<void>;
}
```

## Generics

### When to Use

Use generics for reusable, type-safe utilities:

```typescript
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

interface ApiResponse<T> {
  data: T;
  error: string | null;
}
```

### Constraints

Constrain generics when needed:

```typescript
function getProperty<T extends object, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
```

## Type Narrowing

### Type Guards

Use type guards for runtime checks:

```typescript
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value
  );
}
```

### Discriminated Unions

Use discriminated unions for type safety:

```typescript
type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string };

function handleResult<T>(result: Result<T>) {
  if (result.success) {
    console.log(result.data); // TypeScript knows data exists
  } else {
    console.error(result.error); // TypeScript knows error exists
  }
}
```

## Null Handling

### Optional Properties

Use `?` for optional properties:

```typescript
interface Config {
  required: string;
  optional?: number;
}
```

### Null vs Undefined

- Use `undefined` for "not set" values
- Use `null` for "intentionally empty" values
- Be consistent within the codebase

### Non-null Assertion

Avoid `!` when possible; prefer type guards:

```typescript
// Avoid
const user = getUser()!;

// Prefer
const user = getUser();
if (!user) {
  throw new Error('User not found');
}
// user is now typed as non-null
```

## Enums

### Prefer Union Types

Union types are often simpler:

```typescript
// Prefer
type Status = 'pending' | 'active' | 'complete';

// Instead of
enum Status {
  Pending = 'pending',
  Active = 'active',
  Complete = 'complete',
}
```

### When to Use Enums

Use enums when:
- You need reverse mapping
- Values are used extensively
- Integration with non-TS code

## Type Assertions

### Avoid Excessive Casting

Let TypeScript infer when possible:

```typescript
// Avoid
const name = 'John' as string;

// Good
const name = 'John'; // TypeScript infers string
```

### Safe Assertions

Use `as const` for literal types:

```typescript
const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
} as const;
```

## Utility Types

Use built-in utility types:

```typescript
// Partial - all properties optional
type PartialUser = Partial<User>;

// Pick - select properties
type UserName = Pick<User, 'id' | 'name'>;

// Omit - exclude properties
type UserWithoutId = Omit<User, 'id'>;

// Record - typed object
type UserMap = Record<string, User>;
```

## Related

- [Code Style](./code-style.md)
- [Component Guidelines](./component-guidelines.md)
