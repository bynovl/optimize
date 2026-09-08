/**
 * Aggregate results into:
 * - categories: { [checkName]: { name, totalIssues, totalErrors, totalWarnings, score, failedItems: [...] } }
 * - pages: [{ page, stats, issues: [{ check, weight, severityMultiplier, weightedScore, ...issue }], weightedIssues }]
 * - stats: { totalPages, totalIssues, totalErrors, totalWarnings, score }
 *
 * API:
 *   aggregateStats(results, allCheckKeys = [], options = {})
 * options:
 *   - weights: { [checkKey]: number } (0.0 - 1.0)
 *   - severityWeights: { error: number, warning: number } (defaults: { error:1, warning:0.5 })
 *   - sigmoid: { k: number, x0: number } (defaults: { k:1, x0:1 }) — uses sigmoid mapping by default
 *   - totalPages: number (optional; if omitted uses actual pages counted)
 *  getPrevRun(jsonPath) - returns { stats, categories } or null if not found/invalid
 */
import fs from 'fs';

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
        totalWarnings: cat.totalWarnings || 0,
        score: cat.score || null,
    };
}
export function aggregateStats(results, allCheckKeys = [], options = {}, totalPages) {
    const weights = (options && options.weights) || {};
    const _severityDefaults = { error: 1, warning: 0.5 };
    const severityWeights = { ..._severityDefaults, ...(options && options.severityWeights ? options.severityWeights : {}) };

    const errMult = typeof severityWeights.error === 'number' ? severityWeights.error : 1;
    const warnMult = typeof severityWeights.warning === 'number' ? severityWeights.warning : 0.5;

    const sigmoidOpts = (options && options.sigmoid) || { k: 1, x0: 1 };
    const k = typeof sigmoidOpts.k === 'number' ? sigmoidOpts.k : 1;
    const x0 = typeof sigmoidOpts.x0 === 'number' ? sigmoidOpts.x0 : 1;

    const pageIndex = new Map();
    const categories = {};

    for (const res of results || []) {
        if (!res || !Array.isArray(res.failedItems)) continue;
        for (const item of res.failedItems) {
            const pageKey = item.page || item.file || 'unknown';
            if (!pageIndex.has(pageKey)) {
                pageIndex.set(pageKey, { page: pageKey, stats: item.stats || {}, issues: [], weightedIssues: 0 });
            }
            const pageEntry = pageIndex.get(pageKey);

            for (const [checkName, value] of Object.entries(item || {})) {
                if (checkName === 'page' || checkName === 'stats') continue;
                if (!value || !Array.isArray(value.results)) continue;

                if (!categories[checkName]) {
                    categories[checkName] = {
                        name: checkName,
                        totalIssues: 0,
                        totalErrors: 0,
                        totalWarnings: 0,
                        pages: {}, // map pageKey -> { page, issues: [], weightedIssues }
                        // internal: weighted totals used for scoring
                        totalWeightedIssues: 0,
                        totalWeightedErrors: 0,
                        totalWeightedWarnings: 0
                    };
                }
                const cat = categories[checkName];

                if (!cat.pages[pageKey]) cat.pages[pageKey] = { page: pageKey, issues: [], weightedIssues: 0 };

                for (const issue of value.results) {
                    const wRaw = Object.prototype.hasOwnProperty.call(weights, checkName) ? weights[checkName] : 1;
                    const w = Math.max(0, Math.min(1, Number(wRaw) || 0));

                    // severity multiplier: error or warning only
                    const sevMult = issue.isError ? errMult : warnMult;
                    const weighted = w * sevMult;

                    const enriched = { check: checkName, weight: w, severityMultiplier: sevMult, weightedScore: weighted, ...issue };

                    // page-level
                    pageEntry.issues.push(enriched);
                    pageEntry.weightedIssues = (pageEntry.weightedIssues || 0) + weighted;

                    // category page-level (internal)
                    cat.pages[pageKey].issues.push(issue);
                    cat.pages[pageKey].weightedIssues = (cat.pages[pageKey].weightedIssues || 0) + weighted;

                    // category totals (internal)
                    cat.totalIssues += 1;
                    cat.totalWeightedIssues += weighted;
                    if (issue.isError) {
                        cat.totalErrors += 1;
                        cat.totalWeightedErrors += weighted;
                    } else {
                        cat.totalWarnings += 1;
                        cat.totalWeightedWarnings += weighted;
                    }
                }
            }

            // merge/overwrite shallow stats
            pageEntry.stats = { ...(pageEntry.stats || {}), ...(item.stats || {}) };
        }
    }

    const pages = Array.from(pageIndex.values());

    // Public category shape (exclude internal weighted totals)
    const categoriesOut = {};
    for (const [kName, v] of Object.entries(categories)) {
        const failedItems = Object.values(v.pages)
            .map(p => ({ page: p.page, issues: p.issues }))
            .sort((a, b) => b.issues.length - a.issues.length); // order pages most->fewest issues

        categoriesOut[kName] = {
            name: v.name,
            totalIssues: v.totalIssues,
            totalErrors: v.totalErrors,
            totalWarnings: v.totalWarnings,
            failedItems
        };
    }

    // Ensure all known checks are represented
    if (Array.isArray(allCheckKeys)) {
        for (const key of allCheckKeys) {
            if (!categoriesOut[key]) {
                categoriesOut[key] = { name: key, totalIssues: 0, totalErrors: 0, totalWarnings: 0, failedItems: [] };
            }
        }
    }

    // Compute raw totals
    const stats = {
        checkedPages: totalPages,
        totalPages: pages.length,
        totalIssues: 0,
        totalErrors: 0,
        totalWarnings: 0,
        score: 100,
        dateTime: new Date().toISOString()
    };

    for (const p of pages) {
        stats.totalIssues += p.issues.length;
        for (const iss of p.issues) {
            if (iss.isError) stats.totalErrors += 1;
            if (iss.isWarning) stats.totalWarnings += 1;
        }
    }

    // Normalization: use provided totalPages or actual scanned pages (avoid zero)
    const totalPagesForNorm = typeof options.totalPages === 'number' && options.totalPages > 0
        ? options.totalPages
        : Math.max(1, stats.checkedPages);

    // Build weighted-per-page map (internal)
    const weightedPerPageMap = Object.fromEntries(
        Object.entries(categories).map(([kName, v]) => {
            const perPage = (v.totalWeightedIssues || 0) / totalPagesForNorm;
            return [kName, perPage];
        })
    );

    // Observed baseline per-page: use average (mean)
    const perPageValues = Object.values(weightedPerPageMap);
    const observedAvgPerPage = perPageValues.length === 0 ? 0 : (perPageValues.reduce((s, x) => s + x, 0) / perPageValues.length);
    const baseline = observedAvgPerPage;

    // Sigmoid helper
    const sigmoidScore = (ratio) => {
        // protect against NaN/infinite
        const r = Number.isFinite(ratio) ? ratio : 0;
        const val = 100 / (1 + Math.exp(k * (r - x0)));
        return Math.round(Math.max(0, Math.min(100, val)));
    };

    // Compute category scores using sigmoid (defaults k=1, x0=1)
    for (const [kName, perPage] of Object.entries(weightedPerPageMap)) {
        let finalScore;
        if (baseline === 0) {
            finalScore = 100;
        } else {
            const ratio = perPage / baseline;
            finalScore = sigmoidScore(ratio);
        }
        if (categoriesOut[kName]) {
            categoriesOut[kName].score = finalScore;
        } else {
            categoriesOut[kName] = { name: kName, totalIssues: 0, totalErrors: 0, totalWarnings: 0, score: finalScore, failedItems: [] };
        }
    }

    // Ensure any remaining categories get full score
    for (const kName of Object.keys(categoriesOut)) {
        if (typeof categoriesOut[kName].score !== 'number') categoriesOut[kName].score = 100;
    }

    // Global score = average of category scores
    const categoryScores = Object.values(categoriesOut).map(c => c.score || 0);
    stats.score = categoryScores.length === 0 ? 100 : Math.round(categoryScores.reduce((a, b) => a + b, 0) / categoryScores.length);

    return { categories: categoriesOut, pages, stats };
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
