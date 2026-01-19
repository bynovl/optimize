import { checkLinkValidity } from '@bynovl/optimize-lib/check-link-validity.js';
import { ISSUE_KEY } from '@bynovl/optimize-lib/issue-keys.js';

// REGEX
// Only match <link> tags with rel="stylesheet" and href, regardless of attribute order
const stylesheetRegex = /<link\b(?=[^>]*rel=["']stylesheet["'])(?=[^>]*href=["']([^"']+)["'])[^>]*>/gi;
const scriptRegex = /<script\s+[^>]*src=["']([^"']+)["']/gi;

// Scripts <script src="...">
async function validateScriptSrc(item, content, config, file, startUrl) {
    let match;
    while ((match = scriptRegex.exec(content)) !== null) {
        const src = match[1];
        const linkError = await checkLinkValidity(content, src, config, file, startUrl);
        if (linkError && linkError.isError) {
            const isExternal = linkError.type === ISSUE_KEY.unreachableExtLink || linkError.type === ISSUE_KEY.invalidExtLink;
            item.sources.results.push({
                target: 'script',
                type: linkError.type,
                reason: isExternal
                    ? 'Invalid external script src'
                    : 'Invalid internal script src',
                isError: true,
                isWarning: false,
                message: isExternal
                    ? `External script src is invalid or unreachable: ${src}`
                    : `Internal script src is missing or invalid: ${src}`,
            });
        }
        // ...existing code...
    }
}
async function validateStylesheetHref(item, content, config, file, startUrl) {
    stylesheetRegex.lastIndex = 0;
    const matches = [...content.matchAll(stylesheetRegex)];
    for (const match of matches) {
        const href = match[1];
        if (!href || href.trim() === '') {
            item.sources.results.push({
                target: 'stylesheet',
                reason: 'Missing stylesheet href',
                type: ISSUE_KEY.empty,
                isError: true,
                isWarning: false,
                message: 'Stylesheet link is missing or empty.',
            });
            continue;
        }
        const linkError = await checkLinkValidity(content, href, config, file, startUrl);
        if (linkError && linkError.isError) {
            const isExternal = linkError.type === ISSUE_KEY.unreachableExtLink || linkError.type === ISSUE_KEY.invalidExtLink;
            item.sources.results.push({
                target: 'stylesheet',
                type: linkError.type,
                reason: isExternal
                    ? 'Invalid external stylesheet link'
                    : 'Invalid internal stylesheet link',
                isError: true,
                isWarning: false,
                message: isExternal
                    ? `External stylesheet link is invalid or unreachable: ${href}`
                    : `Internal stylesheet link is missing or invalid: ${href}`,
            });
        }
        // ...existing code...
    }
}

export { validateScriptSrc, validateStylesheetHref };
