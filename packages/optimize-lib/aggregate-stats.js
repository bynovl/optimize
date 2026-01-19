/**
 * Aggregates results from multiple check modules into a page map and stats.
 * @param {Array} results - Array of check module results
 * @returns {{ pageMap: Object, pages: Array }}
 */
export function aggregateStats(results) {
    const pageMap = {};
    for (const result of results) {
        if (!result) continue;
        for (const item of result.failedItems) {
            const key = item.page;
            if (!pageMap[key]) {
                pageMap[key] = { page: key, stats: {} };
            }
            // Merge type results, concatenate results arrays if type already exists
            Object.entries(item).forEach(([type, value]) => {
                if (type !== 'page' && type !== 'stats') {
                    if (!pageMap[key][type]) {
                        pageMap[key][type] = value;
                    } else if (value && value.results) {
                        pageMap[key][type].results = pageMap[key][type].results.concat(
                            value.results
                        );
                    }
                }
            });
            // Merge stats
            Object.assign(pageMap[key].stats, item.stats);
        }
    }

    // Set global stats
    const globalStats = {
        totalPages: 0,
        totalCss: 0,
        totalScripts: 0,
        totalMedia: 0,
        totalLinks: 0,
        totalErrors: 0,
        totalWarnings: 0,
        totalIssues: 0,
    };

    const pages = Object.values(pageMap);
    globalStats.totalPages = pageMap.length;

    for (const page of pages) {
        // Aggregate CSS and Scripts counts if present in page.stats
        if (page.stats) {
            if (typeof page.stats.totalCss === 'number') {
                globalStats.totalCss += page.stats.totalCss;
            }
            if (typeof page.stats.totalScripts === 'number') {
                globalStats.totalScripts += page.stats.totalScripts;
            }
        }
    }


    return { pageMap, pages, globalStats };
}