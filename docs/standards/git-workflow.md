# Git Workflow

## Overview

Git branching and commit conventions for IAABO Referee Hub.

## Branch Strategy

### Main Branches

| Branch | Purpose | Protected |
|--------|---------|-----------|
| `main` | Production code | Yes |
| `develop` | Development integration (if used) | Optional |

### Feature Branches

Create branches for new work:

```bash
# Feature
git checkout -b feature/user-authentication

# Bug fix
git checkout -b fix/login-redirect

# Hotfix
git checkout -b hotfix/security-patch
```

### Branch Naming

Format: `type/short-description`

| Type | Use Case |
|------|----------|
| `feature/` | New features |
| `fix/` | Bug fixes |
| `hotfix/` | Urgent production fixes |
| `refactor/` | Code refactoring |
| `docs/` | Documentation only |
| `chore/` | Maintenance tasks |

## Commit Messages

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation |
| `style` | Formatting (no code change) |
| `refactor` | Code restructuring |
| `test` | Adding tests |
| `chore` | Maintenance |

### Examples

```bash
# Simple commit
git commit -m "feat(auth): add password reset flow"

# With body
git commit -m "fix(ui): prevent button double-click

Add loading state to prevent multiple form submissions.
Closes #123"
```

### Guidelines

- Use present tense ("add feature" not "added feature")
- Use imperative mood ("move cursor" not "moves cursor")
- Limit subject to 50 characters
- Wrap body at 72 characters
- Reference issues when applicable

## Workflow

### Starting New Work

```bash
# Update main
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat: implement new feature"
```

### Keeping Branch Updated

```bash
# Option 1: Rebase (cleaner history)
git fetch origin
git rebase origin/main

# Option 2: Merge
git fetch origin
git merge origin/main
```

### Creating Pull Request

```bash
# Push branch
git push -u origin feature/new-feature

# Create PR via GitHub/Lovable
```

### After PR Merged

```bash
# Update main
git checkout main
git pull origin main

# Delete local branch
git branch -d feature/new-feature

# Delete remote branch (if not auto-deleted)
git push origin --delete feature/new-feature
```

## Pull Request Guidelines

### PR Checklist

- [ ] Code follows project standards
- [ ] Tests added/updated (if applicable)
- [ ] Documentation updated
- [ ] No linting errors
- [ ] Self-reviewed changes

### PR Description

```markdown
## Summary
Brief description of changes.

## Changes
- Added X
- Updated Y
- Fixed Z

## Testing
How to test these changes.

## Screenshots (if UI changes)
Before/After images.
```

## Code Review

### For Authors

- Keep PRs small and focused
- Respond to feedback promptly
- Test your changes thoroughly

### For Reviewers

- Be constructive and specific
- Suggest, don't demand
- Approve when ready, request changes when needed

## Common Commands

```bash
# View status
git status

# View history
git log --oneline

# Stash changes
git stash
git stash pop

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard changes
git checkout -- <file>
git restore <file>

# Interactive rebase (last 3 commits)
git rebase -i HEAD~3
```

## Related

- [Development Setup](../SOPs/development-setup.md)
- [Deployment](../SOPs/deployment.md)
