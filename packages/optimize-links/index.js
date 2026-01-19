// Optimized link checker using centralized utils

import fs from 'fs';
import { resolveFilePath } from '@bynovl/optimize-utils/resolve-path.js';
import { checkLinkValidity } from '@bynovl/optimize-lib/check-link-validity.js';
import {
    createNewItem,
    updatePageTotals,
    returnResults,
} from '@bynovl/optimize-lib/return.js';
import { filterByHtmlSection } from '@bynovl/optimize-utils/filter-html.js';
import path from 'path';
import { batchProcess } from '@bynovl/optimize-utils/batch-process.js';
import { processLinks } from './scripts/process-links.js';
import { debug } from '@bynovl/optimize-utils/debug-log.js';

export default async function checkLinks(config, htmlFiles, startUrl) {
    const failedItems = [];

    const processFile = async (file) => {
        try {
            resolveFilePath(config, file);
            const content = await fs.promises.readFile(file, 'utf8');
            const filteredContent = filterByHtmlSection(content, 'body');
            // Filter by a< href attributes only>

            const relPath = path.relative(config.outDir, file);
            const item = createNewItem(relPath, 'links');

            // Get all <a href="..."> links
            const anchorHrefRegex = /<a\s+[^>]*href=(['"])(.*?)\1/gi;

            // Capture unique links
            const uniqueLinks = new Set();
            let match;

            // Extract and validate only <a href="..."> links
            while ((match = anchorHrefRegex.exec(filteredContent)) !== null) {
                const href = match[2];
                if (href && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
                    uniqueLinks.add(href);
                }
            }

            // Experiment with concurrency, max, or default processing
            await processLinks(
                'links',
                uniqueLinks,
                { item, content, config, file, startUrl }
            );


            // Extract all links and broken links
            const linksArr = [...uniqueLinks]; // Extracted links
            const brokenLinksArr = item.links.results.filter((link) => link.isError);

            // Update local stats
            item.links.stats.totalLinks = linksArr.length;
            item.links.stats.totalBrokenLinks = brokenLinksArr.length;
            updatePageTotals(item, 'links');

            if (item.links.results.length) {
                failedItems.push(item);
            }
        } catch (error) {
            debug(`[PROCESS FAILED]: ${error.message}`)
        }
    };

    if (htmlFiles.length < config.batchSize) {
        for (const file of htmlFiles) {
            await processFile(file);
        }
    } else {
        await batchProcess(htmlFiles, config.batchSize, processFile);
    }

    return returnResults(failedItems, 'Links');
}