import https from 'https';
import http from 'http';
import { externalUrlRegexStrict } from './regex-links.js';

/**
 * Checks if an external link is reachable (status 200-399).
 * Uses a HEAD request for fast header-only validation.
 * @param {string} url - The external URL to check.
 * @param {object} [options] - Options: timeout (ms), agent, keepAlive (bool)
 * @returns {Promise<{ok: boolean, status: number|null, errorType: string|null}>}
 */

function isValidUrl(url) {
    if (/^\/?#/.test(url)) return false;
    return externalUrlRegexStrict.test(url);
}
// Can add support for custom headers later if needed
// as part of configurable options.(optimize.config.js)
const defaultOptions = {
    method: 'GET',
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
    }
};
export function checkExternalLink(url, config) {
    return new Promise((resolve) => {
        if (!isValidUrl(url)) {
            return resolve({
                isError: true,
                isWarning: false,
                type: 'invalidExtLink',
                message: 'Not an external URL',
                reason: `Invalid external URL: ${url}`,
                status: null,
                errorType: 'invalid',
                target: url
            });
        }

        const maxRedirects = 5;
        const timeout = 2000;

        function requestHeaders(currentUrl, redirectsLeft) {
            try {
                const client = currentUrl.startsWith('https') ? https : http;
                const requestOptions = {
                    method: defaultOptions.method || 'GET',
                    headers: defaultOptions.headers
                };

                const req = client.request(currentUrl, requestOptions, (res) => {
                    const status = res.statusCode;
                    // handle redirect status codes (3xx)
                    if (status >= 300 && status < 400 && res.headers && res.headers.location && redirectsLeft > 0) {
                        let nextUrl;
                        try {
                            nextUrl = new URL(res.headers.location, currentUrl).href;
                        } catch (e) {
                            res.resume();
                            return resolve({
                                isError: true,
                                isWarning: false,
                                type: 'invalidExtLink',
                                message: `Malformed redirect location header: ${currentUrl}`,
                                reason: `Malformed redirect location header: ${currentUrl}`,
                                status,
                                errorType: 'invalid',
                                target: currentUrl
                            });
                        }
                        res.resume();
                        return requestHeaders(nextUrl, redirectsLeft - 1);
                    }

                    // Error Handling based on status code
                    let isError = false, isWarning = false, type, msg, reason;
                    if (typeof status === 'number') {
                        if (status === 403) {
                            isWarning = true;
                            isError = false;
                        } else if (status === 404) {
                            isError = true;
                            isWarning = false;
                        } else if (status >= 400 && status < 500) {
                            isWarning = true;
                            isError = false;
                        } else if (status >= 200 && status < 400) {
                            isError = false;
                            isWarning = false;
                        } else {
                            isError = true;
                            isWarning = false;
                        }
                        type = (status >= 400) ? 'invalidExtLink' : undefined;
                        msg = `External link returned HTTP status ${status}: ${currentUrl}`;
                        reason = msg;
                    } else {
                        isError = true;
                        isWarning = false;
                        type = 'unreachableExtLink';
                        msg = `External link could not be reached or may be blocked: ${currentUrl}`;
                        reason = 'Unreachable or blocked external link';
                    }
                    res.resume();
                    resolve({
                        isError,
                        isWarning,
                        type,
                        message: msg,
                        reason,
                        status,
                        errorType: isError ? 'invalid' : null,
                        target: currentUrl
                    });
                });

                req.on('error', () => {
                    resolve({
                        isError: true,
                        isWarning: false,
                        type: 'unreachableExtLink',
                        message: `External link could not be reached or may be blocked: ${url}`,
                        reason: 'Unreachable or blocked external link',
                        status: null,
                        errorType: 'unreachable',
                        target: url
                    });
                });
                req.setTimeout(timeout, () => {
                    req.destroy();
                    resolve({
                        isError: true,
                        isWarning: false,
                        type: 'unreachableExtLink',
                        message: `External link could not be reached or may be blocked: ${url}`,
                        reason: 'Unreachable or blocked external link',
                        status: null,
                        errorType: 'unreachable',
                        target: url
                    });
                });
                req.end();
            } catch (err) {
                resolve({
                    isError: true,
                    isWarning: false,
                    type: 'unreachableExtLink',
                    message: `External link could not be reached or may be blocked: ${url}`,
                    reason: 'Unreachable or blocked external link',
                    status: null,
                    errorType: 'unreachable',
                    target: url
                });
            }
        }

        requestHeaders(url, maxRedirects);
    });
}
