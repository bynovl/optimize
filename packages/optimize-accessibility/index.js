// Optimized accessibility checker using centralized utils
import {
    checkAltText,
    checkTabIndex,
    checkLabelFor,
    checkAriaRoles,
} from './scripts/validate-a11y.js';
import { shouldSkipElement } from './scripts/a11y-utils.js';
import fs from 'fs';
import { resolveFilePath } from '@bynovl/optimize-utils/resolve-path.js';
import path from 'path';
import {
    createNewItem,
    updatePageTotals,
    returnResults,
} from '@bynovl/optimize-lib/return.js';
import { batchProcess } from '@bynovl/optimize-utils/batch-process.js';
import { debug } from '@bynovl/optimize-utils/debug-log.js'

/**
 * Runs accessibility checks on all HTML files in the output directory.
 * @param {object} config - Configuration object for the check.
 * @param {object} [globalStats] - Optional stats object for aggregation.
 * @returns {Promise<Array>} Array of result objects per file.
 */
export default async function checkAccessibility(config, htmlFiles) {
    // Array to hold items with issues
    const failedItems = [];

    // Process a single file
    const processFile = async (file) => {
        try {
            resolveFilePath(config, file);
            const content = await fs.promises.readFile(file, 'utf8');
            const relPath = path.relative(config.outDir, file);
            const item = createNewItem(relPath, 'accessibility');

            // Filter content excluding elements that should be skipped
            const filteredContent = content.replace(/<[^>]+>/g, (tag) => {
                return shouldSkipElement(tag) ? '' : tag;
            });

            // Run accessibility checks
            const ariaResults = checkAriaRoles(filteredContent);
            const altResults = checkAltText(filteredContent);
            const tabIndexResults = checkTabIndex(filteredContent);
            const labelForResults = checkLabelFor(filteredContent);

            // Collect all results
            ariaResults.forEach((obj) => item.accessibility.results.push(obj));
            altResults.forEach((obj) => item.accessibility.results.push(obj));
            tabIndexResults.forEach((obj) => item.accessibility.results.push(obj));
            labelForResults.forEach((obj) => item.accessibility.results.push(obj));

            // Create custom labels for accessibility issues
            const labels = {
                missingAriaRoles: 'aria',
                missingAltText: 'alt',
                missingTabIndex: 'tab-index',
                missingLabelFor: 'label',
            };

            // Update page totals and collect failed items
            updatePageTotals(item, 'accessibility', labels);

            // If issues found, add to failed items
            if (item.accessibility.results.length) {
                failedItems.push(item);
            }
        } catch (error) {
            debug(`[PROCESS FAILED]: ${error.message}`)
        }
    };

    // Process files in batches if over batch size
    if (htmlFiles.length < config.batchSize) {
        for (const file of htmlFiles) {
            await processFile(file);
        }
    } else {
        await batchProcess(htmlFiles, config.batchSize, processFile);
    }
    // Return results
    return returnResults(failedItems, 'Accessibility');
}
// Run if executed from CLI
if (process.argv[1] === new URL(import.meta.url).pathname) {
    runAllChecks();
}