# React Component Guidelines

## Overview

Guidelines for writing React components in IAABO Referee Hub.

## Component Structure

### File Organization

```typescript
// 1. Imports
import React from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Types
interface ComponentProps {
  title: string;
  onAction: () => void;
}

// 3. Component
export function Component({ title, onAction }: ComponentProps) {
  // 3a. Hooks
  const [state, setState] = useState();
  const { data } = useQuery();

  // 3b. Derived state
  const computedValue = useMemo(() => compute(data), [data]);

  // 3c. Handlers
  const handleClick = () => {
    onAction();
  };

  // 3d. Effects
  useEffect(() => {
    // ...
  }, []);

  // 3e. Render
  return (
    <div>
      <h1>{title}</h1>
      <button onClick={handleClick}>Action</button>
    </div>
  );
}
```

## Component Types

### UI Components (`components/ui/`)

- Pure presentational components
- Use shadcn/ui components as base
- Accept className for styling flexibility

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive';
}

export function Button({ variant = 'default', className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant }), className)}
      {...props}
    />
  );
}
```

### Feature Components

- Contain business logic
- Compose UI components
- May fetch data

```typescript
export function UserList() {
  const { data: users, isLoading } = useUsers();

  if (isLoading) return <Skeleton />;

  return (
    <ul>
      {users?.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </ul>
  );
}
```

### Page Components (`pages/`)

- Route-level components
- Handle layout
- Coordinate feature components

```typescript
export function DashboardPage() {
  return (
    <PageLayout>
      <PageHeader title="Dashboard" />
      <div className="grid gap-4">
        <StatsSection />
        <RecentActivity />
      </div>
    </PageLayout>
  );
}
```

## Props

### Typing Props

Always define explicit prop types:

```typescript
interface Props {
  required: string;
  optional?: number;
  children: React.ReactNode;
  onEvent: (id: string) => void;
}
```

### Destructuring

Destructure props in function signature:

```typescript
// Good
function Component({ title, onAction }: Props) {

// Avoid
function Component(props: Props) {
  const { title, onAction } = props;
```

### Spreading Props

Use sparingly and explicitly:

```typescript
// Good: spread remaining props to underlying element
function Input({ label, ...inputProps }: InputProps) {
  return (
    <div>
      <label>{label}</label>
      <input {...inputProps} />
    </div>
  );
}
```

## State Management

### Local State

Use for component-specific UI state:

```typescript
const [isOpen, setIsOpen] = useState(false);
```

### Server State

Use React Query for server data:

```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
});
```

### Global State

Use React Context for truly global state (auth, theme):

```typescript
const { user } = useAuth();
```

## Hooks

### Custom Hooks

Extract reusable logic into hooks:

```typescript
// hooks/useUsers.ts
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => supabase.from('users').select(),
  });
}
```

### Hook Rules

- Call at top level only
- Call in React functions only
- Custom hooks start with `use`

## Performance

### Memoization

Use when computation is expensive or for referential stability:

```typescript
const expensiveValue = useMemo(() => computeExpensive(data), [data]);
const stableCallback = useCallback(() => doSomething(id), [id]);
```

### Keys

Use stable, unique keys for lists:

```typescript
// Good
{items.map((item) => <Item key={item.id} />)}

// Avoid
{items.map((item, index) => <Item key={index} />)}
```

## Accessibility

- Use semantic HTML elements
- Include proper ARIA attributes
- Ensure keyboard navigation
- Test with screen readers

```typescript
<button
  onClick={handleClick}
  aria-label="Close dialog"
  aria-expanded={isOpen}
>
  <CloseIcon />
</button>
```

## Related

- [Code Style](./code-style.md)
- [TypeScript Guidelines](./typescript-guidelines.md)
