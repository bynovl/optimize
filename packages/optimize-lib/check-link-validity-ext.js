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
    // Guard: inputUrl must be a non-empty string
    if (typeof inputUrl !== 'string' || inputUrl.trim() === '') {
        return {
            isError: true,
            isWarning: false,
            message: 'URL is missing or not a string',
            target: inputUrl || '',
            reason: 'Missing or invalid URL',
            type: ISSUE_KEY ? ISSUE_KEY.missing : 'missing',
            sourceFile
        };
    }
    // Only validate external URLs
    if (!externalUrlRegexStrict.test(inputUrl)) {
        return {
            isError: true,
            isWarning: false,
            message: 'Not an external URL',
            target: inputUrl,
            reason: `Invalid external URL: ${inputUrl}`,
            type: ISSUE_KEY ? ISSUE_KEY.invalidExtLink : 'invalidExtLink',
            sourceFile
        };
    }
    // Ignore mailto, tel, javascript, ftp, and localhost
    if (
        inputUrl.startsWith('mailto:') ||
        inputUrl.startsWith('tel:') ||
        inputUrl.startsWith('sms:') ||
        inputUrl.startsWith('javascript:') ||
        inputUrl.startsWith('ftp:') ||
        inputUrl.startsWith('http://localhost') ||
        inputUrl.startsWith('https://localhost') ||
        inputUrl.startsWith('#')
    ) {
        return { isError: false, isWarning: true, reason: `Non-HTTP(s) or local link ignored: ${inputUrl}`, message: inputUrl, target: inputUrl, sourceFile };
    }
    // Offline mode: skip external validation
    if (config.isOffline) {
        return { isError: false, isWarning: true, reason: `Offline mode: external link validation skipped for ${inputUrl}`, message: inputUrl, target: inputUrl, sourceFile };
    }
    // Always resolve protocol-relative URLs to https
    let url = inputUrl;
    if (inputUrl.startsWith('//')) {
        url = 'https:' + inputUrl;
    }
    // Remove hash fragment for validation
    const baseUrl = url.split('#')[0];
    try {
        // Only pass the URL; global config is used inside checkExternalLink
        const { ok, status, errorType } = await checkExternalLink(baseUrl, config);
        if (!ok) {
            // unreachable, invalid, or bad status
            let isError = false; // Set isError to false for unreachable cases
            let isWarning = true; // Set isWarning to true for unreachable cases
            let type, msg, reason;
            if (typeof status === 'number') {
                if (status === 403) {
                    // 403 Forbidden - often a warning (may block bots)
                    isWarning = true;
                    isError = false;
                } else if (status === 404) {
                    // 404 Not Found - treat as error
                    isError = true;
                    isWarning = false;
                } else if (status >= 400 && status < 500) {
                    // Other 4xx errors - treat as warning
                    isWarning = true;
                    isError = false;
                }
                type = ISSUE_KEY ? ISSUE_KEY.invalidExtLink : 'invalidExtLink';
                msg = `External link returned HTTP status ${status}: ${url}`;
                reason = `External link returned HTTP status ${status}: ${url}`;
            } else {
                // unreachable or blocked
                type = errorType === 'unreachable'
                    ? (ISSUE_KEY ? ISSUE_KEY.unreachableExtLink : 'unreachableExtLink')
                    : (ISSUE_KEY ? ISSUE_KEY.invalidExtLink : 'invalidExtLink');
                msg = `External link could not be reached or may be blocked: ${url}`;
                reason = 'Unreachable or blocked external link';
            }
            const result = {
                isError,
                isWarning,
                message: msg,
                target: url,
                reason,
                type,
                sourceFile
            };
            externalLinkCache.set(cacheKey, result);
            return result;
        }
        // ok: valid
        externalLinkCache.set(cacheKey, null);
        return null;
    } catch (err) {
        const result = {
            isError: false,
            isWarning: true,
            reason: `External link fetch failed for link: ${url}`,
            message: err && err.message ? err.message : String(err),
            target: url,
            type: ISSUE_KEY ? ISSUE_KEY.unreachableExtLink : 'unreachableExtLink',
            sourceFile
        };
        externalLinkCache.set(cacheKey, result);
        return result;
    }
}
