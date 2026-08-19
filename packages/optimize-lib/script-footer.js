
import { aggregateStats } from './aggregate-stats.js';
import { printSummary } from './print-summary.js';
import { displayLogs } from './display-logs.js';
import { exportResultsAsJson, exportResultsAsCsv } from '@bynovl/optimize-utils/export-as.js';
import { getPrevRun } from './prev-run.js';
import exportReport from './generate-report-new.js';
import { startStopSpinner } from '@bynovl/optimize-utils/spinner.js';
import { clearSpinnerLine } from '@bynovl/optimize-utils/spinner.js';
import { colors } from '@bynovl/optimize-utils/ansi-colors.js';

export async function scriptFooter(results, config, args, totalPagesChecked, checkModules = null) {
    const jsonOutput = args['--json'] || null;
    const csvOutput = args['--csv'] || null;
    const reportOutput = args['--report'] || null;
    let hasOutputPath = '';

    const filteredResults = Array.isArray(results) ? results.filter(r => r && r.failedItems !== undefined) : [];

    // Aggregate stats for categories and pages (ensure all categories present)
    if (!Array.isArray(checkModules)) {
        const cm = await getCheckModules();
        checkModules = Array.isArray(cm?.checkModules) ? cm.checkModules : [];
    }
    const allCheckKeys = Array.isArray(checkModules) ? checkModules.map(c => c.key || c.flag) : [];
    const { categories, pages, stats } = aggregateStats(filteredResults, allCheckKeys);


    // JSON export -> export clean structure, keep rawResults for compatibility
    if ((config.exportResultsJson && config.exportResultsJson !== '') || jsonOutput) {
        const jsonPath = config.exportResultsJson || jsonOutput;
        hasOutputPath = jsonPath;
        const prevRun = await getPrevRun(jsonPath); // reads existing file before overwriting
        await exportResultsAsJson(prevRun ? { categories, stats, prevRun } : { categories, stats }, jsonPath);
    }

    // CSV export stays the same (expects flattened results)
    if ((config.exportResultsCsv && config.exportResultsCsv !== '') || csvOutput) {
        const csvPath = config.exportResultsCsv || csvOutput;
        hasOutputPath = csvPath;
        await exportResultsAsCsv(filteredResults, csvPath);
    }

    // Report export gets the new shape
    if ((config.llm && config.llm.autoRun) || reportOutput) {
        const auditPath = await exportReport(config, { categories, stats });
        hasOutputPath = auditPath;
    }

    if (hasOutputPath !== '') {
        console.log(colors.boldGreen(`\n✅ Checks completed. Results exported to: ${hasOutputPath}\n`));
        return;
    }

    try {
        let allPassed = Array.isArray(results) && results.length > 0 && results.every(r => r && r.success);

        for (const result of results) {
            if (result) await displayLogs(result);
            if (!result.success) allPassed = false;
        }

        if (allPassed) {
            clearSpinnerLine();
            console.log(colors.bgGreenBlackBold(`✅ ALL CHECKS PASSED`));
        }
        startStopSpinner(false);

        if (!allPassed) {
            // keep existing summary behavior (unmodified)
            printSummary(filteredResults, totalPagesChecked);
        }

        // Return both old and new shapes for compatibility
        return { results: filteredResults, pages, categories, stats };
    } catch (err) {
        throw err;
    }
}