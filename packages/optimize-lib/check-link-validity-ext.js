import { checkExternalLink } from '@bynovl/optimize-utils/check-external-link.js';
import { ISSUE_KEY } from './issue-keys.js';
import { externalUrlRegexStrict } from '@bynovl/optimize-utils/regex-links.js';
/**
 * External link validator.
 * - Sends a fetch request to the external URL.
 * - Validates HTTP status (200 OK).
 * - Ignores hash fragments and local-only URLs.
 * - Uses keepAlive for connection reuse if needed.
 * @param {string} url - The absolute external URL.
 * @returns {Promise<object>} - Validation result.
 */

// Simple in-memory cache for external link validation results (module scope)
export const externalLinkCache = new Map();

export async function checkLinkValidityExt(inputUrl, config = {}, sourceFile) {
    // Use cache for repeated requests
    const cacheKey = inputUrl;
    if (externalLinkCache.has(cacheKey)) {
        return externalLinkCache.get(cacheKey);
    }
    // Always resolve protocol-relative URLs to https
    let url = inputUrl;
    if (inputUrl.startsWith('//')) {
        url = 'https:' + inputUrl;
    }
    // Remove hash fragment for validation
    const baseUrl = url.split('#')[0];
    try {
        const result = await checkExternalLink(baseUrl, config);
        if (result) {
            // Attach sourceFile for context
            result.sourceFile = sourceFile;
            if (!result.isError && !result.isWarning) {
                externalLinkCache.set(cacheKey, null);
                return null;
            } else {
                // Use the specific message and reason from check-external-link.js
                externalLinkCache.set(cacheKey, result);
                return result;
            }
        }
        // Defensive: treat as unreachable if no result
        const fallback = {
            isError: true,
            isWarning: false,
            type: 'unreachableExtLink',
            message: `External link could not be reached or may be blocked: ${url}`,
            reason: `External link could not be reached or may be blocked: ${url}`,
            status: null,
            errorType: 'unreachable',
            target: url,
            sourceFile
        };
        externalLinkCache.set(cacheKey, fallback);
        return fallback;
    } catch (err) {
        const result = {
            isError: true,
            isWarning: false,
            type: 'unreachableExtLink',
            message: `External link fetch failed for link: ${url}`,
            reason: err && err.message ? err.message : String(err),
            status: null,
            errorType: 'unreachable',
            target: url,
            sourceFile
        };
        externalLinkCache.set(cacheKey, result);
        return result;
    }
}
