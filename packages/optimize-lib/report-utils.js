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

export function renderRecTable(recs) {
    if (!Array.isArray(recs) || recs.length === 0) return 'No recommendations.';
    const rows = recs.map(r => `| ${formatCell(r.priority)} | ${formatCell(r.action)} | ${formatCell(r.why)} | ${formatCell(r.how)} |`);
    return ['| Priority | Action | Why | How |', '|----------|--------|-----|-----|', ...rows].join('\n');
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

// Builds recommendations scoped to the category's own findings only, so a pattern
// like "duplicate" in one category (e.g. hierarchy) can't trigger an unrelated
// category's recommendation (e.g. meta tag advice appearing under Open Graph).
function buildRecommendations(categoryName, findings) {
    const name = (categoryName || '').toLowerCase().replace(/[\s-]/g, '');
    const reasons = findings.map(f => (f.reason || '').toLowerCase()).join(' | ');
    const types = findings.map(f => (f.type || '').toLowerCase()).join(' | ');
    const recs = [];

    if (name === 'meta') {
        if (/missing/.test(types)) recs.push({ priority: 'High', action: 'Add missing title, description, canonical, and keywords tags', why: 'Pages without these tags have no snippet content or canonical signal for search engines', how: 'Add the missing tag with unique, page-specific content to each affected page' });
        if (/duplicate/.test(types)) recs.push({ priority: 'High', action: 'De-duplicate title, description, canonical, and keywords tags', why: 'Duplicate tags create ambiguous signals about which content is authoritative', how: 'Remove the redundant tag instances so each page emits exactly one of each tag' });
        if (/invalidextlink/.test(types)) recs.push({ priority: 'Medium', action: 'Fix the broken canonical link', why: 'A canonical URL returning an error status prevents proper canonicalization', how: 'Point the canonical tag at a live, correct URL or remove it' });
        if (/empty/.test(types)) recs.push({ priority: 'Medium', action: 'Populate empty title, description, and keywords tags', why: 'Empty tags produce blank or auto-generated search snippets', how: 'Fill in descriptive, page-specific values for each tag' });
        if (/noindex or nofollow/.test(reasons)) recs.push({ priority: 'Low', action: 'Confirm noindex/nofollow directives are intentional', why: 'Unintentional noindex/nofollow removes the page from search entirely', how: 'Verify with the content owner and remove the directive if the page should be indexed' });
    } else if (name === 'opengraph') {
        if (/missing/.test(types)) recs.push({ priority: 'High', action: 'Add missing Open Graph and Twitter Card tags', why: 'Pages without og:/twitter: tags fall back to unpredictable previews when shared on social platforms', how: 'Add og:title, og:description, og:image, og:url and matching twitter: tags to each affected page' });
        if (/duplicate/.test(types)) recs.push({ priority: 'High', action: 'De-duplicate Open Graph and Twitter Card tags', why: 'Duplicate og:/twitter: tags create inconsistent social preview cards', how: 'Remove the redundant tag instances so each page emits one of each' });
        if (/empty/.test(types)) recs.push({ priority: 'Medium', action: 'Populate empty Open Graph and Twitter Card tags', why: 'Empty og:/twitter: tags produce blank preview cards when the page is shared', how: 'Fill in real title, description, image, and URL values for each tag' });
    } else if (name === 'hierarchy') {
        if (/multipleh1tags/.test(types)) recs.push({ priority: 'High', action: 'Reduce each page to a single H1', why: "Multiple H1 tags dilute the page's primary topic signal for search engines and screen readers", how: 'Keep one H1 per page and demote extra H1s to H2 or lower' });
        if (/skippedlevel/.test(reasons)) recs.push({ priority: 'Medium', action: 'Fix skipped heading levels', why: 'Skipped levels break the semantic outline used by assistive technology and search engines', how: 'Renumber headings so levels increment sequentially without gaps' });
        if (/first heading is not h1/.test(reasons)) recs.push({ priority: 'Low', action: 'Move the H1 to the top of the content', why: "A non-H1 first heading weakens the page's topical signal", how: 'Reorder headings so the H1 is the first heading in the document' });
    } else if (name === 'links') {
        if (/brokeninternallink/.test(types)) recs.push({ priority: 'High', action: 'Fix broken internal links', why: 'Internal links pointing at missing pages break navigation and waste crawl budget', how: 'Update or remove links that point at pages that no longer exist' });
        if (/notfoundextlink|invalidextlink/.test(types)) recs.push({ priority: 'High', action: 'Fix or remove broken external links', why: 'External links that fail to resolve harm user trust and SEO', how: 'Validate external URLs and correct or remove the ones that fail' });
        if (/brokenanchor/.test(types)) recs.push({ priority: 'Medium', action: 'Fix broken anchor links', why: "Links to in-page anchors that don't exist leave users stranded", how: 'Correct the anchor target or add the missing id to the destination element' });
        if (/unsafeprotocollink/.test(types)) recs.push({ priority: 'High', action: 'Remove unsafe javascript: links', why: 'javascript: URLs are a common cross-site scripting (XSS) vector and are not crawlable', how: 'Replace javascript: hrefs with real navigable URLs or proper event handlers' });
        if (/placeholderlink/.test(types)) recs.push({ priority: 'Low', action: 'Replace placeholder "#" links', why: 'Fragment-only links are often leftover placeholders that go nowhere', how: 'Point each link at its real destination or remove it if not yet available' });
    } else if (name === 'media') {
        if (/missing .* (src|data|type) attribute/.test(reasons)) recs.push({ priority: 'High', action: 'Add missing src/data/type attributes to media elements', why: 'Images, video, audio, embed, and object tags without a source render nothing for users', how: 'Add a valid src (or data/type for <object>) to each affected element' });
        if (/brokeninternallink/.test(types)) recs.push({ priority: 'High', action: 'Fix broken local media file paths', why: 'Media referencing missing local files fails to load for visitors', how: 'Correct the file path or restore the missing asset' });
        if (/invalidextlink/.test(types)) recs.push({ priority: 'Medium', action: 'Fix broken external media links', why: 'External media URLs returning errors break the page experience', how: 'Validate external media URLs and correct or remove failing ones' });
        if (/empty background-image/.test(reasons)) recs.push({ priority: 'Low', action: 'Fix empty background-image URLs', why: 'Empty background-image values leave inline-styled elements without their intended visual', how: 'Add a valid image URL or remove the unused style rule' });
    } else if (name === 'schema') {
        if (/missing@context|missingschemablock/.test(reasons) || /missing/.test(types)) recs.push({ priority: 'High', action: 'Add JSON-LD structured data with a valid @context', why: 'Pages without valid schema markup miss out on rich results in search', how: 'Add a JSON-LD block with the correct @context and required fields for the page type' });
        if (/invalidschemablock/.test(reasons) || /invalid/.test(types)) recs.push({ priority: 'Medium', action: 'Fix invalid schema blocks', why: 'Malformed structured data is ignored by search engines', how: 'Validate JSON-LD against the schema.org type definition and correct required fields' });
    } else if (name === 'sources') {
        if (/brokeninternallink/.test(types)) recs.push({ priority: 'High', action: 'Fix broken local script/stylesheet paths', why: 'Missing local JS/CSS files break page functionality and styling', how: 'Correct the file path or restore the missing asset' });
        if (/notfoundextlink/.test(types)) recs.push({ priority: 'Medium', action: 'Fix or remove broken external script/stylesheet references', why: 'External resources that fail to resolve can break page rendering', how: 'Validate external URLs and correct or remove the ones that fail' });
    } else if (name === 'accessibility') {
        if (/empty alt|missing alt/.test(reasons)) recs.push({ priority: 'High', action: 'Add descriptive alt text to images', why: 'Missing or empty alt text blocks screen reader users from understanding image content', how: 'Add concise, descriptive alt text to each affected image' });
        if (/missing label/.test(reasons)) recs.push({ priority: 'High', action: 'Add labels to form inputs', why: 'Inputs without labels are unusable with screen readers', how: 'Associate a <label> with each input via for/id or by wrapping the input in the label' });
        if (/tabindex/.test(reasons)) recs.push({ priority: 'Medium', action: 'Fix non-standard tabindex usage', why: 'Custom tab order and tabindex on non-interactive elements confuse keyboard navigation', how: 'Remove tabindex from non-interactive elements and avoid positive tabindex values' });
    }

    if (recs.length === 0) recs.push({ priority: 'Low', action: 'Review findings', why: 'No category-specific pattern matched this run', how: 'Investigate each finding and assign an owner' });
    return recs;
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

    // Composite summary line with page, issue, error, warning counts
    const pageCount = Array.isArray(parsedObj.topPages) ? parsedObj.topPages.length : 0;
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
    const pageCounts = Object.create(null);
    for (const fi of failed) {
        const page = fi.page || '';
        pageCounts[page] = (pageCounts[page] || 0) + 1;
        const issues = Array.isArray(fi.issues) ? fi.issues : [];
        if (issues.length === 0) {
            const reason = fi.reason || fi.message || '';
            findings.push({ page, target: fi.target || '', type: fi.type || deriveType(reason), reason });
        } else {
            for (const iss of issues) {
                const reason = iss.reason || iss.message || '';
                findings.push({
                    page,
                    target: iss.target || iss.selector || '',
                    type: iss.type || iss.code || deriveType(reason),
                    reason
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
        if (f.type && /error|invalid|missing/i.test(f.type)) {
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

    const recommendations = buildRecommendations(cat.name, findings);

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
        recommendations,
        totalIssues,
        totalErrors,
        totalWarnings,
        topPages,
        score // expose to renderer
    };
}

/**
 * Build a human‑friendly executive‑summary paragraph that adapts to the
 * actual results of the audit.
 *
 * @param {Object} stats       – overall stats object from results.json
 * @param {Object} categories  – the full `results.categories` map
 * @returns {string}           – markdown paragraph ready for injection
 */
export function buildSummary(stats, categories) {
  const {
    totalPages = 0,
    totalIssues = 0,
    totalErrors = 0,
    totalWarnings = 0,
    score: overallScore = 0,
  } = stats || {};

  // Gather category names and scores
  const catEntries = Object.entries(categories || {});
  const catCount = catEntries.length;
  const catNames = catEntries.map(([key]) => key);
  const catScores = catEntries.map(([, cat]) => ({
    name: cat.name || key,
    score: typeof cat.score === 'number' ? cat.score : 0,
  }));

  // Determine best and worst categories
  const bestCat = catScores.reduce((best, cur) => (cur.score > best.score ? cur : best), { name: '', score: -Infinity });
  const worstCat = catScores.reduce((worst, cur) => (cur.score < worst.score ? cur : worst), { name: '', score: Infinity });

  // Format the list of category names
  const formattedNames = (() => {
    if (catNames.length === 0) return '';
    const capitalised = catNames.map(n => n.charAt(0).toUpperCase() + n.slice(1));
    if (capitalised.length === 1) return capitalised[0];
    const last = capitalised.pop();
    return `${capitalised.join(', ')} and ${last}`;
  })();

  // Assemble paragraph (double‑space for Markdown line break)
  return (
    `The audit covered **${catCount} of ${catCount} categories** (${formattedNames}). ` +
    `All categories produced findings, so **${catCount} of ${catCount} categories had results**. ` +
    `In total the site contains **${totalIssues} issues** across **${totalPages} pages**, ` +
    `including **${totalErrors} errors** and **${totalWarnings} warnings**. ` +
    `The overall health score is **${overallScore} / 100**.  \n` +
    `The most problematic area is **${worstCat.name}** with a score of **${worstCat.score} / 100**, ` +
    `while the best‑performing area is **${bestCat.name}** with a score of **${bestCat.score} / 100**. ` +
    `The detailed breakdown for each category follows in the sections below.`
  );
}

// Estimate report generation time based on truncated category sizes and model params
export function estimateReportTime(categories = [], llm = {}, options = {}) {
    const numCategories = Array.isArray(categories) ? categories.length : Object.keys(categories || {}).length;
    const interChunkDelaySec = (llm && typeof llm.delay === 'number') ? llm.delay : (options.delay || 5);
    const modelEstimate = (llm && llm.estimate) || {};
    const modelBaseMs = typeof modelEstimate.baseMs === 'number' ? modelEstimate.baseMs : 1000;
    const modelPerKbMs = typeof modelEstimate.perKbMs === 'number' ? modelEstimate.perKbMs : 300;
    const modelResponseMs = typeof modelEstimate.responseMs === 'number' ? modelEstimate.responseMs : 0;

    // Retries: chunker uses llm.maxRetries and llm.delay (seconds) as retry wait
    const maxRetries = (llm && typeof llm.maxRetries === 'number') ? llm.maxRetries : (modelEstimate.maxRetries || 0);
    const retryDelaySec = (llm && typeof llm.delay === 'number') ? llm.delay : (modelEstimate.retryDelaySec || 15);

    let totalMs = 0;
    const perCategoryMs = [];
    for (let i = 0; i < numCategories; i++) {
        const cat = categories[i];
        const truncated = truncateCategory(cat, 20, 20);
        const bytes = Buffer.byteLength(JSON.stringify(truncated), 'utf8');
        const kb = Math.max(1, Math.ceil(bytes / 1024));
        // model base + per-KB cost + expected response time
        let modelMs = modelBaseMs + Math.ceil(kb) * modelPerKbMs + modelResponseMs;
        // allow provider-specific multiplier to inflate model time
        const multiplier = (modelEstimate.multiplier && typeof modelEstimate.multiplier === 'number') ? modelEstimate.multiplier : 1;
        modelMs = Math.ceil(modelMs * multiplier);
        // include worst-case retry time: each retry waits retryDelaySec and then incurs another model call
        const retryMs = maxRetries * (retryDelaySec * 1000 + modelMs);
        const totalPerCategoryMs = modelMs + retryMs;
        totalMs += totalPerCategoryMs;
        perCategoryMs.push({ index: i, kb, modelMs, retryMs, totalPerCategoryMs });
    }

    const interChunkDelayMs = interChunkDelaySec * 1000;
    const interChunkTotalMs = numCategories > 1 ? (numCategories - 1) * interChunkDelayMs : 0;
    totalMs += interChunkTotalMs;

    const execMs = (modelEstimate.execMs && typeof modelEstimate.execMs === 'number') ? modelEstimate.execMs : 2000;
    totalMs += execMs;

    const estimatedSeconds = Math.max(3, Math.ceil(totalMs / 1000));
    return { estimatedSeconds, estimatedTime: `${estimatedSeconds} seconds`, totalMs, perCategoryMs, interChunkDelaySec, interChunkTotalMs };
}