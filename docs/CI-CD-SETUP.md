# CI/CD Setup Guide

This document describes the Continuous Integration and Continuous Deployment (CI/CD) setup for the Okada Admin Dashboard.

---

## Overview

The project uses **GitHub Actions** for automated testing, linting, building, and database integrity checks. Workflows run automatically on code pushes and pull requests to ensure code quality and database health.

---

## Workflows

### 1. Database Integrity Check (`database-integrity.yml`)

**Purpose**: Automatically verify database integrity by checking for duplicate IDs across all tables.

**Triggers**:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`
- Daily at 2 AM UTC (scheduled)
- Manual trigger via GitHub Actions UI

**Steps**:
1. Checkout code
2. Setup Node.js 22 and pnpm
3. Install dependencies
4. Run `pnpm db:check`
5. Upload failure reports if check fails
6. Create GitHub issue if integrity problems detected

**Requirements**:
- `DATABASE_URL` secret must be configured in GitHub repository settings

**Exit Codes**:
- `0`: All checks passed, database integrity good
- `1`: Duplicate IDs found, workflow fails

---

### 2. CI Workflow (`ci.yml`)

**Purpose**: Run linting, type checking, tests, and build verification.

**Triggers**:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

**Jobs**:

#### Lint Job
- Runs ESLint to check code quality
- Runs TypeScript type checking
- Currently set to `continue-on-error: true` (warnings don't fail build)

#### Test Job
- Runs Vitest test suite
- Currently set to `continue-on-error: true` (allows builds when no tests exist)

#### Build Job
- Builds the application with `pnpm build`
- Uploads build artifacts for review
- Depends on lint and test jobs completing

---

## Setup Instructions

### 1. Configure GitHub Secrets

Navigate to your GitHub repository → Settings → Secrets and variables → Actions

Add the following secrets:

| Secret Name | Description | Example Value |
|------------|-------------|---------------|
| `DATABASE_URL` | MySQL/TiDB connection string for CI environment | `mysql://user:pass@host:3306/okada_ci` |

**Important**: Use a **separate CI database** or a read-only connection to avoid affecting production data.

### 2. Database Setup for CI

**Option A: Use Test Database**
```sql
CREATE DATABASE okada_ci;
-- Grant read-only access for integrity checks
CREATE USER 'ci_user'@'%' IDENTIFIED BY 'secure_password';
GRANT SELECT ON okada_ci.* TO 'ci_user'@'%';
```

**Option B: Use Production Replica (Read-Only)**
- Configure a read replica of your production database
- Use read-only credentials in `DATABASE_URL` secret
- Ensures integrity checks run against real data

**Option C: Mock Database (Not Recommended)**
- Use an empty database for CI
- Integrity checks will always pass (no data to check)
- Only validates that the script runs without errors

### 3. Enable Workflows

Workflows are automatically enabled when you push the `.github/workflows/` directory to your repository.

To manually trigger a workflow:
1. Go to Actions tab in GitHub
2. Select the workflow (e.g., "Database Integrity Check")
3. Click "Run workflow"
4. Choose branch and click "Run workflow"

---

## Workflow Status Badges

Add these badges to your `README.md` to show workflow status:

```markdown
![Database Integrity](https://github.com/YOUR_USERNAME/okada-admin/workflows/Database%20Integrity%20Check/badge.svg)
![CI](https://github.com/YOUR_USERNAME/okada-admin/workflows/CI/badge.svg)
```

Replace `YOUR_USERNAME` with your GitHub username or organization name.

---

## Local Testing

### Test Database Integrity Check Locally

```bash
# Run the integrity check script
pnpm db:check

# Expected output on success:
# ✅ ALL CHECKS PASSED - Database integrity is good!
```

### Simulate CI Environment Locally

Install [act](https://github.com/nektos/act) to run GitHub Actions locally:

```bash
# Install act (macOS)
brew install act

# Install act (Linux)
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Run database integrity workflow
act -j integrity-check --secret DATABASE_URL="your_connection_string"

# Run full CI workflow
act -j lint
act -j test
act -j build
```

---

## Monitoring and Alerts

### Automatic Issue Creation

When the database integrity check fails, the workflow automatically:
1. Creates a GitHub issue titled "🚨 Database Integrity Check Failed"
2. Includes commit SHA, workflow name, and run number
3. Labels the issue as `bug`, `database`, `high-priority`

### Email Notifications

GitHub sends email notifications for workflow failures to:
- Repository owner
- Commit author
- Pull request creator (for PR-triggered workflows)

Configure notification preferences: GitHub Settings → Notifications → Actions

### Slack Integration (Optional)

Add Slack notifications for workflow failures:

```yaml
- name: Notify Slack on failure
  if: failure()
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
    payload: |
      {
        "text": "🚨 Database Integrity Check Failed",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "*Database Integrity Check Failed*\nCommit: ${{ github.sha }}\nWorkflow: ${{ github.workflow }}"
            }
          }
        ]
      }
```

---

## Troubleshooting

### Workflow Fails with "DATABASE_URL not set"

**Solution**: Add `DATABASE_URL` secret in GitHub repository settings.

### Workflow Fails with "Connection refused"

**Possible causes**:
- Database server not accessible from GitHub Actions runners
- Firewall blocking GitHub IP ranges
- Incorrect host/port in `DATABASE_URL`

**Solutions**:
- Use cloud-hosted database (AWS RDS, TiDB Cloud, etc.)
- Whitelist GitHub Actions IP ranges
- Use VPN or tunnel service (not recommended for production)

### Integrity Check Reports False Positives

**Cause**: Test data or seeded data may have duplicate IDs.

**Solution**: 
- Clean test database before running checks
- Exclude test tables from integrity check script
- Use separate CI database with clean schema

### Build Fails on Type Errors

**Current behavior**: Type checking is set to `continue-on-error: true`

**To enforce strict type checking**:
1. Fix all TypeScript errors in codebase
2. Remove `continue-on-error: true` from `ci.yml`
3. Builds will fail on type errors

---

## Best Practices

1. **Run checks locally** before pushing code
   ```bash
   pnpm lint
   pnpm check
   pnpm test
   pnpm db:check
   ```

2. **Use separate CI database** to avoid affecting production

3. **Monitor workflow runs** regularly in GitHub Actions tab

4. **Fix failures immediately** - don't let them accumulate

5. **Keep workflows fast** - optimize dependencies and caching

6. **Document changes** to workflows in this file

---

## Maintenance

### Updating Workflows

1. Edit workflow files in `.github/workflows/`
2. Test locally with `act` if possible
3. Commit and push changes
4. Monitor first run in GitHub Actions
5. Update this documentation if behavior changes

### Adding New Checks

To add a new integrity check:

1. Add check logic to `scripts/check-db-integrity.ts`
2. Test locally with `pnpm db:check`
3. Workflow will automatically use updated script
4. Document new check in `docs/SPRINT-10-DB-INTEGRITY.md`

---

## Related Documentation

- [Database Integrity Investigation](./SPRINT-10-DB-INTEGRITY.md)
- [ESLint Configuration](./ESLINT.md)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

## Support

For issues with CI/CD setup:
1. Check workflow logs in GitHub Actions tab
2. Review this documentation
3. Test locally with `act`
4. Create issue with `ci-cd` label
