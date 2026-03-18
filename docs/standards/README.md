# Coding Standards

## Overview

This directory contains coding standards and guidelines for IAABO Referee Hub development.

## Standards Documents

| Document | Description |
|----------|-------------|
| [Code Style](./code-style.md) | Code formatting and style guidelines |
| [Component Guidelines](./component-guidelines.md) | React component best practices |
| [TypeScript Guidelines](./typescript-guidelines.md) | TypeScript conventions |
| [Git Workflow](./git-workflow.md) | Git branching and commit conventions |

## Quick Reference

### Code Formatting

- **Indentation**: 2 spaces
- **Quotes**: Single quotes for JS/TS, double for JSX attributes
- **Semicolons**: Required
- **Line length**: 100 characters max (soft limit)

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `UserProfile.tsx` |
| Hooks | camelCase with `use` prefix | `useAuth.ts` |
| Utilities | camelCase | `formatDate.ts` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_RETRIES` |
| Types/Interfaces | PascalCase | `UserProfile` |
| CSS Classes | kebab-case (via Tailwind) | `text-primary` |

### File Organization

```
src/
├── components/     # React components
├── pages/          # Page/route components
├── hooks/          # Custom hooks
├── contexts/       # React contexts
├── services/       # Business logic
├── types/          # Type definitions
├── utils/          # Utility functions
├── lib/            # Library configs
└── integrations/   # External services
```

## Enforcement

Standards are enforced through:
- ESLint configuration
- TypeScript strict mode
- Code review process
- Cursor AI rules (`.cursor/rules/`)

## Related Documentation

- [Cursor Rules](../../.cursor/rules/)
- [Architecture Documentation](../../architecture/)
