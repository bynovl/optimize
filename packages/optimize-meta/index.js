import {
    metaTitleRegex,
    metaDescRegex,
    metaKeywordsRegex,
    canonicalUrlRegex,
    robotsRegex,
} from './scripts/regex-meta.js';
import {
    validateTag,
} from './scripts/validate-meta.js';
import { createNewItem, returnResults, updatePageTotals } from '@bynovl/optimize-lib/return.js';

import fs from 'fs';
import path from 'path';
import { batchProcess } from '@bynovl/optimize-utils/batch-process.js';
import { resolveFilePath } from '@bynovl/optimize-utils/resolve-path.js';
import { filterByHtmlSection } from '@bynovl/optimize-utils/filter-html.js';
import { debug } from '@bynovl/optimize-utils/debug-log.js';

export default async function checkMeta(config, htmlFiles, startUrl) {
    const failedItems = [];

    // Define tag checks with their regex and requirement status
    // Easy to extend in the future (or allow custom tag checks by add more objects via optimize config)
    const robotsValidation = (value) => {
        if (!value || typeof value !== 'string') return false;
        const lower = value.toLowerCase();
        return lower.includes('noindex') || lower.includes('nofollow');
    };

    // Multiple tag checks with their regex, requirement status, and URL status
    // Additionally includes custom validation for specific tags where a defined
    // function is needed to check the content further (see robots tag example below)
    const tagChecks = [
        { name: 'title', regex: metaTitleRegex, required: true },
        { name: 'description', regex: metaDescRegex, required: true },
        { name: 'keywords', regex: metaKeywordsRegex, required: false },
        { name: 'canonical', regex: canonicalUrlRegex, required: true, isUrl: true },
        {
            name: 'robots',
            regex: robotsRegex,
            required: false,
            customValidation: {
                check: robotsValidation,
                type: 'invalid',
                reason: 'robots tag contains noindex or nofollow',
                message: 'remove noindex/nofollow from robots meta tag',
            }
        },
    ];

    const processFile = async (file) => {
        try {
            resolveFilePath(config, file);
            // Read temp file content
            const content = await fs.promises.readFile(file, 'utf8');
            // Get relative path
            const relPath = path.relative(config.outDir, file);
            // Create new item for meta
            const item = createNewItem(relPath, 'meta');
            // Filter content by Section: head
            const filteredContent = filterByHtmlSection(content, 'head');

            // Loop through each tag check
            // And validation Tag using validateTag function
            for (const tagCheck of tagChecks) {
                await validateTag(
                    tagCheck.regex,
                    item,
                    filteredContent,
                    tagCheck.name,
                    tagCheck.isUrl,
                    tagCheck.required,
                    tagCheck.customValidation,
                    config,
                    file,
                    startUrl
                );
            }

            // Assign Custom Label Names (optional)
            // Labels correspond to stats keys in results.
            // missingTitle, is labeled as 'title' for easier understanding
            const labels = {
                missingTitle: 'title',
                missingDescription: 'description',
                missingKeywords: 'keywords',
                missingCanonical: 'canonical',
                noIndexPages: 'noindex',
            };

            updatePageTotals(item, 'meta', labels);

            // Check if meta item has any results (errors/warnings)
            if (item.meta.results.length) {
                failedItems.push(item);
            }
        } catch (error) {
            debug(`[PROCESS FAILED]: ${error.message}`)
        }
    };

    // Process files in batches if number is larger
    // Than batch size defined in settings for efficiency
    if (htmlFiles.length < config.batchSize) {
        for (const file of htmlFiles) {
            await processFile(file);
        }
    } else {
        await batchProcess(htmlFiles, config.batchSize, processFile);
    }
    // Return compiled results
    return returnResults(failedItems, 'Meta');
}