# AI Context Loading Priority

This file defines the priority order for loading context when Cursor AI assists with this project.

## High Priority (Always Load)

These files provide essential context for understanding the project:

1. **Architecture Documentation**
   - `architecture/system-architecture.md`
   - `architecture/application-architecture.md`
   - `architecture/data-flow.md`

2. **Core Configuration**
   - `package.json`
   - `tsconfig.json`
   - `vite.config.ts`
   - `tailwind.config.ts`

3. **Type Definitions**
   - `src/types/*.ts`
   - `src/integrations/supabase/types.ts`

## Medium Priority (Load When Relevant)

Load based on the current task:

1. **Component Development**
   - `src/components/ui/*` (shadcn/ui components)
   - `docs/standards/component-guidelines.md`

2. **API/Backend Work**
   - `src/integrations/supabase/*`
   - `supabase/functions/*`
   - `docs/api/*`
   - `docs/database/*`

3. **Feature Development**
   - `docs/features/*` (relevant feature specs)
   - `src/pages/*` (related pages)

4. **Styling**
   - `src/index.css`
   - `tailwind.config.ts`

## Low Priority (Load On Demand)

Reference when specifically needed:

1. **Historical Context**
   - `architecture/ADRs/*`
   - `docs/changelog.md`

2. **Operational Docs**
   - `docs/SOPs/*`
   - `docs/issues/*`

## Context Loading Rules

1. **File Size Awareness**: Prefer smaller, focused files over large monolithic ones
2. **Recency**: Recently modified files may have higher relevance
3. **Task Correlation**: Match context to the current task type
4. **Dependency Chain**: Load related files together (e.g., component + its types + its tests)

## Exclusions

Never load into context:
- `node_modules/`
- `dist/`
- `.git/`
- `*.lock` files
- Binary files
