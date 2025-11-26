# Deployment Guide

This document describes the deployment process for the Okada Admin Dashboard, including staging and production environments.

---

## Overview

The application uses a **two-stage deployment process**:

1. **Automated Validation**: GitHub Actions validates build, tests, and linting
2. **Manual Deployment**: Deploy via Manus dashboard "Publish" button

This hybrid approach ensures code quality while maintaining deployment control.

---

## Environments

> **Important**: GitHub Environments with protection rules require GitHub Pro, Team, or Enterprise. See [GitHub Environment Setup Guide](./GITHUB-ENVIRONMENT-SETUP.md) for detailed configuration instructions.

### Staging Environment

**Purpose**: Pre-production testing and validation

**URL**: `https://staging-okada-admin.manus.space` (example)

**Deployment Trigger**: Push to `develop` branch

**Characteristics**:
- Mirrors production configuration
- Uses separate staging database
- Allows testing before production release
- Can be reset/rolled back freely

### Production Environment

**Purpose**: Live application for end users

**URL**: `https://okada-admin.manus.space` (example)

**Deployment Trigger**: Manual via Manus UI after staging validation

**Characteristics**:
- Production database with real data
- Requires approval before deployment
- Monitored for errors and performance
- Rollback requires careful consideration

---

## Staging Deployment Workflow

### Automatic Validation (GitHub Actions)

When code is pushed to `develop` branch:

1. **Checkout Code**: Pulls latest commit
2. **Install Dependencies**: `pnpm install --frozen-lockfile`
3. **Run Linter**: `pnpm lint` (continues on error)
4. **Type Check**: `pnpm check` (continues on error)
5. **Run Tests**: `pnpm test` (can be skipped manually)
6. **Build Application**: `pnpm build`
7. **Upload Artifacts**: Stores build for 7 days
8. **Create Summary**: Generates deployment report
9. **Comment on Commit**: Adds deployment status to commit

**Workflow File**: `.github/workflows/deploy-staging.yml`

### Approval Workflow (GitHub Environments)

If GitHub Environment protection is configured:

1. **Workflow Pauses**: After validation, workflow waits for approval
2. **Review Request**: Required reviewers receive notification
3. **Review Deployment**: 
   - Go to Actions tab → Select workflow run
   - Click "Review deployments" button
   - Review validation results and commit changes
   - Add approval comment
   - Click "Approve and deploy"
4. **Deployment Proceeds**: After approval, deployment job continues

> See [GitHub Environment Setup Guide](./GITHUB-ENVIRONMENT-SETUP.md) for configuring approval requirements.

### Manual Deployment (Manus Dashboard)

After workflow succeeds (and approval if configured):

1. **Open Manus Dashboard**: Navigate to project page
2. **Review Checkpoint**: Check latest checkpoint details
3. **Click "Publish"**: Deploy to staging environment
4. **Monitor Deployment**: Watch deployment progress
5. **Verify Deployment**: Test staging URL

---

## Step-by-Step Deployment

### Deploying to Staging

#### Step 1: Prepare Code

```bash
# Ensure you're on develop branch
git checkout develop

# Pull latest changes
git pull origin develop

# Create feature branch (if needed)
git checkout -b feature/my-feature

# Make changes, commit, and push
git add .
git commit -m "feat: add new feature"
git push origin feature/my-feature
```

#### Step 2: Create Pull Request

1. Go to GitHub repository
2. Click "New pull request"
3. Base: `develop` ← Compare: `feature/my-feature`
4. Add description and reviewers
5. Wait for CI checks to pass
6. Merge pull request

#### Step 3: Monitor Workflow

1. Go to **Actions** tab in GitHub
2. Find "Deploy to Staging" workflow
3. Click on the running workflow
4. Monitor progress of each job
5. Wait for "✅ All jobs completed successfully"

#### Step 4: Review Deployment Summary

Check the workflow summary for:
- ✅ Linting status
- ✅ Type checking status
- ✅ Test results
- ✅ Build success
- 📦 Build artifacts link

#### Step 5: Deploy via Manus UI

1. Open Manus dashboard
2. Navigate to **okada-admin** project
3. Find latest checkpoint (matches commit SHA)
4. Click **"Publish"** button
5. Confirm deployment to staging
6. Wait for deployment to complete

#### Step 6: Verify Deployment

```bash
# Test staging URL
curl https://staging-okada-admin.manus.space

# Or open in browser and test:
# - Login functionality
# - Key features
# - Database connectivity
# - API endpoints
```

---

## Production Deployment

### Prerequisites

- [ ] Staging deployment successful
- [ ] All tests passing
- [ ] Features tested on staging
- [ ] Database migrations prepared
- [ ] Rollback plan documented
- [ ] Team notified of deployment

### Process

1. **Create Release Branch**:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b release/v1.x.x
   ```

2. **Update Version**:
   ```bash
   # Update package.json version
   npm version patch  # or minor, or major
   git push origin release/v1.x.x
   ```

3. **Create Pull Request to Main**:
   - Base: `main` ← Compare: `release/v1.x.x`
   - Add release notes
   - Get approval from team lead

4. **Merge and Tag**:
   ```bash
   git checkout main
   git pull origin main
   git tag -a v1.x.x -m "Release v1.x.x"
   git push origin v1.x.x
   ```

5. **Deploy via Manus UI**:
   - Select production environment
   - Choose checkpoint from `main` branch
   - Click "Publish" to production
   - Monitor deployment

6. **Verify Production**:
   - Test critical paths
   - Check error logs
   - Monitor performance metrics
   - Verify database migrations

---

## Rollback Procedures

### Staging Rollback

Staging can be rolled back freely without impact:

1. Open Manus dashboard
2. Go to **Checkpoints** tab
3. Find previous working checkpoint
4. Click **"Rollback"** button
5. Confirm rollback action

### Production Rollback

Production rollback requires careful consideration:

#### When to Rollback

- Critical bugs affecting users
- Data integrity issues
- Performance degradation
- Security vulnerabilities

#### Rollback Process

1. **Assess Impact**:
   - Identify affected users
   - Check data consistency
   - Review error logs

2. **Prepare Rollback**:
   ```bash
   # Note current version
   CURRENT_VERSION=$(git describe --tags)
   
   # Identify rollback target
   ROLLBACK_VERSION="v1.x.x"  # Previous stable version
   ```

3. **Execute Rollback**:
   - Open Manus dashboard
   - Select checkpoint matching `ROLLBACK_VERSION`
   - Click "Rollback" button
   - Confirm with team lead

4. **Verify Rollback**:
   - Test critical functionality
   - Check error rates
   - Monitor user reports

5. **Post-Rollback**:
   - Document rollback reason
   - Create issue for bug fix
   - Plan fix and re-deployment

---

## Environment Variables

### Staging Environment

Configure these in Manus dashboard → Settings → Secrets:

```env
# Database (separate staging database)
DATABASE_URL=mysql://user:pass@staging-db-host:3306/okada_staging

# Application
VITE_APP_TITLE=Okada Admin (Staging)
VITE_APP_LOGO=/logo-staging.svg

# Feature Flags
ENABLE_DEBUG_MODE=true
ENABLE_EXPERIMENTAL_FEATURES=true

# External Services (use test/sandbox APIs)
STRIPE_API_KEY=sk_test_...
GOOGLE_MAPS_API_KEY=...
```

### Production Environment

```env
# Database (production database)
DATABASE_URL=mysql://user:pass@prod-db-host:3306/okada_production

# Application
VITE_APP_TITLE=Okada Admin Dashboard
VITE_APP_LOGO=/logo.svg

# Feature Flags
ENABLE_DEBUG_MODE=false
ENABLE_EXPERIMENTAL_FEATURES=false

# External Services (use production APIs)
STRIPE_API_KEY=sk_live_...
GOOGLE_MAPS_API_KEY=...
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing locally
- [ ] Code reviewed and approved
- [ ] Database migrations tested
- [ ] Environment variables configured
- [ ] Dependencies up to date
- [ ] Security vulnerabilities addressed
- [ ] Performance tested
- [ ] Documentation updated

### During Deployment

- [ ] Workflow validation passed
- [ ] Build artifacts generated
- [ ] Deployment summary reviewed
- [ ] Manus UI deployment initiated
- [ ] Deployment progress monitored
- [ ] No errors in deployment logs

### Post-Deployment

- [ ] Application accessible at URL
- [ ] Login functionality working
- [ ] Database connectivity verified
- [ ] API endpoints responding
- [ ] Error logs checked
- [ ] Performance metrics normal
- [ ] Team notified of deployment
- [ ] Deployment documented

---

## Troubleshooting

### Workflow Fails at Build Step

**Symptoms**: Build fails with compilation errors

**Solutions**:
1. Run `pnpm build` locally to reproduce
2. Fix TypeScript/ESLint errors
3. Commit and push fixes
4. Re-run workflow

### Workflow Passes but Deployment Fails

**Symptoms**: Manus deployment fails or times out

**Solutions**:
1. Check Manus dashboard logs
2. Verify environment variables
3. Check database connectivity
4. Review server logs
5. Contact Manus support if needed

### Application Crashes After Deployment

**Symptoms**: 500 errors, application won't start

**Solutions**:
1. Check server logs in Manus dashboard
2. Verify environment variables are set
3. Check database migrations ran successfully
4. Rollback to previous checkpoint
5. Fix issues and re-deploy

### Database Migration Failures

**Symptoms**: Migration errors in logs

**Solutions**:
1. Check migration scripts for errors
2. Verify database connectivity
3. Test migrations on staging first
4. Rollback database if needed
5. Fix migration scripts
6. Re-run migrations

---

## Monitoring and Alerts

### What to Monitor

- **Application Uptime**: Ensure app is accessible
- **Error Rates**: Track 4xx and 5xx errors
- **Response Times**: Monitor API latency
- **Database Performance**: Query times and connection pool
- **Memory Usage**: Detect memory leaks
- **CPU Usage**: Identify performance bottlenecks

### Setting Up Alerts

Configure alerts in Manus dashboard:

1. **Downtime Alert**: Notify when app is unreachable
2. **Error Rate Alert**: Trigger at >1% error rate
3. **Performance Alert**: Warn when response time >2s
4. **Database Alert**: Notify on connection failures

---

## Best Practices

### Development Workflow

1. **Feature Branches**: Always create feature branches
2. **Pull Requests**: Require PR reviews before merge
3. **CI Checks**: Never merge with failing checks
4. **Small Commits**: Keep commits focused and atomic
5. **Descriptive Messages**: Write clear commit messages

### Deployment Strategy

1. **Test on Staging First**: Never skip staging
2. **Deploy During Low Traffic**: Minimize user impact
3. **Monitor After Deployment**: Watch for issues
4. **Have Rollback Plan**: Know how to revert
5. **Document Changes**: Keep deployment log

### Security

1. **Rotate Secrets**: Change passwords every 90 days
2. **Use Environment Variables**: Never commit secrets
3. **Audit Access**: Review who can deploy
4. **Enable 2FA**: Require two-factor authentication
5. **Monitor Logs**: Watch for suspicious activity

---

## Deployment Log Template

Keep a record of all deployments:

```markdown
## Deployment: v1.2.3 to Production

**Date**: 2025-11-26 14:30 UTC
**Deployed by**: @username
**Commit**: abc123def
**Environment**: Production

### Changes
- Added user verification system
- Fixed badge sharing bug
- Updated database schema

### Pre-Deployment Checks
- [x] Tests passing
- [x] Staging validated
- [x] Database backup created
- [x] Team notified

### Deployment Steps
1. Merged PR #123 to main
2. Tagged release v1.2.3
3. Workflow validated build
4. Deployed via Manus UI at 14:35 UTC
5. Verified deployment at 14:40 UTC

### Post-Deployment
- Application accessible: ✅
- No errors in logs: ✅
- Performance normal: ✅
- Users notified: ✅

### Issues
None

### Rollback Plan
If issues arise, rollback to v1.2.2 (checkpoint abc123)
```

---

## Related Documentation

- [CI/CD Setup Guide](./CI-CD-SETUP.md)
- [GitHub Secret Setup](./GITHUB-SECRET-SETUP.md)
- [Database Integrity](./SPRINT-10-DB-INTEGRITY.md)

---

## Support

For deployment issues:
1. Check this troubleshooting guide
2. Review Manus dashboard logs
3. Contact DevOps team
4. Create issue with `deployment` label

---

**Last Updated**: November 26, 2025
