// Print summary of failed checks before exiting in CI
import chalk from 'chalk';
export function printSummary(filteredResults, totalPagesChecked) {
  // if (process.argv.includes('--ci')) {
  const failedChecks = filteredResults.filter(r => r && Array.isArray(r.failedItems) && r.failedItems.length > 0);
  const passedChecks = filteredResults.filter(r => r && Array.isArray(r.failedItems) && r.failedItems.length === 0);
  // Count unique pages with issues by aggregating all failedItems' file/page properties
  const failedPages = new Set();
  for (const check of failedChecks) {
    if (Array.isArray(check.failedItems)) {
      for (const item of check.failedItems) {
        if (item && (item.file || item.page)) {
          failedPages.add(item.file || item.page);
        }
      }
    }
  }

  console.log(chalk.gray.bold(`\n================= SUMMARY =================\n`));
  console.log(chalk.cyan(`⚠️  ${failedPages.size} out of ${totalPagesChecked} page(s) have issues`));
  console.log(chalk.redBright(`❌ TOTAL CHECKS FAILED: ${failedChecks.length}\n`));

  if (failedChecks.length > 0) {
    console.log(chalk.gray('FAILED CHECKS:'));
    failedChecks.forEach(r => {
      console.log(chalk.white.bold(`- ${r.name || r.type || 'Unknown'}: `) + chalk.white(`${r.failedItems.length} failed item(s)`));
    });
  }
  if (passedChecks.length > 0) {
    console.log(chalk.gray('\nPASSED CHECKS:'));
    passedChecks.forEach(r => {
      console.log(chalk.greenBright(`✓ ${r.name || r.type || 'Unknown'}`));
    });
  }
  console.log(chalk.gray.bold('============================================\n'));
  if (failedChecks.length > 0 && process.argv.includes('--ci')) {
    process.exit(1);
  }
  // }
}