import fs from 'fs';
/*
 * Works with JSON export to read the previous run's results and extract category totals for comparison. Must export to the same JSON file to detect changes. Otherwise, prevRun will be null.
 */
function compactCategoryTotals(cat) {
    const totalPages = Array.isArray(cat.failedItems)
        ? cat.failedItems.length
        : Array.isArray(cat.pages)
            ? cat.pages.length
            : (cat.totalPages || 0);
    return {
        name: cat.name || null,
        totalPages,
        totalIssues: cat.totalIssues || 0,
        totalErrors: cat.totalErrors || 0,
        totalWarnings: cat.totalWarnings || 0
    };
}

export async function getPrevRun(jsonPath) {
    try {
        await fs.promises.access(jsonPath, fs.constants.R_OK);
    } catch (err) {
        return null;
    }

    try {
        const raw = await fs.promises.readFile(jsonPath, 'utf8');
        const existing = JSON.parse(raw);

        const prevStats = existing.stats || existing.globalStats || null;
        const prevCategories = {};

        if (existing.categories && typeof existing.categories === 'object') {
            for (const [k, v] of Object.entries(existing.categories)) {
                prevCategories[k] = compactCategoryTotals(v);
            }
        }

        return { stats: prevStats, categories: prevCategories };
    } catch (err) {
        return null;
    }
}
