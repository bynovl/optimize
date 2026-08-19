/**
 * Aggregate results into:
 * - categories: { [checkName]: { name, totalIssues, totalErrors, totalWarnings, pages: [{ page, issues: [] }] } }
 * - pages: [{ page, stats, issues: [{ check, ...issue }] }]
 * - pageMap: { [page]: { page, stats, issues: [...] } } (back-compat)
 * - globalStats
 */
export function aggregateStats(results, allCheckKeys = []) {
    const pageIndex = new Map();
    const categories = {};

    for (const res of results || []) {
        if (!res || !Array.isArray(res.failedItems)) continue;
        for (const item of res.failedItems) {
            const pageKey = item.page || item.file || 'unknown';
            if (!pageIndex.has(pageKey)) {
                pageIndex.set(pageKey, { page: pageKey, stats: item.stats || {}, issues: [] });
            }
            const pageEntry = pageIndex.get(pageKey);

            for (const [checkName, value] of Object.entries(item || {})) {
                if (checkName === 'page' || checkName === 'stats') continue;
                if (!value || !Array.isArray(value.results)) continue;

                // Ensure category exists
                if (!categories[checkName]) {
                    categories[checkName] = { name: checkName, totalIssues: 0, totalErrors: 0, totalWarnings: 0, pages: {} };
                }
                const cat = categories[checkName];

                // Add page bucket for category
                if (!cat.pages[pageKey]) cat.pages[pageKey] = { page: pageKey, issues: [] };

                for (const issue of value.results) {
                    const enriched = { check: checkName, ...issue };
                    pageEntry.issues.push(enriched);
                    cat.pages[pageKey].issues.push(issue);
                    cat.totalIssues += 1;
                    if (issue.isError) cat.totalErrors += 1;
                    if (issue.isWarning) cat.totalWarnings += 1;
                }
            }

            // merge/overwrite shallow stats
            pageEntry.stats = { ...(pageEntry.stats || {}), ...(item.stats || {}) };
        }
    }

    const pages = Array.from(pageIndex.values());

    // Convert category page maps into arrays
    const categoriesOut = {};
    for (const [k, v] of Object.entries(categories)) {
        categoriesOut[k] = {
            name: v.name,
            totalIssues: v.totalIssues,
            totalErrors: v.totalErrors,
            totalWarnings: v.totalWarnings,
            failedItems: Object.values(v.pages)
        };
    }

    // Ensure all known checks are represented (even if zero)
    if (Array.isArray(allCheckKeys)) {
        for (const key of allCheckKeys) {
            if (!categoriesOut[key]) {
                categoriesOut[key] = {
                    name: key,
                    totalIssues: 0,
                    totalErrors: 0,
                    totalWarnings: 0,
                    failedItems: []
                };
            }
        }
    }

    // Compute Total Stats across all pages
    const stats = {
        totalPages: pages.length,
        totalIssues: 0,
        totalErrors: 0,
        totalWarnings: 0,
    };
    for (const p of pages) {
        stats.totalIssues += p.issues.length;
        for (const iss of p.issues) {
            if (iss.isError) stats.totalErrors += 1;
            if (iss.isWarning) stats.totalWarnings += 1;
        }
    }
    return { categories: categoriesOut, pages, stats };
}