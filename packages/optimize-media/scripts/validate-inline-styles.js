import { bgUrlRegex, inlineStyleRegex } from './regex-media.js';
import { getStyleSnippet, decodeHtmlEntities } from './media-utils.js';
import { checkLinkValidity } from '@bynovl/optimize-lib/check-link-validity.js';
import { ISSUE_KEY } from '@bynovl/optimize-lib/issue-keys.js';

// Inline style="..." attributes
// check for background(-image): url(...)
// Accept file and optional startUrl as last parameters
async function validateInlineStyles(item, content, config, file, startUrl) {
    const inlineStyles = content.match(inlineStyleRegex) || [];
    for (const styleContent of inlineStyles) {
        let bgMatch;
        while ((bgMatch = bgUrlRegex.exec(styleContent)) !== null) {
            let url = bgMatch[1] ? bgMatch[1].trim() : '';
            url = decodeHtmlEntities(url);

            if (!url || url.trim() === '') {
                const result = {
                    isError: true,
                    isWarning: false,
                    type: ISSUE_KEY.empty,
                    reason: 'empty background-image URL in inline style',
                    message:
                        'No valid URL found for background-image in inline style attribute.',
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
                    type: linkError.type,
                    reason:
                        isExternal
                            ? 'Invalid external background-image URL in inline style'
                            : 'Invalid local background-image URL in inline style',
                    message:
                        isExternal
                            ? 'External background-image URL is invalid or unreachable: '
                            : 'Local background-image file is missing or invalid: ' + url,
                    target: url,
                };
                item.media.results.push(result);
            }
        }
    }
}

export { validateInlineStyles };
