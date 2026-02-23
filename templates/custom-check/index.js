// core utilities used by checks
import { resolveFilePath } from '@bynovl/optimize-utils/resolve-path.js';
import fs from 'fs';
import path from 'path';
import { createNewItem, returnResults, updatePageTotals } from '@bynovl/optimize-lib/return.js';
import { batchProcess } from '@bynovl/optimize-utils/batch-process.js';

// === CUSTOM CHECK IMPORTS ===
import { checkProps } from './scripts/check-props.js'; // flag/key/label definitions
import { validateCheck } from './scripts/check-validation.js';
// ============================

// debug utility
import { debug } from '@bynovl/optimize-utils/debug-log.js';

// Default configuration for this check.
// ONLY edit the function name below to match your check (e.g. checkPerformance)
export default async function checkLang(config, htmlFiles, startUrl) {
    const failedItems = [];
    const processFile = async (file) => {
        try {
            resolveFilePath(config, file);
            const content = await fs.promises.readFile(file, 'utf8');
            const relPath = path.relative(config.outDir, file);
            const item = createNewItem(relPath, checkProps.key);

            // run the custom validation for this file
            const { validatedItem, labels } = await validateCheck(item, content, config, file, startUrl);

            updatePageTotals(validatedItem, checkProps.key, labels);

            if (validatedItem[checkProps.key].results.length) {
                failedItems.push(validatedItem);
            }
        } catch (error) {
            debug(`[PROCESS FAILED]: ${error.message}`);
        }
    };

    // REQUIRED: Batch processing logic to handle large numbers of files efficiently. 
    // If the number of files is less than the batch size, process them directly; otherwise, use the batch processing utility.
    if (htmlFiles.length < config.batchSize) {
        for (const file of htmlFiles) {
            await processFile(file);
        }
    } else {
        await batchProcess(htmlFiles, config.batchSize, processFile);
    }
    return returnResults(failedItems, checkProps.label);
}
