// Print summary of failed checks before exiting in CI
import chalk from 'chalk';
export function printSummary(filteredResults) {
  // if (process.argv.includes('--ci')) {
  const failedChecks = filteredResults.filter(r => r && Array.isArray(r.failedItems) && r.failedItems.length > 0);
  if (failedChecks.length > 0) {
    const totalFailedItems = failedChecks.reduce((sum, r) => sum + r.failedItems.length, 0);
    console.log(chalk.gray.bold(`\n================= SUMMARY =================\n`));
    console.log(chalk.redBright(`❌ TOTAL CHECKS FAILED: ${failedChecks.length}`));
    console.log(chalk.redBright(`⚠️  TOTAL FAILED ITEMS: ${totalFailedItems}\n`));
    console.log(chalk.gray('FAILED CHECKS:'));
    failedChecks.forEach(r => {
      console.log(chalk.white.bold(`- ${r.name || r.type || 'Unknown'}: `) + chalk.white(`${r.failedItems.length} failed item(s)`));
    });
    console.log(chalk.gray.bold('============================================'));
    if (process.argv.includes('--ci')) {
      process.exit(1);
    }
  }
  // }
}