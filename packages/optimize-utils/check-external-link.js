
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
            return resolve({ ok: false, status: null, errorType: 'invalid' });
        }
        const client = url.startsWith('https') ? https : http;

        let agent = undefined;
        let timeout = 2000;

        // Merge headers from config.crawler.headers into defaultOptions.headers if present
        let mergedHeaders = { ...defaultOptions.headers };
        if (config && config.crawler && config.crawler.headers && typeof config.crawler.headers === 'object') {
            mergedHeaders = { ...mergedHeaders, ...config.crawler.headers };
        }

        const requestOptions = {
            method: defaultOptions.method || 'GET',
            agent,
            headers: mergedHeaders
        };

        const req = client.request(url, requestOptions, (res) => {
            const valid = res.statusCode >= 200 && res.statusCode < 400;
            resolve({ ok: valid, status: res.statusCode, errorType: valid ? null : 'invalid' });
            res.resume();
        });
        req.on('error', () => {
            resolve({ ok: false, status: null, errorType: 'unreachable' });
        });
        req.setTimeout(timeout, () => {
            req.destroy();
            resolve({ ok: false, status: null, errorType: 'unreachable' });
        });
        req.end();
    });
}
