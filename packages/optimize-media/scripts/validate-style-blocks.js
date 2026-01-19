import { ISSUE_KEY } from '@bynovl/optimize-lib/issue-keys.js';
import { styleTagRegex, bgUrlRegex } from './regex-media.js';
import { getStyleSnippet } from './media-utils.js';
import { checkLinkValidity } from '@bynovl/optimize-lib/check-link-validity.js';

// Style Blocks: <style>...</style>
// check for background(-image): url(...)
// Accept file and optional startUrl as last parameters
async function validateStyleTagBlocks(item, content, config, file, startUrl) {
    const styleTags = content.match(styleTagRegex) || [];
    for (const styleTag of styleTags) {
        const styleContent = Array.isArray(styleTag) ? styleTag[1] : styleTag;
        let bgMatch;
        bgUrlRegex.lastIndex = 0;
        while ((bgMatch = bgUrlRegex.exec(styleContent)) !== null) {
            const url = bgMatch[1] ? bgMatch[1].replace(/^['"]|['"]$/g, '') : '';
            if (!url || url.trim() === '') {
                const result = {
                    isError: true,
                    isWarning: false,
                    reason: 'empty background-image url in style block',
                    type: ISSUE_KEY.empty,
                    message: 'no valid URL found for background-image in style block',
                    target: getStyleSnippet(styleContent),
                };
                item.media.results.push(result);
                continue;
            }
            const linkError = await checkLinkValidity(content, url, config, file, startUrl);
            if (linkError && linkError.isError) {
                const isExternal = linkError.type === ISSUE_KEY.unreachableExtLink || linkError.type === ISSUE_KEY.invalidExtLink;
                const result = {
                    isError: true,
                    isWarning: false,
                    reason:
                        isExternal
                            ? 'Invalid external background-image URL in style block'
                            : 'Invalid local background-image URL in style block',
                    message:
                        isExternal
                            ? 'External background-image URL is invalid or unreachable: '
                            : 'Local background-image file is missing or invalid: ' + url,
                    type: linkError.type || 'unknown',
                    target: getStyleSnippet(styleContent),
                };
                item.media.results.push(result);
            }
        }
    }
}

export { validateStyleTagBlocks };
