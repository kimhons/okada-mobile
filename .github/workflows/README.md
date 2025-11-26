# GitHub Actions Workflows

This directory contains automated CI/CD workflows for the Okada Admin Dashboard.

## Workflows

### 🔍 Database Integrity Check
**File**: `database-integrity.yml`

Automatically verifies database integrity by checking for duplicate IDs across all tables.

- **Runs on**: Push, PR, daily schedule (2 AM UTC), manual trigger
- **Script**: `pnpm db:check`
- **Requires**: `DATABASE_URL` secret
- **On failure**: Creates GitHub issue and uploads report

### 🔧 CI (Continuous Integration)
**File**: `ci.yml`

Runs linting, type checking, tests, and build verification.

- **Runs on**: Push, PR to main/develop
- **Jobs**: Lint → Test → Build
- **Artifacts**: Build output uploaded for review

## Setup

See [docs/CI-CD-SETUP.md](../../docs/CI-CD-SETUP.md) for detailed setup instructions.

**Quick start**:
1. Add `DATABASE_URL` secret in GitHub repository settings
2. Push code to trigger workflows
3. Monitor runs in Actions tab

## Local Testing

```bash
# Run checks locally before pushing
pnpm lint        # ESLint
pnpm check       # TypeScript
pnpm test        # Vitest
pnpm db:check    # Database integrity

# Test workflows locally with act
act -j integrity-check --secret DATABASE_URL="your_db_url"
```

## Status

View workflow status: [GitHub Actions Tab](../../actions)

## Documentation

- [CI/CD Setup Guide](../../docs/CI-CD-SETUP.md)
- [Database Integrity Investigation](../../docs/SPRINT-10-DB-INTEGRITY.md)
- [ESLint Configuration](../../docs/ESLINT.md)
