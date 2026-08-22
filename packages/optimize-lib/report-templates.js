// Helpers for injecting generated content into audit templates
export const AUDIT_TEMPLATE = `
# Website Audit Report

**Date:** [insert date]  
**Prepared by:** [preparer]  

## Summary
[Executive Summary]

## Categories
This section contains structured findings and recommendations for each audit category. Wrap any mention of html element in a backtick \`< div > \`. Each category block should contain:

- A \`Findings\` table with columns: \`Page | Target | Type | Reason\`.
- A \`Recommendations\` table with columns: \`Priority | Action | Why | How\`.

If your template renderer supports token replacement, the generator will also replace the token \`[Category]\` with the full category sections.

### [Category]

## Next Steps

[Next Steps]

---
*This report is optimized for PDF export and stakeholder review.*
`;

export function injectIntoTemplate(auditTemplate, vars = {}, chunkSummaries = []) {
    let reportContent = auditTemplate || '';

    const hasExecHeading = /#{1,6}\s*Executive Summary/i.test(auditTemplate);
    const hasResultsHeading = /#{1,6}\s*Categories/i.test(auditTemplate);
    const hasCategoryHeading = /#\s*Audit Findings by Category/i.test(auditTemplate);
    let replaced = false;

    if (hasExecHeading) {
        reportContent = reportContent.replace(/(#{1,6}\s*Executive Summary\s*)([\s\S]*?)(?=\n#{1,6}\s*Categories|\n#{1,6}\s*Audit Findings by Category|\n#{1,6}\s*Next Steps|$)/i, (m, h) => {
            replaced = true;
            return `${h}\n${vars['Executive Summary'] || ''}`;
        });
    }

    if (hasResultsHeading) {
        reportContent = reportContent.replace(/(#{1,6}\s*Categories\s*)([\s\S]*?)(?=\n#{1,6}\s*Next Steps|$)/i, (m, h) => {
            replaced = true;
            return `${h}\n${chunkSummaries.join('\n\n')}\n`;
        });
    }

    if (hasCategoryHeading) {
        reportContent = reportContent.replace(/(#\s*Audit Findings by Category\s*)([\s\S]*?)(?=\n#\s*Next Steps|$)/i, (m, h) => {
            replaced = true;
            return `${h}\n${chunkSummaries.join('\n\n')}\n`;
        });
    }

    if (/\[Category\]/.test(reportContent)) {
        reportContent = reportContent.replace(/\[Category\]/g, chunkSummaries.join('\n\n'));
        replaced = true;
    }

    if (/\[Next Steps\]/.test(reportContent)) {
        reportContent = reportContent.replace(/\[Next Steps\]/g, vars['Next Steps'] || '');
        replaced = true;
    }

    // token-style replacements (case-insensitive)
    Object.keys(vars).forEach(k => {
        const token = new RegExp(`\\[${k}\\]`, 'gi');
        if (token.test(reportContent)) {
            reportContent = reportContent.replace(token, vars[k]);
            replaced = true;
        }
    });

    // Fallback: replace any remaining [token] occurrences by doing a
    // case-insensitive key lookup into vars. This handles tokens with
    // different casing or minor whitespace differences.
    const beforeTokenReplace = reportContent;
    reportContent = reportContent.replace(/\[([^\]]+)\]/g, (m, key) => {
        const foundKey = Object.keys(vars).find(k => k.toLowerCase() === key.toLowerCase());
        return foundKey ? vars[foundKey] : m;
    });
    if (reportContent !== beforeTokenReplace) replaced = true;

    // fallback to simple assembly when nothing matched
    if (!replaced) {
        const headerCandidate = (auditTemplate || '').split('\n\n---')[0] || '# Website Audit Report';
        reportContent = [
            headerCandidate.trim(),
            '',
            '## Summary',
            '',
            vars['Summary'] || '',
            '',
            '## Categories',
            '',
            chunkSummaries.join('\n\n'),
            '',
            '## Next Steps',
            '',
            vars['Next Steps'] || ''
        ].join('\n');
    }

    return reportContent;
}
