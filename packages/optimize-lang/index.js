// REQUIRED IMPORTS
import { resolveFilePath } from '../optimize-utils/resolve-path.js';
import fs from 'fs';
import path from 'path';
import {
    createNewItem,
    returnResults,
    updatePageTotals,
} from '../optimize-lib/return.js';
import { batchProcess } from '../optimize-utils/batch-process.js';

// You custom check (override with actual check name)
import { validateCheck } from './validate-check.js';

// END OF REQUIRED IMPORTS

// Useful for debugging
import { debug } from '../optimize-utils/debug-log.js';
// --- END OF NOT REQUIRED IMPORTS

// --- EXAMPLE CUSTOM CHECK USING OPTIMIZED UTILITIES ---
export default async function checkLang(config, htmlFiles, startUrl) {
    // Array for failed items to be returned at the end. 
    // Each item should follow the standard format with page, check type, and failed items details.
    const failedItems = [];

    console.log('STARTED CHECK: Lang Check');

    // This function processes each file, applies the defined checks, and updates the results accordingly.
    // It uses the centralized utilities for path resolution, result creation, page totals updating, and batch processing.
    const processFile = async (file) => {
        try {
            resolveFilePath(config, file);
            const content = await fs.promises.readFile(file, 'utf8');
            const relPath = path.relative(config.outDir, file);
            // Update page totals and failed items based on the results of the validation.
            // lang is the key that will be used in the summary report for this check. Replace with your actual check name.
            // for multiple keywords use camelCase (e.g. internalLinks, metaLanguage, etc.) and ensure it matches the key used in the item creation and summary report.
            const item = createNewItem(relPath, 'lang');

            // EDIT: This is where the validation logic for your custom check is applied.
            const { validatedItem, labels } = await validateCheck(item, content, config, file, startUrl);

            // Update page totals and failed items based on the results of the validation.
            // lang is the key that will be used in the summary report for this check. Replace with your actual check name.
            // for multiple keywords use camelCase (e.g. internalLinks, metaLanguage, etc.) and ensure it matches the key used in the item creation and summary report.
            updatePageTotals(validatedItem, 'lang', labels);

            // If there are failed results, push to failedItems for summary and reporting
            if (validatedItem.lang.results.length) {
                failedItems.push(validatedItem);
            }
        } catch (error) {
            debug(`[PROCESS FAILED]: ${error.message}`)
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
    // This 'Lang' is the title that will appear in the summary report for this check. Replace with your actual check name.
    return returnResults(failedItems, 'Lang');
}
