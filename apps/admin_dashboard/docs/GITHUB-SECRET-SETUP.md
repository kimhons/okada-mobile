# GitHub Secret Configuration Guide

This guide provides step-by-step instructions for configuring the `DATABASE_URL` secret required by the CI/CD workflows.

---

## Why This Secret is Needed

The **Database Integrity Check** workflow runs `pnpm db:check` to verify there are no duplicate IDs in your database tables. This script requires a database connection string to access your database.

**Important**: Use a **separate CI database** or **read-only credentials** to avoid affecting production data.

---

## Step-by-Step Instructions

### Step 1: Prepare Database Connection String

Choose one of the following options:

#### Option A: Create Separate CI Database (Recommended)

```sql
-- Connect to your MySQL/TiDB server
mysql -u root -p

-- Create CI database
CREATE DATABASE okada_ci;

-- Create read-only user for CI
CREATE USER 'ci_user'@'%' IDENTIFIED BY 'STRONG_PASSWORD_HERE';

-- Grant SELECT permission only (read-only)
GRANT SELECT ON okada_ci.* TO 'ci_user'@'%';

-- Apply changes
FLUSH PRIVILEGES;
```

**Connection String**:
```
mysql://ci_user:STRONG_PASSWORD_HERE@your-db-host:3306/okada_ci
```

#### Option B: Use Production Replica (Read-Only)

If you have a read replica of your production database:

```sql
-- Create read-only user on replica
CREATE USER 'ci_readonly'@'%' IDENTIFIED BY 'STRONG_PASSWORD_HERE';
GRANT SELECT ON okada_production.* TO 'ci_readonly'@'%';
FLUSH PRIVILEGES;
```

**Connection String**:
```
mysql://ci_readonly:STRONG_PASSWORD_HERE@replica-host:3306/okada_production
```

#### Option C: Use TiDB Cloud (Recommended for Cloud)

1. Go to TiDB Cloud console
2. Create a new cluster or use existing
3. Navigate to **Connect** → **Standard Connection**
4. Copy the connection string
5. Replace `<password>` with your actual password

**Connection String**:
```
mysql://user:password@gateway01.us-west-2.prod.aws.tidbcloud.com:4000/okada_ci?ssl={"rejectUnauthorized":true}
```

---

### Step 2: Add Secret to GitHub Repository

#### 2.1 Navigate to Repository Settings

1. Open your GitHub repository in a web browser
2. Click on **Settings** tab (top right, near Code/Issues/Pull requests)
3. In the left sidebar, scroll down to **Security** section
4. Click on **Secrets and variables**
5. Click on **Actions**

#### 2.2: Create New Secret

1. Click the **New repository secret** button (green button, top right)
2. Fill in the form:

   **Name**:
   ```
   DATABASE_URL
   ```

   **Secret** (paste your connection string):
   ```
   mysql://ci_user:STRONG_PASSWORD_HERE@your-db-host:3306/okada_ci
   ```

3. Click **Add secret** button

---

### Step 3: Verify Secret Configuration

#### 3.1: Check Secret Exists

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. You should see `DATABASE_URL` listed under **Repository secrets**
3. You won't be able to view the value (GitHub hides secrets for security)

#### 3.2: Test with Manual Workflow Run

1. Go to **Actions** tab in your repository
2. Click on **Database Integrity Check** workflow (left sidebar)
3. Click **Run workflow** button (right side)
4. Select branch (usually `main`)
5. Click **Run workflow** (green button)

#### 3.3: Monitor Workflow Execution

1. Wait for workflow to start (may take a few seconds)
2. Click on the workflow run to see details
3. Click on **Check Database Integrity** job
4. Expand **Run database integrity check** step
5. Verify output shows:
   ```
   🔍 Starting Database Integrity Check...
   ✅ users: OK (X rows, all unique)
   ✅ promotionalCampaigns: OK (X rows, all unique)
   ...
   ✅ ALL CHECKS PASSED - Database integrity is good!
   ```

---

## Troubleshooting

### Error: "DATABASE_URL environment variable is not set"

**Cause**: Secret not configured or named incorrectly

**Solution**:
1. Verify secret name is exactly `DATABASE_URL` (case-sensitive)
2. Check secret exists in **Settings** → **Secrets and variables** → **Actions**
3. Re-add the secret if necessary

---

### Error: "Connection refused" or "Access denied"

**Cause**: Database not accessible from GitHub Actions runners

**Solutions**:

1. **Check firewall rules**:
   - GitHub Actions runners use dynamic IP addresses
   - Allow connections from GitHub's IP ranges
   - Or use cloud-hosted database (AWS RDS, TiDB Cloud, etc.)

2. **Verify credentials**:
   ```bash
   # Test connection locally
   mysql -h your-db-host -u ci_user -p okada_ci
   ```

3. **Check SSL requirements**:
   - Some cloud databases require SSL
   - Add SSL parameters to connection string:
     ```
     mysql://user:pass@host:3306/db?ssl={"rejectUnauthorized":true}
     ```

---

### Error: "Failed query" or "Table doesn't exist"

**Cause**: CI database is empty or schema not pushed

**Solution**:

1. **Push schema to CI database**:
   ```bash
   # Set DATABASE_URL to CI database
   export DATABASE_URL="mysql://ci_user:password@host:3306/okada_ci"
   
   # Push schema
   pnpm db:push
   ```

2. **Seed test data (optional)**:
   ```bash
   # Create seed script if needed
   pnpm tsx scripts/seed-ci-db.ts
   ```

---

### Workflow Passes but Should Fail

**Cause**: CI database is empty, so no duplicates can exist

**Solution**:
- Populate CI database with representative data
- Or use production replica for realistic checks

---

## Security Best Practices

### ✅ Do's

- ✅ Use separate CI database
- ✅ Use read-only credentials
- ✅ Use strong passwords (20+ characters)
- ✅ Rotate secrets periodically (every 90 days)
- ✅ Limit database user permissions to SELECT only
- ✅ Use SSL/TLS for database connections
- ✅ Monitor secret access in GitHub audit logs

### ❌ Don'ts

- ❌ Don't use production database with write access
- ❌ Don't share secrets in code or commit them
- ❌ Don't use weak passwords
- ❌ Don't grant unnecessary permissions
- ❌ Don't expose database publicly without firewall
- ❌ Don't use root/admin credentials

---

## Advanced Configuration

### Using Environment-Specific Secrets

If you have multiple environments (staging, production):

1. Create separate secrets:
   - `DATABASE_URL_STAGING`
   - `DATABASE_URL_PRODUCTION`

2. Modify workflow to use environment:
   ```yaml
   env:
     DATABASE_URL: ${{ secrets.DATABASE_URL_STAGING }}
   ```

3. Use GitHub Environments for protection rules

---

### Using GitHub Environments

1. Go to **Settings** → **Environments**
2. Click **New environment**
3. Name it (e.g., `ci`)
4. Add `DATABASE_URL` secret to environment
5. Configure protection rules (optional)

6. Update workflow:
   ```yaml
   jobs:
     integrity-check:
       environment: ci
       steps:
         - name: Run check
           env:
             DATABASE_URL: ${{ secrets.DATABASE_URL }}
   ```

---

### Rotating Secrets

**When to rotate**:
- Every 90 days (recommended)
- After team member leaves
- After suspected compromise
- After accidental exposure

**How to rotate**:

1. Create new database user:
   ```sql
   CREATE USER 'ci_user_v2'@'%' IDENTIFIED BY 'NEW_STRONG_PASSWORD';
   GRANT SELECT ON okada_ci.* TO 'ci_user_v2'@'%';
   ```

2. Update GitHub secret with new connection string

3. Test workflow runs successfully

4. Remove old database user:
   ```sql
   DROP USER 'ci_user'@'%';
   ```

---

## Connection String Formats

### MySQL

```
mysql://username:password@host:port/database
```

### MySQL with SSL

```
mysql://username:password@host:port/database?ssl={"rejectUnauthorized":true}
```

### TiDB Cloud

```
mysql://username:password@gateway.region.prod.aws.tidbcloud.com:4000/database?ssl={"rejectUnauthorized":true}
```

### AWS RDS

```
mysql://username:password@instance.region.rds.amazonaws.com:3306/database
```

### Google Cloud SQL

```
mysql://username:password@ip-address:3306/database
```

---

## Verification Checklist

Before considering setup complete:

- [ ] Secret `DATABASE_URL` added to GitHub repository
- [ ] Connection string uses CI database or read-only credentials
- [ ] Manual workflow run completes successfully
- [ ] Workflow output shows "ALL CHECKS PASSED"
- [ ] No errors in workflow logs
- [ ] Database user has SELECT permission only
- [ ] SSL enabled for cloud databases
- [ ] Firewall allows GitHub Actions IP ranges
- [ ] Secret documented in team wiki/docs
- [ ] Rotation schedule set (90 days recommended)

---

## Next Steps

After configuring the secret:

1. **Enable automatic workflows**:
   - Push code to trigger workflows automatically
   - Workflows run on every push/PR

2. **Monitor workflow runs**:
   - Check Actions tab regularly
   - Fix failures immediately

3. **Add status badges to README**:
   - See main README.md for badge examples
   - Shows build status at a glance

4. **Set up notifications**:
   - Configure email alerts for failures
   - Add Slack integration (see CI-CD-SETUP.md)

---

## Related Documentation

- [CI/CD Setup Guide](./CI-CD-SETUP.md) - Complete CI/CD configuration
- [Database Integrity Investigation](./SPRINT-10-DB-INTEGRITY.md) - Integrity check details
- [GitHub Actions Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

---

## Support

If you encounter issues:

1. Check this troubleshooting guide
2. Review workflow logs in Actions tab
3. Test connection string locally
4. Create issue with `ci-cd` label
5. Contact DevOps team

---

**Last Updated**: November 26, 2025
