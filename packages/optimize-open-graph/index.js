// Optimized Open Graph checker using centralized utils
import { resolveFilePath } from '@bynovl/optimize-utils/resolve-path.js';
import fs from 'fs';
import path from 'path';
import {
    ogTitle,
    ogDesc,
    ogImage,
    ogUrl,
    twitterTitle,
    twitterDesc,
    twitterImage,
} from './scripts/regex-open-graph.js';
import { validateOpenGraph } from './scripts/validate-open-graph.js';
import {
    createNewItem,
    returnResults,
    updatePageTotals,
} from '@bynovl/optimize-lib/return.js';
import { batchProcess } from '@bynovl/optimize-utils/batch-process.js';
import { filterByHtmlSection } from '@bynovl/optimize-utils/filter-html.js';
import { debug } from '@bynovl/optimize-utils/debug-log.js';

export default async function checkOpenGraph(config, htmlFiles, startUrl) {
    const failedItems = [];

    // Multiple tag checks with their regex, requirement status, and URL status
    // URL status indicates if the content should be validated as a URL
    const tagChecks = [
        { name: 'og:title', regex: ogTitle, required: true },
        { name: 'og:description', regex: ogDesc, required: true },
        { name: 'og:image', regex: ogImage, required: true, isUrl: true },
        { name: 'og:url', regex: ogUrl, required: true, isUrl: true },
        { name: 'twitter:title', regex: twitterTitle, required: true },
        { name: 'twitter:description', regex: twitterDesc, required: true },
        { name: 'twitter:image', regex: twitterImage, required: true, isUrl: true },
    ];

    const processFile = async (file) => {
        try {
            resolveFilePath(config, file);
            const content = await fs.promises.readFile(file, 'utf8');
            const relPath = path.relative(config.outDir, file);
            const item = createNewItem(relPath, 'openGraph');

            // Filter content by Section: head
            const filteredContent = filterByHtmlSection(content, 'head');

            // Loop through each tag check
            for (const tagCheck of tagChecks) {
                await validateOpenGraph(
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

            function toCapitalize(str) {
                return str.charAt(0).toUpperCase() + str.slice(1);
            }

            // Build stats labels for Open Graph tags (optional)
            const labels = {};
            for (const { name } of tagChecks) {
                const label = name.split(':');
                const labelKey =
                    'missing' + toCapitalize(label[0]) + toCapitalize(label[1]);
                labels[labelKey] = name;
            }

            // Update page totals based on found issues
            updatePageTotals(item, 'openGraph', labels);

            // Checks if there are any results (errors/warnings)
            if (item.openGraph.results.length) {
                failedItems.push(item);
            }
        } catch (error) {
            debug(`[PROCESS FAILED]: ${error.message}`)
        }
    };

    // Process files in batches if number is larger 
    // Than batch size for efficiency
    if (htmlFiles.length < config.batchSize) {
        for (const file of htmlFiles) {
            await processFile(file);
        }
    } else {
        await batchProcess(htmlFiles, config.batchSize, processFile);
    }

    // Return compiled results
    return returnResults(failedItems, 'Open Graph');
}
