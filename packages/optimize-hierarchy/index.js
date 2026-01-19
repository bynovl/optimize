
/**
 * Optimized heading hierarchy checker using centralized utils.
 *
 * Can be used independently or as part of the optimize-core orchestrator.
 *
 * @param {object} config - Configuration object (must include outDir and batchSize).
 * @param {string[]} htmlFiles - Array of local HTML file paths to check.
 * @param {string} [startUrl] - (Unused) Optional start URL for compatibility with orchestrators. Remote/URL support is not implemented.
 * @returns {Promise<object[]>} Array of result objects for files with hierarchy issues.
 */

import fs from 'fs';
import { resolveFilePath } from '@bynovl/optimize-utils/resolve-path.js';
import path from 'path';
import { checkHeadingOrder } from './scripts/validate-hierarchy.js';
import {
    createNewItem,
    updatePageTotals,
    returnResults,
} from '@bynovl/optimize-lib/return.js';
import { extractTags } from '@bynovl/optimize-utils/extract-tags.js';
import { batchProcess } from '@bynovl/optimize-utils/batch-process.js';
import { filterByHtmlSection } from '@bynovl/optimize-utils/filter-html.js';
import { debug } from '@bynovl/optimize-utils/debug-log.js';


export default async function checkHierarchy(config, htmlFiles, startUrl) {
    // Array to hold items with issues
    const failedItems = [];

    const processFile = async (file) => {
        try {
            resolveFilePath(config, file);
            const content = await fs.promises.readFile(file, 'utf8');
            const relPath = path.relative(config.outDir, file);
            const filteredContent = filterByHtmlSection(content, 'body');
            const item = createNewItem(relPath, 'hierarchy');

            // Extract headings and paragraphs
            const tagsArr = extractTags(filteredContent, [
                'h1',
                'h2',
                'h3',
                'h4',
                'h5',
                'h6',
                'p',
            ]);

            // Check heading order and push issues to results
            const headingIssues = checkHeadingOrder(tagsArr, filteredContent);
            headingIssues.forEach((obj) => item.hierarchy.results.push(obj));

            // Create custom labels for hierarchy issues
            const labels = {
                invalidFirstHeading: 'firstHeading',
                multipleH1Tags: 'multipleH1',
                invalidHeadingOrder: 'headingOrder',
            };

            // Update page totals and collect failed items
            updatePageTotals(item, 'hierarchy', labels);
            if (item.hierarchy.results.length) {
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
        debug(`Processing ${htmlFiles.length} files in batches of ${config.batchSize}...`);
        await batchProcess(htmlFiles, config.batchSize, processFile);
    }
    // Return results
    return returnResults(failedItems, 'Hierarchy');
}