import { aggregateStats } from './aggregate-stats.js';
import { printSummary } from './print-summary.js';
import { displayLogs } from './display-logs.js';
import { exportResultsAsJson, exportResultsAsCsv } from '@bynovl/optimize-utils/export-as.js';
import { getPrevRun } from './aggregate-stats-prev.js';
import { exportReport } from './report-generator.js';
import { startStopSpinner } from '@bynovl/optimize-utils/spinner.js';
import { clearSpinnerLine } from '@bynovl/optimize-utils/spinner.js';
import { colors } from '@bynovl/optimize-utils/ansi-colors.js';

export async function scriptFooter(results, config, args, totalPagesChecked, checkModules = null) {
    const jsonFlag = args['--json'] || null;
    const csvFlag = args['--csv'] || null;
    const reportFlag = args['--report'] || null;

    let hasOutputPath = '';

    const filteredResults = Array.isArray(results) ? results.filter(r => r && r.failedItems !== undefined) : [];

    // Ensure all check keys are included in the aggregation, even if no results exist for them
    const allCheckKeys = Array.isArray(checkModules) ? checkModules.map(c => c.key || c.flag) : [];

    // Build weights for each check module
    const defaultModuleWeights = Object.fromEntries(
        checkModules.map(m => [m.key, typeof m.weight === 'number' ? m.weight : undefined])
    );
    // Get user-defined weights from config (if any)
    const userModuleWeights = config.checkWeights || {};

    // Merge default and user-defined weights, with user-defined taking precedence
    const weights = { ...defaultModuleWeights, ...userModuleWeights };

    // Aggregate stats for categories and pages (ensure all categories present)
    const { categories, pages, stats } = aggregateStats(filteredResults, allCheckKeys, { weights, severityWeights: config.severityWeights, totalPages: totalPagesChecked });

    // JSON export -> export clean structure, keep rawResults for compatibility
    if ((config.exportResultsJson && config.exportResultsJson !== '') || jsonFlag) {
        const jsonPath = config.exportResultsJson || jsonFlag || 'results.json';
        hasOutputPath = jsonPath;
        const prevRun = await getPrevRun(jsonPath); // reads existing file before overwriting
        await exportResultsAsJson(prevRun ? { categories, stats, prevRun } : { categories, stats }, jsonPath);
    }

    // CSV export stays the same (expects flattened results)
    if ((config.exportResultsCsv && config.exportResultsCsv !== '') || csvFlag) {
        const csvPath = config.exportResultsCsv || csvFlag || 'results.csv';
        hasOutputPath = csvPath;
        await exportResultsAsCsv(filteredResults, csvPath);
    }

    // Report export -> writes the deterministic audit.md, refining the narrative via LLM
    if (reportFlag || (config.report && config.report.autoRun)) {
        const reportPath = reportFlag || config.report.fileOutput || 'audit.md';
        hasOutputPath = reportPath;

        await exportReport(config, { categories, stats }, { output: reportPath });
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