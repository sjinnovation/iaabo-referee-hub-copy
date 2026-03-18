# Cursor AI Configuration

This directory contains configuration and context files for Cursor AI to better understand and assist with this project.

## Directory Structure

```
.cursor/
├── rules/              # Project-specific rules (.mdc files)
├── context-priority.md # Defines AI context loading priority
└── README.md           # This file
```

## Rules Directory

The `rules/` directory contains `.mdc` (Markdown with Context) files that define project-specific rules and patterns for Cursor AI.

### Creating Rules

1. Create a new `.mdc` file in the `rules/` directory
2. Use clear, descriptive filenames (e.g., `react-components.mdc`, `api-conventions.mdc`)
3. Structure rules with:
   - **Description**: What the rule covers
   - **Glob patterns**: Which files the rule applies to
   - **Instructions**: Specific guidance for AI assistance

### Rule File Format

```markdown
---
description: Brief description of what this rule covers
globs: ["src/**/*.tsx", "src/**/*.ts"]
---

# Rule Title

Your instructions here...
```

## Context Priority

The `context-priority.md` file defines which files and directories should be prioritized when Cursor AI loads context for understanding the project.

## Best Practices

1. **Keep rules focused**: One rule per concern (e.g., separate rules for components, API, testing)
2. **Use specific globs**: Target rules to relevant file types
3. **Update regularly**: Keep rules in sync with project conventions
4. **Document decisions**: Use rules to encode architectural decisions

## Maintenance

- Review rules quarterly or when major changes occur
- Remove outdated rules that no longer apply
- Add new rules when establishing new patterns
