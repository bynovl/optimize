// Optimized media checker using centralized utils
import { walk } from '@bynovl/optimize-utils/walk.js';
import fs from 'fs';
import { resolveFilePath } from '@bynovl/optimize-utils/resolve-path.js';
import path from 'path';
import { validateStyleTagBlocks } from './scripts/validate-style-blocks.js';
import { validateImgTag } from './scripts/validate-img-tag.js';
import { validateInlineStyles } from './scripts/validate-inline-styles.js';
import { validateCSS } from './scripts/validate-css.js';
import { createNewItem, returnResults, updatePageTotals } from '@bynovl/optimize-lib/return.js';

import { batchProcess } from '@bynovl/optimize-utils/batch-process.js';
import shouldIgnore from '@bynovl/optimize-lib/should-ignore.js';
import { filterByHtmlSection } from '@bynovl/optimize-utils/filter-html.js';
import { debug } from '@bynovl/optimize-utils/debug-log.js';

export default async function checkMedia(config, htmlFiles, startUrl) {
    const cssFiles = walk(config.outDir, [], ['.css'], config);
    const failedItems = [];

    // Process HTML files separately (on page CSS and img tags)
    const processHtmlFile = async (file) => {
        try {
            resolveFilePath(config, file);
            // Read file content
            const content = await fs.promises.readFile(file, 'utf8');
            // Get relative path for reporting
            const relPath = path.relative(config.outDir, file);
            // Create new item for media results
            const item = createNewItem(relPath, 'media');
            // Filter content to only body section  
            const filteredContent = filterByHtmlSection(content, 'body');

            // Populate item.media.results with errors/warnings
            await validateImgTag(item, filteredContent, config, file, startUrl);
            await validateInlineStyles(item, filteredContent, config, file, startUrl);
            await validateStyleTagBlocks(item, filteredContent, config, file, startUrl);

            // Custom labels matching all required media stats
            const labels = {
                totalImages: 'image',
                brokenInternal: 'internal',
                brokenExternal: 'external',
                brokenImages: 'image',
                emptyImgSrc: 'empty',
                missingImgSrc: 'missing',
                invalidImgSrc: 'invalid',
            };
            // Update local & global stats
            updatePageTotals(item, 'media', labels);

            // Collect items with media issues
            if (item.media.results.length) {
                failedItems.push(item);
            }
        } catch {
            debug(`[PROCESS FAILED]: ${error.message}`)
        }
    };

    // Process CSS files separately
    const processCssFile = async (file) => {
        resolveFilePath(config, file);
        // Read file content
        const content = await fs.promises.readFile(file, 'utf8');
        // Get relative temp path
        const relPath = path.relative(config.outDir, file);
        // Get CSS file directory for relative paths
        const cssFileDir = path.dirname(file);

        // Ignore files and folders defined in config.ignore
        if (shouldIgnore(config, relPath)) return;
        const item = createNewItem(relPath, 'media');

        // Populate item.media.results with errors/warnings
        await validateCSS(item, content, config, cssFileDir, startUrl);

        // Custom labels matching all required media stats
        const labels = {
            totalMedia: 'media',
            internal: 'internal',
            external: 'external',
            brokenInternal: 'internal',
            brokenExternal: 'external',
            totalBroken: 'broken',
            missingOrEmpty: 'missing',
            missingAlt: 'alt',
            brokenImages: 'image',
            emptyImgSrc: 'empty',
            missingImgSrc: 'missing',
            invalidImgSrc: 'invalid',
        };
        // Update page totals
        updatePageTotals(item, 'media', labels);

        // Collect items with media issues
        if (item.media.results.length) {
            failedItems.push(item);
        }
    };

    // Process HTML files in batches if over batch size
    if (htmlFiles.length < config.batchSize) {
        for (const file of htmlFiles) {
            await processHtmlFile(file);
        }
    } else {
        await batchProcess(htmlFiles, config.batchSize, processHtmlFile);
    }
    // Process CSS files in batches if over batch size
    if (cssFiles.length < config.batchSize) {
        for (const file of cssFiles) {
            await processCssFile(file);
        }
    } else {
        await batchProcess(cssFiles, config.batchSize, processCssFile);
    }
    // Return all failed items with media issues
    return returnResults(failedItems, 'Media');
}