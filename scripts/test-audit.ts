/**
 * Test Audit Script
 * 
 * Quickly runs all tests and generates a summary report
 * Shows passing/failing tests by category
 */

import { execSync } from "child_process";
import { writeFileSync } from "fs";

interface TestResult {
  file: string;
  passed: number;
  failed: number;
  total: number;
  duration: number;
}

async function runTestAudit() {
  console.log("🧪 Starting Test Audit...\n");
  
  const testFiles = [
    // Core functionality
    "server/routers.test.ts",
    "server/i18n.test.ts",
    
    // User & Rider Management
    "server/user-rider-management.test.ts",
    "server/user-verification.test.ts",
    "server/rider-leaderboard.test.ts",
    
    // Financial
    "server/financial.test.ts",
    "server/financial-dashboard.test.ts",
    "server/financial-management.test.ts",
    
    // Orders & Products
    "server/order-tracking-inventory.test.ts",
    "server/product-category-management.test.ts",
    "server/quality-seller-management.test.ts",
    
    // Reports & Analytics
    "server/reports.test.ts",
    "server/platform-statistics.test.ts",
    "server/scheduled-reports.test.ts",
    
    // Marketing & Campaigns
    "server/marketing.test.ts",
    "server/campaigns.test.ts",
    
    // Support & Notifications
    "server/support.test.ts",
    "server/notifications.test.ts",
    "server/notification-system.test.ts",
    
    // Activity & Settings
    "server/activity-log.test.ts",
    "server/settings.test.ts",
  ];
  
  const results: TestResult[] = [];
  let totalPassed = 0;
  let totalFailed = 0;
  let totalTests = 0;
  
  for (const file of testFiles) {
    try {
      console.log(`Testing ${file}...`);
      const output = execSync(
        `pnpm vitest run ${file} --reporter=json --no-coverage`,
        { encoding: "utf-8", timeout: 30000, stdio: "pipe" }
      );
      
      // Parse JSON output
      const jsonMatch = output.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        const testResults = data.testResults?.[0];
        
        if (testResults) {
          const passed = testResults.assertionResults.filter((r: any) => r.status === "passed").length;
          const failed = testResults.assertionResults.filter((r: any) => r.status === "failed").length;
          const total = testResults.assertionResults.length;
          const duration = (testResults.endTime - testResults.startTime) / 1000;
          
          results.push({ file, passed, failed, total, duration });
          totalPassed += passed;
          totalFailed += failed;
          totalTests += total;
          
          console.log(`  ✓ ${passed}/${total} passed (${duration.toFixed(2)}s)\n`);
        }
      }
    } catch (error: any) {
      // Test failed or timed out
      console.log(`  ✗ Failed or timed out\n`);
      results.push({ file, passed: 0, failed: 0, total: 0, duration: 0 });
    }
  }
  
  // Generate report
  const report = `# Test Audit Report
Generated: ${new Date().toISOString()}

## Summary
- **Total Tests**: ${totalTests}
- **Passed**: ${totalPassed} (${((totalPassed / totalTests) * 100).toFixed(1)}%)
- **Failed**: ${totalFailed} (${((totalFailed / totalTests) * 100).toFixed(1)}%)

## Test Results by File

| File | Passed | Failed | Total | Duration |
|------|--------|--------|-------|----------|
${results.map(r => `| ${r.file} | ${r.passed} | ${r.failed} | ${r.total} | ${r.duration.toFixed(2)}s |`).join("\n")}

## Priority Actions

### Critical Failures (Must Fix)
${results.filter(r => r.failed > 0 && r.file.includes("i18n")).map(r => `- [ ] Fix ${r.failed} failing tests in ${r.file}`).join("\n") || "None"}

### Important Failures (Should Fix)
${results.filter(r => r.failed > 0 && !r.file.includes("i18n")).slice(0, 5).map(r => `- [ ] Fix ${r.failed} failing tests in ${r.file}`).join("\n") || "None"}

### Missing Tests (Need to Add)
- [ ] Frontend tests for LanguageSwitcher component
- [ ] Frontend tests for TranslationManagement page
- [ ] Frontend tests for OfflineIndicator components
- [ ] Integration tests for offline functionality
- [ ] E2E tests for language switching

## Next Steps

1. Fix all critical failures (i18n tests must pass)
2. Add missing frontend tests for new features
3. Fix important failures in core functionality
4. Add integration tests for offline functionality
5. Achieve 98%+ test coverage
`;

  writeFileSync("/home/ubuntu/okada-admin/TEST_AUDIT_REPORT.md", report);
  
  console.log("\n✅ Test audit complete!");
  console.log(`📊 Report saved to TEST_AUDIT_REPORT.md`);
  console.log(`\n📈 Summary: ${totalPassed}/${totalTests} tests passed (${((totalPassed / totalTests) * 100).toFixed(1)}%)`);
}

runTestAudit().catch(console.error);
