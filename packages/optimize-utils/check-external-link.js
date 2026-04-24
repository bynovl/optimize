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
export function checkExternalLink(url) {
    return new Promise((resolve) => {
        if (!isValidUrl(url)) {
            return resolve({
                ok: false,
                status: null,
                type: 'invalidExtLink',
                isError: true,
                isWarning: false,
                message: `The provided link does not match external URL patterns: ${url}`,
                reason: `Not a valid external URL`,
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
                                ok: false,
                                status,
                                type: 'invalidExtLink',
                                isError: true,
                                isWarning: false,
                                message: `Redirect location header could not be parsed for: ${currentUrl}`,
                                reason: `Malformed redirect location header`,
                                target: currentUrl
                            });
                        }
                        res.resume();
                        return requestHeaders(nextUrl, redirectsLeft - 1);
                    }
                    let type = undefined, isError = false, isWarning = false, message, reason;
                    if (status === 404 || (status >= 400 && status < 600)) {
                        type = 'invalidExtLink';
                        isError = true;
                        message = `HTTP status ${status} for external link: ${currentUrl}`;
                        reason = `External link returned error status`;
                    }
                    res.resume();
                    resolve({
                        ok: status >= 200 && status < 400,
                        status,
                        type,
                        isError,
                        isWarning,
                        message,
                        reason,
                        target: currentUrl
                    });
                });

                req.on('error', (err) => {
                    // Node.js DNS errors have code 'ENOTFOUND' or 'EAI_AGAIN'
                    let type = 'unreachableExtLink', message, reason;
                    if (err && (err.code === 'ENOTFOUND' || err.code === 'EAI_AGAIN')) {
                        type = 'notfoundExtLink';
                        message = `Domain does not exist or cannot be resolved: ${url}`;
                        reason = `DNS lookup failed for: ${url}`;
                    } else {
                        message = `The link may be blocked, offline, or the server did not respond: ${url}`;
                        reason = `External link could not be reached`;
                    }
                    resolve({
                        ok: false,
                        status: null,
                        type,
                        isError: true,
                        isWarning: false,
                        message,
                        reason,
                        target: url
                    });
                });
                req.setTimeout(timeout, () => {
                    req.destroy();
                    resolve({
                        ok: false,
                        status: null,
                        type: 'unreachableExtLink',
                        isError: true,
                        isWarning: false,
                        message: `The link may be blocked, offline, or the server did not respond: ${url}`,
                        reason: `External link could not be reached`,
                        target: url
                    });
                });
                req.end();
            } catch (err) {
                resolve({
                    ok: false,
                    status: null,
                    type: 'unreachableExtLink',
                    isError: true,
                    isWarning: false,
                    message: `The link may be blocked, offline, or the server did not respond: ${url}`,
                    reason: `External link could not be reached`,
                    target: url
                });
            }
        }

        requestHeaders(url, maxRedirects);
    });
}
