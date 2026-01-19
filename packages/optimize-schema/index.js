// Optimized schema checker using centralized utils
import fs from 'fs';
import { resolveFilePath } from '@bynovl/optimize-utils/resolve-path.js';
import path from 'path';
import {
    createNewItem,
    returnResults,
    updatePageTotals,
} from '@bynovl/optimize-lib/return.js';
import { batchProcess } from '@bynovl/optimize-utils/batch-process.js';
import { extractJsonLd } from './scripts/validate-schema.js';
import { debug } from '@bynovl/optimize-utils/debug-log.js';

export default async function checkSchema(config, htmlFiles, startUrl) {

    // Merge config keys as required
    const defaultKeys = Array.isArray(config.schemaDataDefault)
        ? config.schemaDataDefault
        : [];
    const customKeys = Array.isArray(config.schemaDataCustom)
        ? config.schemaDataCustom
        : [];

    // If user config exists, append default keys, override/append custom keys
    const allKeys = [...defaultKeys, ...customKeys];
    const allParsedKeys = allKeys.map((key) => {
        const required = key.endsWith(':required');
        return { path: required ? key.replace(':required', '') : key, required };
    });

    // Array to hold items with schema issues
    const failedItems = [];

    // Track total pages scanned (excluding ignored pages)
    const processFile = async (file) => {
        try {
            resolveFilePath(config, file);
            // Read file content
            const content = await fs.promises.readFile(file, 'utf8');
            // Get relative path
            const relPath = path.relative(config.outDir, file);
            // Create new item for schema results
            const item = createNewItem(relPath, 'schema');
            // Find all JSON-LD blocks
            await extractJsonLd(item, content, config.outDir, allParsedKeys, startUrl);

            // Explicit schema stats labels as per requirements
            const labels = {
                missingSchemaBlock: 'no json-ld',
                invalidSchemaBlock: 'invalid json-ld',
                brokenSchemaUrl: 'invalid link or path',
                missingRequiredKeys: 'missing required',
                missingOptionalKeys: 'missing optional',
            };

            // Update local & global stats
            updatePageTotals(item, 'schema', labels);

            // If issues found, add to failed items
            if (item.schema.results.length) {
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
    // Return all failed items with schema issues
    return returnResults(failedItems, 'Schema');
}
