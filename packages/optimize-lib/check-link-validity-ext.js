import { checkExternalLink } from '@bynovl/optimize-utils/check-external-link.js';
import { ISSUE_KEY } from './issue-keys.js';
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
            // Attach sourceFile for context if needed
            if (sourceFile) result.sourceFile = sourceFile;
            externalLinkCache.set(cacheKey, result);
            return result;
        }
        // Defensive: treat as unreachable if no result
        const fallback = {
            ok: false,
            status: null,
            type: ISSUE_KEY.unreachableExtLink,
            isError: false,
            isWarning: true,
            message: `External link could not be reached or may be blocked: ${url}`,
            reason: `External link could not be reached or may be blocked: ${url}`,
            target: url,
            sourceFile
        };
        externalLinkCache.set(cacheKey, fallback);
        return fallback;
    } catch (err) {
        const result = {
            ok: false,
            status: null,
            type: ISSUE_KEY.unreachableExtLink,
            isError: false,
            isWarning: true,
            message: `External link fetch failed for link: ${url}`,
            reason: err && err.message ? err.message : String(err),
            target: url,
            sourceFile
        };
        externalLinkCache.set(cacheKey, result);
        return result;
    }
}
