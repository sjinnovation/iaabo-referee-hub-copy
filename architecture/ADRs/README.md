# Architectural Decision Records (ADRs)

## What is an ADR?

An Architectural Decision Record (ADR) is a document that captures an important architectural decision made along with its context and consequences.

## Why Use ADRs?

- **Historical Context**: Understand why decisions were made
- **Onboarding**: Help new team members understand the architecture
- **Avoid Repetition**: Don't revisit the same decisions
- **Accountability**: Document trade-offs and reasoning

## ADR Template

Use this template for new ADRs:

```markdown
# ADR-[NUMBER]: [TITLE]

## Status

[Proposed | Accepted | Deprecated | Superseded by ADR-XXX]

## Date

YYYY-MM-DD

## Context

What is the issue that we're seeing that is motivating this decision or change?

## Decision

What is the change that we're proposing and/or doing?

## Consequences

### Positive
- What becomes easier?
- What benefits do we gain?

### Negative
- What becomes harder?
- What are the trade-offs?

### Neutral
- What doesn't change?

## Alternatives Considered

What other options were evaluated?

## References

Links to relevant documentation, discussions, or resources.
```

## Naming Convention

ADRs should be named: `ADR-XXXX-short-title.md`

Example: `ADR-0001-use-supabase-for-backend.md`

## Index

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [ADR-0001](./ADR-0001-use-supabase-for-backend.md) | Use Supabase for Backend | Accepted | 2024-XX-XX |

---

*Add new ADRs to the index above as they are created.*
