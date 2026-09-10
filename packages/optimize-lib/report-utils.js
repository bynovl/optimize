// Rendering helpers for report generation
function formatCell(value) {
    if (value === null || value === undefined) return '';
    let s = String(value);
    // Collapse whitespace and remove newlines to keep table cells safe
    s = s.replace(/\s+/g, ' ').trim();
    // Escape backticks inside content
    s = s.replace(/`/g, "'");
    // Escape HTML angle brackets to avoid Markdown rendering issues
    s = s.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    // Escape pipe characters to keep markdown tables safe
    s = s.replace(/\|/g, '\\|');
    return s;
}

export function renderFindingsTable(findings) {
    if (!Array.isArray(findings) || findings.length === 0) return 'No findings.';
    const rows = findings.map(f => `| ${formatCell(f.page)} | ${formatCell(f.target)} | ${formatCell(f.type)} | ${formatCell(f.reason)} |`);
    return ['| Page | Target | Type | Reason |', '|------|--------|------|--------|', ...rows].join('\n');
}

// Fills in a normalized `type` when the underlying check didn't provide one, so
// findings tables don't render with blank Type cells.
function deriveType(reason) {
    const r = (reason || '').toLowerCase();
    if (/fragment-only link/.test(r)) return 'placeholderLink';
    if (/unsupported or non-navigable protocol/.test(r)) return 'unsafeProtocolLink';
    if (/hash ".*" not found/.test(r)) return 'brokenAnchor';
    if (/internal link target file not found/.test(r)) return 'brokenInternalLink';
    if (/dns lookup failed/.test(r)) return 'notfoundExtLink';
    if (/missing .* (src|data|type) attribute/.test(r)) return 'missing';
    if (/empty background-image/.test(r)) return 'empty';
    return '';
}

// Builds a parsed-like object from raw category results, including findings and recommendations

function truncateFailedItem(failedItem, maxIssuesPerItem = 20) {
    const issues = Array.isArray(failedItem?.issues)
        ? failedItem.issues.slice(0, maxIssuesPerItem)
        : [];

    return {
        ...failedItem,
        issues
    };
}

function truncateCategory(cat, maxFailedItems = 20, maxIssuesPerItem = 20) {
    return {
        name: cat.name,
        totalIssues: cat.totalIssues,
        totalErrors: cat.totalErrors,
        totalWarnings: cat.totalWarnings,
        failedItems: Array.isArray(cat.failedItems)
            ? cat.failedItems.slice(0, maxFailedItems).map(fi => truncateFailedItem(fi, maxIssuesPerItem))
            : []
    };
}

export function renderCategoryMd(chunkName, parsedObj) {
    const findingsTable = renderFindingsTable(parsedObj.findings);

    // (Legacy count line removed – using composite summaryLine instead)
    // Top‑pages markdown (bullet list with error/warning counts)
    let topPagesMd = '';
    if (Array.isArray(parsedObj.topPages) && parsedObj.topPages.length) {
        const lines = parsedObj.topPages.map(p => `- ${p.page} (${p.errors} errors | ${p.warnings} warnings)`);
        topPagesMd = ['\n**Top Pages**\n', ...lines].join('\n');
    }

    // Ensure a blank line before each top‑level heading
    const header = `\n### ${chunkName}`;

    // Composite summary line with full category page count (not top-page slice length)
    const pageCount = typeof parsedObj.totalPages === 'number'
        ? parsedObj.totalPages
        : (() => {
            if (Array.isArray(parsedObj.failedItems)) {
                return parsedObj.failedItems.length;
            }
            if (Array.isArray(parsedObj.findings)) {
                return new Set(parsedObj.findings.map(f => f.page).filter(Boolean)).size;
            }
            return 0;
        })();
    const totalIssues = parsedObj.totalIssues ?? parsedObj.findings.length;
    const totalErrors = parsedObj.totalErrors ?? 0;
    const totalWarnings = parsedObj.totalWarnings ?? 0;
    const summaryLine = `**Totals**: ${pageCount} pages, ${totalIssues} issues, ${totalErrors} errors, ${totalWarnings} warnings.` + '  ';

    // ----- optional Score line -----
    let scoreLine = parsedObj.score !== undefined ? `**Score**: ${parsedObj.score} / 100` + '  ' : '';

    // Helper paragraph for recommendations
    const recHelper = '\n**Recommendations**\n\nUse a human or AI to fill in recommendations based on the findings, top pages, and totals above.\n';
    // Recommendations table with example row
    const recTable = '| Priority | Action | Why | How |\n|----------|--------|-----|-----|\n| High | Example action | Example reason | Example how-to |\n---';

    return [
        header,
        summaryLine,
        scoreLine,
        topPagesMd,
        '',
        '\n**Findings**\n',
        findingsTable,
        '',
        recHelper,
        recTable
    ].filter(Boolean).join('\n');
}

// Local fallback summarizer that produces a parsed-like object
export function localSummarizeCategory(cat) {
    const failed = Array.isArray(cat.failedItems) ? cat.failedItems : [];
    const findings = [];
    const uniquePages = new Set();
    for (const fi of failed) {
        const page = fi.page || '';
        if (page) uniquePages.add(page);
        const issues = Array.isArray(fi.issues) ? fi.issues : [];
        if (issues.length === 0) {
            const reason = fi.reason || fi.message || '';
            findings.push({
                page,
                target: fi.target || '',
                type: fi.type || deriveType(reason),
                reason,
                isError: fi.isError === true,
                isWarning: fi.isWarning === true
            });
        } else {
            for (const iss of issues) {
                const reason = iss.reason || iss.message || '';
                findings.push({
                    page,
                    target: iss.target || iss.selector || '',
                    type: iss.type || iss.code || deriveType(reason),
                    reason,
                    isError: iss.isError === true,
                    isWarning: iss.isWarning === true
                });
            }
        }
    }

    // top pages
    // Compute per‑page counts (total, errors, warnings)
    const pageStats = {};
    for (const f of findings) {
        const p = f.page || '';
        if (!pageStats[p]) pageStats[p] = { total: 0, errors: 0, warnings: 0 };
        pageStats[p].total++;
        if (f.isError === true) {
            pageStats[p].errors++;
        } else if (f.isWarning === true) {
            pageStats[p].warnings++;
        } else if (f.type && /error|invalid|missing/i.test(f.type)) {
            pageStats[p].errors++;
        } else {
            pageStats[p].warnings++;
        }
    }

    const topPages = Object.keys(pageStats)
        .sort((a, b) => pageStats[b].total - pageStats[a].total)
        .slice(0, 3)
        .map(p => ({ page: p, ...pageStats[p] }));

    const totalIssues = typeof cat.totalIssues === 'number' ? cat.totalIssues : findings.length;
    const totalErrors = typeof cat.totalErrors === 'number' ? cat.totalErrors : findings.filter(f => f.type && /error|invalid|missing/i.test(f.type)).length;
    const totalWarnings = typeof cat.totalWarnings === 'number' ? cat.totalWarnings : findings.length - totalErrors;

    const summary = `${totalIssues} issues; ${totalErrors} errors, ${totalWarnings} warnings.`;

    // Use the explicit score from results.json if present; otherwise compute a fallback.
    let score;
    if (typeof cat.score === 'number') {
        score = cat.score;
    } else {
        // Simple score: higher when fewer errors relative to total issues (0‑100)
        // If there are no issues, give a perfect score.
        const rawScore = totalIssues === 0 ? 100 : Math.max(0, Math.round(100 - (totalErrors / totalIssues) * 100));
        score = rawScore; // keep as integer 0‑100
    }

    return {
        category: cat.name || 'Unknown',
        summary,
        findings,
        failedItems: failed,
        totalPages: uniquePages.size,
        totalIssues,
        totalErrors,
        totalWarnings,
        topPages,
        score // expose to renderer
    };
}

export function buildSummary(stats, categories, enabledChecks = []) {
    const {
        totalPages = 0,
        totalIssues = 0,
        totalErrors = 0,
        totalWarnings = 0,
        score: overallScore = 0,
    } = stats || {};

    // --------------------------------------------------------------
    // Gather all categories that the user asked to run.
    // --------------------------------------------------------------
    const catEntries = Object.entries(categories || {});   // [key, catObj]
    const catCount = enabledChecks.length;               // how many checks were enabled

    // --------------------------------------------------------------
    // Determine which of those categories actually produced findings / failed items.
    // --------------------------------------------------------------
    const catWithIssues = catEntries.filter(([, cat]) => {
        const failedItems = Array.isArray(cat?.failedItems) ? cat.failedItems : [];
        const findings = Array.isArray(cat?.findings) ? cat.findings : [];
        return failedItems.length > 0 || findings.length > 0;
    });

    // --------------------------------------------------------------
    // Build a quick lookup: check‑key → label (e.g. "meta" → "Meta")
    // --------------------------------------------------------------
    const keyToLabel = new Map(
        enabledChecks.map(chk => [chk.key, chk.label])
    );
    const failedCatNames = catWithIssues.map(([key]) => keyToLabel.get(key) || key);

    // --------------------------------------------------------------
    // Passing categories: those that were enabled but had no issues.
    // --------------------------------------------------------------
    const catThatPassed = enabledChecks.filter(chk => {
        const cat = categories[chk.key];
        if (!cat) return false;
        const failedItems = Array.isArray(cat?.failedItems) ? cat.failedItems : [];
        const findings = Array.isArray(cat?.findings) ? cat.findings : [];
        return failedItems.length === 0 && findings.length === 0;
    });
    const passingCatNames = catThatPassed.map(c => c.label).join(', ');

    // --------------------------------------------------------------
    // Build the comma‑separated list of enabled‑check **labels**
    //     for the parentheses in the summary.
    // --------------------------------------------------------------
    const catNames = enabledChecks.map(chk => chk.label);   // ["Meta","Links",…]
    const formattedNames = (() => {
        if (catNames.length === 0) return '';
        if (catNames.length === 1) return catNames[0];
        const last = catNames.pop();
        return `${catNames.join(', ')} and ${last}`;
    })();

    // --------------------------------------------------------------
    // Build arrays needed for the “best / worst” calculation.
    //     `catScores` holds { name: <label>, score: <number> }
    // --------------------------------------------------------------
    const catScores = catWithIssues.map(([key, cat]) => ({
        name: keyToLabel.get(key) || key,
        score: typeof cat.score === 'number' ? cat.score : 0,
    }));

    // --------------------------------------------------------------
    // Determine best and worst categories among the failing ones.
    // --------------------------------------------------------------
    const bestCat = catScores.reduce(
        (best, cur) => (cur.score > best.score ? cur : best),
        { name: '', score: -Infinity }
    );
    const worstCat = catScores.reduce(
        (worst, cur) => (cur.score < worst.score ? cur : worst),
        { name: '', score: Infinity }
    );

    // --------------------------------------------------------------
    // Assemble the final markdown paragraph (double‑space for a
    //     Markdown line‑break).
    // --------------------------------------------------------------
    return (
        `The audit covered **${catCount} categories** (${formattedNames}). ` +
        `Of which **${catWithIssues.length} failed** (${failedCatNames.join(', ')})${catThatPassed.length > 0 ? ` and **${catThatPassed.length} passed** (${passingCatNames}).\n\n` : '.'}` +
        `In total the site contains **${totalIssues} issues** across **${totalPages} pages**, ` +
        `including **${totalErrors} errors** and **${totalWarnings} warnings**. ` +
        `The overall health score is **${overallScore} / 100**. ` +
        `The most problematic area is **${worstCat.name}** with a score of **${worstCat.score} / 100**, ` +
        `while the best‑performing area is **${bestCat.name}** with a score of **${bestCat.score} / 100**.\n\n` +
        `*The following provides a detailed breakdown for each failing category in the sections below.*`
    );
}