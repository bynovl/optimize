// Print summary of failed checks before exiting in CI
import { colors } from '@bynovl/optimize-utils/ansi-colors.js';
export function printSummary(filteredResults, totalPagesChecked) {
  // if (process.argv.includes('--ci')) {
  const failedChecks = filteredResults.filter(r => r && Array.isArray(r.failedItems) && r.failedItems.length > 0);
  const passedChecks = filteredResults.filter(r => r && Array.isArray(r.failedItems) && r.failedItems.length === 0);
  // Count unique pages with issues by aggregating all failedItems' file/page properties
  const failedPages = new Set();
  let totalIssues = 0;
  for (const check of failedChecks) {
    if (Array.isArray(check.failedItems)) {
      for (const item of check.failedItems) {
        if (item && (item.file || item.page)) {
          failedPages.add(item.file || item.page);
        }
        // Aggregate all issues in item.results
        if (item.stats && item.stats.totalIssues) {
          totalIssues += item.stats.totalIssues;
        }
      }
    }
  }
  console.log(colors.boldGray(`\n================= SUMMARY =================\n`));
  console.log(colors.cyan(`⚠️  ${failedPages.size} out of ${totalPagesChecked} page(s) have issues`));
  console.log(colors.brightRed(`❌ TOTAL CHECKS FAILED: ${failedChecks.length}`));
  console.log(colors.brightRed(`❌ TOTAL ISSUES FOUND: ${totalIssues}\n`));

  if (failedChecks.length > 0) {
    console.log(colors.gray('FAILED CHECKS:'));
    failedChecks.forEach(r => {
      console.log(colors.boldWhite(`- ${r.name || r.type || 'Unknown'}: `) + colors.white(`${r.failedItems.length} failed item(s)`));
    });
  }
  if (passedChecks.length > 0) {
    console.log(colors.gray('\nPASSED CHECKS:'));
    passedChecks.forEach(r => {
      console.log(colors.brightGreen(`✓ ${r.name || r.type || 'Unknown'}`));
    });
  }
  console.log(colors.boldGray('============================================\n'));
  if (failedChecks.length > 0 && process.argv.includes('--ci')) {
    process.exit(1);
  }
  // }
}