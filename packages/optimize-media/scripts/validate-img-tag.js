
// Example usage in your img validation logic:
// let urlToValidate = extractFirstUrlFromSrcset(imgTag.getAttribute('srcset') || imgTag.getAttribute('src'));
// await checkLinkValidity(..., urlToValidate, ...);
import { imgRegex } from './regex-media.js';
import { checkLinkValidity } from '@bynovl/optimize-lib/check-link-validity.js';
import { ISSUE_KEY } from '@bynovl/optimize-lib/issue-keys.js';

// <img> tags
// check for alt text and valid src attribute
// Accept file and optional startUrl as last parameters
async function validateImgTag(item, content, config, file, startUrl) {
    const imgs = content.match(imgRegex) || [];
    // Regex to match only src attribute (not data-src, srcset, etc.)
    const srcAttrRegex = /\bsrc\s*=\s*(["'])(.*?)\1/i;
    for (const imgTag of imgs) {
        const srcMatch = imgTag.match(srcAttrRegex);
        const srcValue = srcMatch && typeof srcMatch[2] === 'string' ? srcMatch[2].trim() : '';
        if (!srcValue) {
            const result = {
                target: '<img>',
                reason: 'missing image src attribute',
                type: ISSUE_KEY.missing,
                isError: true,
                isWarning: false,
                message: 'image tag is missing src attribute.',
            };
            item.media.results.push(result);
            continue;
        }
        // Ignore data:image/svg (and other data URIs if desired)
        if (srcValue.startsWith('data:')) {
            continue;
        }
        // Only validate the single src attribute value
        const linkError = await checkLinkValidity(content, srcValue, config, file, startUrl);
        if (linkError && linkError.isError) {
            const isExternal = linkError.type === ISSUE_KEY.unreachableExtLink || linkError.type === ISSUE_KEY.invalidExtLink;
            const result = {
                isError: true,
                isWarning: false,
                reason:
                    isExternal
                        ? 'Invalid external image src'
                        : 'Invalid local image src',
                type: linkError.type,
                message:
                    isExternal
                        ? 'External image src is invalid or unreachable: '
                        : 'Local image file is missing or invalid: ' + srcValue,
                target: srcValue,
            };
            item.media.results.push(result);
        }
    }
}
export { validateImgTag };
