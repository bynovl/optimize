
import { aggregateStats } from './aggregate-stats.js';
import { printSummary } from './print-summary.js';
import { displayLogs } from './display-logs.js';
import { exportResultsAsJson, exportResultsAsCsv } from '@bynovl/optimize-utils/export-as.js';
import exportReport from './generate-report.js';
import { startStopSpinner } from '@bynovl/optimize-utils/spinner.js';
import { clearSpinnerLine } from '@bynovl/optimize-utils/spinner.js';
import { colors } from '@bynovl/optimize-utils/ansi-colors.js';

export async function scriptFooter(results, config, args, totalPagesChecked) {
    const jsonOutput = args['--json'] || null;
    const csvOutput = args['--csv'] || null;
    const reportOutput = args['--report'] || null;
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
    // export report (markdown or other, LLM-driven) only if --report flag is set or llm.auto is true
    if (config.llm && config.llm.autoRun || reportOutput) {
        const auditPath =  await exportReport(config, filteredResults, reportOutput); // path handled by config.llm.fileOutput
        hasOutputPath = auditPath;
    }
    if (hasOutputPath !== '') {    
        console.log(colors.boldGreen(`\n✅ Checks completed. Results exported to: ${hasOutputPath}\n`));
        return
    }
    try {
        // Loop through each check and display results. 
        let allPassed = Array.isArray(results) && results.length > 0 && results.every(r => r && r.success);
        
        // Site Audit
        // console.log(colors.boldGray('===========================================\nSITE AUDIT\n===========================================\n'));
        for (const result of results) {
            if (result) await displayLogs(result);
            if (!result.success) {
                allPassed = false;
            }
        }
        // Return success message if all checks passed
        if (allPassed) {
            clearSpinnerLine();
            console.log(colors.bgGreenBlackBold(`✅ ALL CHECKS PASSED`));
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