#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { renderCategoryMd, localSummarizeCategory, buildSummary } from './report-utils.js';
import { injectIntoTemplate, AUDIT_TEMPLATE } from './report-templates.js';
import { debug } from '@bynovl/optimize-utils/debug-log.js';

// Deterministic pass: build category summaries/tables and the executive summary from raw results.
function buildCategoryData(results = {}, options = {}) {
    const categories = results && typeof results.categories === 'object'
        ? Object.values(results.categories)
        : Array.isArray(results) ? results : [];

    const categoriesWithResults = categories.filter(cat => {
        const failedItems = Array.isArray(cat && cat.failedItems) ? cat.failedItems : [];
        const findings = Array.isArray(cat && cat.findings) ? cat.findings : [];
        return failedItems.length > 0 || findings.length > 0;
    });

    const keyToLabel = new Map(
        (Array.isArray(options.enabledChecks) ? options.enabledChecks : [])
            .map(chk => [chk.key, chk.label])
    );

    const parsedCategories = [];
    for (const cat of categoriesWithResults) {
        const parsed = localSummarizeCategory(cat);
        if (!parsed || !Array.isArray(parsed.findings) || parsed.findings.length === 0) continue;

        // Use the pretty label if we have it; otherwise fall back to the raw key.
        const catLabel = keyToLabel.get(cat.name) || cat.name || (parsed && parsed.category) || 'Category';

        parsedCategories.push({ name: catLabel, parsed });
    }

    const totalIssues = categories.reduce((s, c) => s + (c.totalIssues || 0), 0);
    const totalErrors = categories.reduce((s, c) => s + (c.totalErrors || 0), 0);
    const executiveSummary = buildSummary(results.stats || {}, results.categories || {}, options.enabledChecks || []);

    return { categories, parsedCategories, executiveSummary };
}

function writeReport(config, options, executiveSummary, chunkSummaries) {
    const auditTemplate = (typeof AUDIT_TEMPLATE === 'string' && AUDIT_TEMPLATE.trim().length > 0)
        ? AUDIT_TEMPLATE
        : '# Website Audit Report\n\n[Executive Summary]\n\n[Category]\n\n[Next Steps]';

    const startTimeString = new Date().toLocaleString();
    const preparer = (config.report && config.report.preparer) || 'Optimize';
    const fillVars = {
        'insert date': `${startTimeString}`,
        'preparer': `${preparer}`,
        'Executive Summary': executiveSummary,
        'Audit Findings by Category': chunkSummaries.join('\n'),
        'Category': chunkSummaries.join('\n'),
        'Next Steps': (config.report && config.report.nextSteps) || '- Review the category summaries and prioritize fixes for errors.'
    };

    const reportContent = injectIntoTemplate(auditTemplate, fillVars, chunkSummaries);
    const configuredOutput = typeof options.output === 'string'
        ? options.output
        : (typeof config.report?.fileOutput === 'string' ? config.report.fileOutput : 'audit.md');
    const outPath = typeof configuredOutput === 'string' && path.isAbsolute(configuredOutput)
        ? configuredOutput
        : path.resolve(process.cwd(), String(configuredOutput));

    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, reportContent, 'utf8');
    return outPath;
}

// Deterministic export
export default async function exportSimpleReport(config = {}, results = {}, options = {}) {
    const { executiveSummary, parsedCategories } = buildCategoryData(results, options);
    const chunkSummaries = parsedCategories.map(({ name, parsed }) => renderCategoryMd(name, parsed));
    return writeReport(config, options, executiveSummary, chunkSummaries);
}

// Keep exportReport as a thin deterministic alias for compatibility
export async function exportReport(config = {}, results = {}, options = {}) {
    return exportSimpleReport(config, results, options);
}