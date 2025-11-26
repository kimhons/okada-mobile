# GitHub Environment Setup Guide

This guide walks you through setting up GitHub Environments with protection rules for the Okada Admin Dashboard deployment workflow.

---

## Overview

**GitHub Environments** provide deployment protection rules, secrets management, and deployment history tracking. We'll configure two environments:

- **Staging**: Requires 1 approval, deploys from `develop` branch
- **Production**: Requires 2 approvals, deploys from `main` branch only

---

## Prerequisites

- Repository admin access
- GitHub Pro, Team, or Enterprise account (Environments with protection rules require paid plan)
- Deployment workflow already configured (`.github/workflows/deploy-staging.yml`)

> **Note**: If you're on GitHub Free, you can still create environments but protection rules won't be available. Consider upgrading or using branch protection rules as an alternative.

---

## Part 1: Create Staging Environment

### Step 1: Navigate to Environments

1. Go to your GitHub repository
2. Click **Settings** tab (top navigation)
3. In the left sidebar, scroll to **Code and automation** section
4. Click **Environments**

### Step 2: Create New Environment

1. Click **New environment** button (green button, top right)
2. Enter environment name: `staging`
3. Click **Configure environment**

### Step 3: Configure Protection Rules

#### Required Reviewers

1. Under **Deployment protection rules**, check **Required reviewers**
2. Click in the search box under "Search for people, teams, or apps"
3. Select at least 1 reviewer (yourself or team member)
4. Click outside the box to confirm

**Recommended**: Add 1-2 reviewers for staging

#### Wait Timer (Optional)

1. Check **Wait timer** if you want a delay before deployment
2. Enter wait time in minutes (e.g., 5 minutes)
3. This gives time to review deployment before it proceeds

**Recommended**: Skip wait timer for staging (use for production)

#### Deployment Branches

1. Under **Deployment branches**, select **Selected branches**
2. Click **Add deployment branch rule**
3. Enter branch name pattern: `develop`
4. Click **Add rule**

This ensures only the `develop` branch can deploy to staging.

### Step 4: Configure Environment Secrets

1. Scroll down to **Environment secrets** section
2. Click **Add secret** for each secret needed

**Staging Secrets to Add**:

| Secret Name | Description | Example Value |
|------------|-------------|---------------|
| `DATABASE_URL` | Staging database connection | `mysql://user:pass@staging-db:3306/okada_staging` |
| `VITE_APP_TITLE` | App title for staging | `Okada Admin (Staging)` |
| `STRIPE_API_KEY` | Stripe test API key | `sk_test_...` |

3. Click **Add secret** after entering each one

### Step 5: Configure Environment Variables

1. Scroll to **Environment variables** section
2. Click **Add variable** for non-sensitive configuration

**Staging Variables to Add**:

| Variable Name | Value |
|--------------|-------|
| `ENVIRONMENT` | `staging` |
| `DEBUG_MODE` | `true` |
| `LOG_LEVEL` | `debug` |

### Step 6: Save Configuration

1. Scroll to bottom of page
2. Configuration is auto-saved
3. You should see "Environment created successfully" message

---

## Part 2: Create Production Environment

### Step 1: Create Environment

1. Go back to **Settings** → **Environments**
2. Click **New environment**
3. Enter name: `production`
4. Click **Configure environment**

### Step 2: Configure Stricter Protection Rules

#### Required Reviewers

1. Check **Required reviewers**
2. Add **2 or more** reviewers
3. Include team lead or senior developer

**Recommended**: Require 2 approvals for production

#### Wait Timer

1. Check **Wait timer**
2. Set to **15 minutes**
3. This provides a safety window to cancel if needed

#### Deployment Branches

1. Select **Selected branches**
2. Add deployment branch rule: `main`
3. **Only** `main` branch can deploy to production

### Step 3: Configure Production Secrets

Add production secrets (use production values):

| Secret Name | Description |
|------------|-------------|
| `DATABASE_URL` | Production database connection |
| `VITE_APP_TITLE` | `Okada Admin Dashboard` |
| `STRIPE_API_KEY` | Live Stripe API key (`sk_live_...`) |

### Step 4: Configure Production Variables

| Variable Name | Value |
|--------------|-------|
| `ENVIRONMENT` | `production` |
| `DEBUG_MODE` | `false` |
| `LOG_LEVEL` | `error` |

---

## Part 3: Test Approval Workflow

### Staging Deployment Test

1. **Make a change** to the codebase
2. **Commit and push** to `develop` branch:
   ```bash
   git checkout develop
   git add .
   git commit -m "test: trigger staging deployment"
   git push origin develop
   ```

3. **Monitor workflow**:
   - Go to **Actions** tab
   - Find "Deploy to Staging" workflow run
   - Wait for "Validate" job to complete

4. **Review deployment request**:
   - Workflow will pause at "Deploy" job
   - You'll see "Waiting for approval" status
   - Check your GitHub notifications for review request

5. **Approve deployment**:
   - Click on the workflow run
   - Click **Review deployments** button (yellow banner)
   - Select `staging` environment
   - Add comment (optional): "Approved for staging deployment"
   - Click **Approve and deploy**

6. **Monitor deployment**:
   - "Deploy" job will now run
   - Follow deployment summary instructions
   - Deploy via Manus UI when ready

7. **Verify deployment**:
   - Check staging URL
   - Test application functionality

---

## Part 4: Approval Workflow Details

### How Approvals Work

1. **Workflow triggers** when code is pushed to protected branch
2. **Validation runs** automatically (lint, test, build)
3. **Deployment pauses** when it reaches environment-protected job
4. **Notification sent** to required reviewers
5. **Reviewer approves** or rejects deployment
6. **Deployment proceeds** if approved, or stops if rejected

### Reviewer Responsibilities

Before approving, reviewers should:

- ✅ Check workflow validation passed (all green checkmarks)
- ✅ Review code changes in commit/PR
- ✅ Verify tests are passing
- ✅ Check deployment summary for any warnings
- ✅ Confirm appropriate environment (staging vs production)
- ✅ Ensure timing is appropriate (not during peak hours for production)

### Rejecting Deployments

If issues are found:

1. Click **Review deployments**
2. Select environment
3. Add comment explaining rejection reason
4. Click **Reject**
5. Deployment will be cancelled
6. Create issue or notify developer to fix

---

## Part 5: Managing Environments

### Viewing Deployment History

1. Go to **Settings** → **Environments**
2. Click on environment name (e.g., `staging`)
3. Scroll to **Deployment history**
4. See all past deployments with:
   - Commit SHA
   - Deployer
   - Approval status
   - Timestamp

### Updating Protection Rules

1. Go to environment settings
2. Modify protection rules as needed
3. Changes apply immediately to future deployments

### Adding/Removing Reviewers

1. Go to environment settings
2. Under **Required reviewers**, click X to remove
3. Search and add new reviewers
4. Save changes

### Deleting Environments

**Warning**: This cannot be undone!

1. Go to environment settings
2. Scroll to bottom
3. Click **Delete environment**
4. Confirm deletion

---

## Part 6: Advanced Configuration

### Environment-Specific Workflows

Create separate workflows for each environment:

**`.github/workflows/deploy-staging.yml`**:
```yaml
on:
  push:
    branches: [develop]

jobs:
  deploy:
    environment:
      name: staging
      url: https://staging-okada-admin.manus.space
```

**`.github/workflows/deploy-production.yml`**:
```yaml
on:
  push:
    branches: [main]

jobs:
  deploy:
    environment:
      name: production
      url: https://okada-admin.manus.space
```

### Multiple Approval Strategies

**Option 1: Any Reviewer** (default)
- Any 1 of the required reviewers can approve
- Fastest approval process
- Good for staging

**Option 2: All Reviewers**
- Requires approval from ALL reviewers
- Most secure
- Good for production with small team

**Option 3: Team-Based**
- Add entire team as reviewer
- Any team member can approve
- Good for larger organizations

### Conditional Deployments

Use workflow conditions to control when deployments run:

```yaml
jobs:
  deploy:
    if: github.event_name == 'push' && github.ref == 'refs/heads/develop'
    environment:
      name: staging
```

### Deployment Notifications

Set up Slack notifications for deployment events:

```yaml
- name: Notify Slack on approval
  if: success()
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
    payload: |
      {
        "text": "Staging deployment approved and in progress"
      }
```

---

## Part 7: Troubleshooting

### "Environments not available" Error

**Problem**: GitHub Free plan doesn't support environment protection rules

**Solutions**:
1. Upgrade to GitHub Pro, Team, or Enterprise
2. Use branch protection rules instead
3. Use manual approval via PR reviews

### Reviewer Not Receiving Notifications

**Problem**: Reviewer doesn't get notified of pending deployment

**Solutions**:
1. Check GitHub notification settings
2. Ensure reviewer has repository access
3. Check email spam folder
4. Manually navigate to Actions tab to see pending deployments

### Deployment Stuck on "Waiting for approval"

**Problem**: Deployment paused indefinitely

**Solutions**:
1. Check if reviewers are available
2. Reviewer should click "Review deployments" button
3. If urgent, repository admin can override
4. Cancel and re-run workflow if needed

### Wrong Environment Deployed To

**Problem**: Code deployed to wrong environment

**Solutions**:
1. Check deployment branch rules
2. Verify workflow file specifies correct environment
3. Review deployment history to confirm
4. Rollback if necessary

### Secrets Not Available in Workflow

**Problem**: Environment secrets not accessible

**Solutions**:
1. Verify secrets are added to correct environment
2. Check secret names match workflow variables
3. Ensure environment name in workflow matches GitHub setting
4. Re-add secrets if needed

---

## Part 8: Security Best Practices

### Secret Management

- ✅ Use environment-specific secrets (staging vs production)
- ✅ Rotate secrets every 90 days
- ✅ Never commit secrets to code
- ✅ Use different API keys for staging and production
- ✅ Limit secret access to necessary environments only

### Reviewer Selection

- ✅ Choose reviewers with deployment knowledge
- ✅ Require at least 2 reviewers for production
- ✅ Include team lead or senior developer
- ✅ Rotate reviewers to avoid single point of failure
- ✅ Document reviewer responsibilities

### Branch Protection

- ✅ Protect `main` and `develop` branches
- ✅ Require PR reviews before merge
- ✅ Require status checks to pass
- ✅ Restrict who can push to protected branches
- ✅ Require signed commits (optional)

### Audit Trail

- ✅ Review deployment history regularly
- ✅ Document all production deployments
- ✅ Investigate failed deployments
- ✅ Keep deployment logs for compliance
- ✅ Monitor for unauthorized deployment attempts

---

## Part 9: GitHub Free Alternative

If you're on GitHub Free and can't use environment protection rules, use this alternative:

### Branch Protection Rules

1. Go to **Settings** → **Branches**
2. Click **Add rule**
3. Branch name pattern: `develop`
4. Check:
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass
   - ✅ Require conversation resolution before merging
5. Save changes

### Manual Approval via PR

1. Create feature branch
2. Open PR to `develop`
3. Request review from team member
4. Reviewer approves PR
5. Merge PR to trigger deployment
6. Deploy via Manus UI

This provides similar protection without environment features.

---

## Part 10: Verification Checklist

After setup, verify everything works:

### Staging Environment

- [ ] Environment created in GitHub
- [ ] Required reviewers configured (1 reviewer)
- [ ] Deployment branch restricted to `develop`
- [ ] Environment secrets added
- [ ] Environment variables configured
- [ ] Test deployment triggered successfully
- [ ] Approval request received
- [ ] Deployment approved and completed
- [ ] Staging URL accessible

### Production Environment

- [ ] Environment created in GitHub
- [ ] Required reviewers configured (2+ reviewers)
- [ ] Wait timer set (15 minutes)
- [ ] Deployment branch restricted to `main`
- [ ] Production secrets added
- [ ] Production variables configured
- [ ] Test deployment planned (not executed yet)

### Workflows

- [ ] Staging workflow references `staging` environment
- [ ] Production workflow references `production` environment
- [ ] Workflow badges updated in README
- [ ] Documentation updated

---

## Quick Reference

### Creating Environment

```
Settings → Environments → New environment → Enter name → Configure
```

### Adding Protection Rules

```
Required reviewers → Select reviewers → Save
Deployment branches → Selected branches → Add rule → Enter branch name
```

### Adding Secrets

```
Environment secrets → Add secret → Enter name and value → Add secret
```

### Approving Deployment

```
Actions → Select workflow run → Review deployments → Select environment → Approve
```

---

## Related Documentation

- [Deployment Guide](./DEPLOYMENT.md)
- [CI/CD Setup](./CI-CD-SETUP.md)
- [GitHub Secret Setup](./GITHUB-SECRET-SETUP.md)

---

## Support

For environment setup issues:
1. Check GitHub documentation: https://docs.github.com/en/actions/deployment/targeting-different-environments
2. Review this troubleshooting guide
3. Contact repository admin
4. Create issue with `deployment` and `github-environment` labels

---

**Last Updated**: November 26, 2025
