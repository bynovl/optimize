// Optimized sources checker using centralized utils
import fs from 'fs';
import { resolveFilePath } from '@bynovl/optimize-utils/resolve-path.js';
import path from 'path';
import {
    validateScriptSrc,
    validateStylesheetHref,
} from './scripts/validate-sources.js';
import {
    createNewItem,
    returnResults,
    updatePageTotals,
} from '@bynovl/optimize-lib/return.js';
import { batchProcess } from '@bynovl/optimize-utils/batch-process.js';
import shouldIgnore from '@bynovl/optimize-lib/should-ignore.js';
import { debug } from '@bynovl/optimize-utils/debug-log.js';

export default async function checkSources(config, htmlFiles, startUrl) {
    const failedItems = [];
    const processFile = async (file) => {
        try {
            resolveFilePath(config, file);
            // Read file content
            const content = await fs.promises.readFile(file, 'utf8');
            // Get relative path
            const relPath = path.relative(config.outDir, file);
            // Create new item for sources results
            const item = createNewItem(relPath, 'sources');

            // Ignore files and folders in the ignore list
            if (shouldIgnore(config, relPath)) return;

            // Validate <script src="..."> and <link rel="stylesheet" href="...">
            await validateScriptSrc(item, content, config, file, startUrl);
            await validateStylesheetHref(item, content, config, file, startUrl);

            // Create custom labels
            const labels = {
                totalScripts: 'script',
                totalCss: 'stylesheet',
            };
            // Update local & global stats
            updatePageTotals(item, 'sources', labels);

            // If issues found, add to failed items
            if (item.sources.results.length) failedItems.push(item);

        } catch (error) {
            debug(`[PROCESS FAILED]: ${error.message}`)
        }
    };

    // Process files in batches
    if (htmlFiles.length < config.batchSize) {
        for (const file of htmlFiles) {
            await processFile(file);
        }
    } else {
        await batchProcess(htmlFiles, config.batchSize, processFile);
    }

    // Return all failed items
    return returnResults(failedItems, 'Sources');
}
