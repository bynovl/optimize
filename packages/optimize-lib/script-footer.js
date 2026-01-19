
import { aggregateStats } from './aggregate-stats.js';
import { printSummary } from './print-summary.js';
import { displayLogs } from './display-logs.js';
import { exportResultsAsJson, exportResultsAsCsv } from '@bynovl/optimize-utils/export-as.js';
import { startStopSpinner } from '@bynovl/optimize-utils/spinner.js';

export async function scriptFooter(results, config) {
    try {
        // Loop through each check and display results. 
        for (const result of results) {
            if (result) await displayLogs(result);
        }

        // Only include results that are not empty/undefined and have failedItems (i.e., actual check results)
        const filteredResults = Array.isArray(results)
            ? results.filter(r => r && r.failedItems !== undefined)
            : [];

        // Aggregate pages and stats using only filtered results
        const { pageMap } = aggregateStats(filteredResults);

        // Optionally export results if config.exportResultsAs is set
        if (config.exportResultsJson && config.exportResultsJson !== '') {
            await exportResultsAsJson({ results: filteredResults }, config.exportResultsJson);
        }
        // export results as CSV
        if (config.exportResultsCsv && config.exportResultsCsv !== '') {
            await exportResultsAsCsv(filteredResults, config.exportResultsCsv);
        }

        // End timer (update for accurracy)
        startStopSpinner(false);

        // Print summary of failed checks
        printSummary(filteredResults);

        return { results: filteredResults, pageMap };
    } catch (err) {
        throw err;
    }
}