import { cssUrlRegex } from './regex-media.js';
import { ISSUE_KEY } from '@bynovl/optimize-lib/issue-keys.js';
import { checkLinkValidity } from '@bynovl/optimize-lib/check-link-validity.js';

// CSS Files
export async function validateCSS(item, content, config, cssFileDir, startUrl) {
    let match;
    while ((match = cssUrlRegex.exec(content)) !== null) {
        let url = match[2].trim().replace(/^['"]|['"]$/g, '');
        if (!url || url.trim() === '') {
            const result = {
                target: 'CSS',
                reason: 'empty background-image url in css',
                type: ISSUE_KEY.empty,
                isError: true,
                isWarning: false,
                message: `No valid URL found for background-image in CSS: ${url}`,
            };
            item.media.results.push(result);
            continue;
        }
        const linkError = await checkLinkValidity(content, url, config, cssFileDir, startUrl);
        if (linkError && linkError.isError) {
            const isExternal = linkError.type === ISSUE_KEY.unreachableExtLink || linkError.type === ISSUE_KEY.invalidExtLink;
            const result = {
                target: 'CSS',
                type: linkError.type,
                reason: isExternal
                    ? 'invalid external CSS background-image link in CSS'
                    : 'missing local CSS background-image file in CSS',
                isError: true,
                isWarning: false,
                message: isExternal
                    ? `External CSS background-image URL is invalid or unreachable: ${url}`
                    : `Local CSS background-image file is missing or invalid: ${url}`,
            };
            item.media.results.push(result);
        }
    }
}
