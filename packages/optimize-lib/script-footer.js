import { aggregateStats, getPrevRun } from './aggregate-stats.js';
import { printSummary } from './print-summary.js';
import { displayLogs } from './display-logs.js';
import { exportResultsAsJson, exportResultsAsCsv } from '@bynovl/optimize-utils/export-as.js';
import { exportReport } from './report-generator.js';
import { startStopSpinner, clearSpinnerLine } from '@bynovl/optimize-utils/spinner.js';
import { colors } from '@bynovl/optimize-utils/ansi-colors.js';

export async function scriptFooter(results, config, args, totalPagesChecked, checkModules = null) {
    // Flags
    const hasJsonFlag = Object.prototype.hasOwnProperty.call(args, '--json');
    const hasCsvFlag = Object.prototype.hasOwnProperty.call(args, '--csv');
    const hasReportFlag = Object.prototype.hasOwnProperty.call(args, '--report');
    const jsonFlag = args['--json'] || null;
    const csvFlag = args['--csv'] || null;
    const reportFlag = args['--report'] || null;

    // Paths
    const configuredJsonPath = typeof config?.exportResultsJson === 'string' && config.exportResultsJson !== ''
        ? config.exportResultsJson
        : null;
    const configuredCsvPath = typeof config?.exportResultsCsv === 'string' && config.exportResultsCsv !== ''
        ? config.exportResultsCsv
        : null;
    const configuredReportPath = typeof config?.report?.fileOutput === 'string' && config.report.fileOutput !== ''
        ? config.report.fileOutput
        : null;
    const reportAutoRun = config?.report?.autoRun === true;

    // Collect all output paths for exported artifacts (json, csv, report)
    const outputPaths = [];

    const filteredResults = Array.isArray(results) ? results.filter(r => r && r.failedItems !== undefined) : [];

    const moduleList = Array.isArray(checkModules) ? checkModules : [];

    // Ensure all check keys are included in the aggregation, even if no results exist for them
    const allCheckKeys = moduleList.map(c => c.key || c.flag);

    // Weights are centralized in getConfig via load-check-weights.js
    // and user overrides are already merged there.
    const weights = config?.checkWeights || {};

    // Aggregate stats for categories and pages (ensure all categories present)
    const { categories, pages, stats } = aggregateStats(filteredResults, allCheckKeys, { weights, severityWeights: config?.severityWeights, totalPages: totalPagesChecked });

    const isFlag = v => typeof v === 'string' && v.startsWith('--');
    // JSON export -> export clean structure, keep rawResults for compatibility
    if (configuredJsonPath || hasJsonFlag) {
        const jsonPath = typeof jsonFlag === 'string' && !isFlag(jsonFlag)
            ? jsonFlag
            : (configuredJsonPath || 'o-results.json');
        outputPaths.push(jsonPath);
        const prevRun = await getPrevRun(jsonPath); // reads existing file before
        await exportResultsAsJson(prevRun ? { categories, stats, prevRun } : { categories, stats }, jsonPath);
    }

    // CSV export stays the same (expects flattened results)
    if (configuredCsvPath || hasCsvFlag) {
        const csvPath = typeof csvFlag === 'string' && !isFlag(csvFlag)
            ? csvFlag
            : (configuredCsvPath || 'o-results.csv');
        outputPaths.push(csvPath);
        await exportResultsAsCsv(categories, csvPath);
    }

    // Report export is opt-in only:
    // - CLI: --report / --report <file>
    // - Config: report.autoRun: true (optionally with report.fileOutput)
    // report.fileOutput alone should not trigger auto export.
    if (hasReportFlag || reportAutoRun) {
        const reportFile = typeof reportFlag === 'string' && !isFlag(reportFlag) ? reportFlag : (configuredReportPath || 'o-audit.md');
        const reportPath = reportFile;
        outputPaths.push(reportPath);
        await exportReport(config, { categories, stats }, { output: reportPath });
    }

    if (outputPaths.length > 0) {
        // Join multiple paths with commas for a concise message
        const pathsMessage = outputPaths.join(', ');
        console.log(colors.boldGreen(`\n✅ Checks completed. Results exported to: ${pathsMessage}\n`));
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