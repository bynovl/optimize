
import { aggregateStats } from './aggregate-stats.js';
import { printSummary } from './print-summary.js';
import { displayLogs } from './display-logs.js';
import { exportResultsAsJson, exportResultsAsCsv } from '@bynovl/optimize-utils/export-as.js';
import { startStopSpinner } from '@bynovl/optimize-utils/spinner.js';
import { clearSpinnerLine } from '@bynovl/optimize-utils/spinner.js';
import chalk from 'chalk';

export async function scriptFooter(results, config, args, totalPagesChecked) {
    const jsonOutput = args['--json'] || null;
    const csvOutput = args['--csv'] || null;
    let hasOutputPath = '';

    // Only include results that are not empty/undefined and have failedItems (i.e., actual check results)
    const filteredResults = Array.isArray(results)
        ? results.filter(r => r && r.failedItems !== undefined)
        : [];

    // Aggregate pages and stats using only filtered results
    const { pageMap } = aggregateStats(filteredResults);

    // Optionally export results if config.exportResultsAs is set
    if (config.exportResultsJson && config.exportResultsJson !== '' || jsonOutput) {
        const jsonPath = config.exportResultsJson || jsonOutput;
        hasOutputPath = jsonPath;
        await exportResultsAsJson({ results: filteredResults }, jsonPath);
    }
    // export results as CSV
    if (config.exportResultsCsv && config.exportResultsCsv !== '' || csvOutput) {
        const csvPath = config.exportResultsCsv || csvOutput;
        hasOutputPath = csvPath;
        await exportResultsAsCsv(filteredResults, csvPath);
    }
    if (hasOutputPath !== '') {    
        console.log(chalk.green(`\n✅ Checks completed. Results exported to: ${hasOutputPath}\n`));
        return
    }

    try {
        // Loop through each check and display results. 
        let allPassed = Array.isArray(results) && results.length > 0 && results.every(r => r && r.success);
        for (const result of results) {
            if (result) await displayLogs(result);
            if (!result.success) {
                allPassed = false;
            }
        }
        // Return success message if all checks passed
        if (allPassed) {
            clearSpinnerLine();
            console.log(chalk.bgGreen.black.bold(`✅ ALL CHECKS PASSED`));
        }
        // End timer (update for accurracy)
        startStopSpinner(false);
        if (!allPassed) {
            printSummary(filteredResults, totalPagesChecked);
        }
        return { results: filteredResults, pageMap };
    } catch (err) {
        throw err;
    }
}