import path from 'path';
import { checkLinkValidityInt } from './check-link-validity-int.js';
import { checkLinkValidityExt } from './check-link-validity-ext.js';
import { debug } from '../optimize-utils/debug-log.js'
/**
 * Main dispatcher for link validation.
 * Determines if a link is internal or external and delegates to the appropriate handler.
 * @param {string} content - The HTML string or cache for internal validation.
 * @param {string} link - The link to validate (can be relative or absolute).
 * @param {object} config - Config object. Should include startUrl (for offline/extracted validation), outDir, isOffline, etc.
 * @param {string} sourceFile - The source file path for context (used for resolving relative links).
 * @param {string} [startUrl] - Optional. The origin URL to resolve root-relative/relative links for offline/extracted pages.
 * @param {string} [startUrl] - Optional. If included, all on-page links are treated as external and resolved relative to startUrl.
 * @returns {Promise<object>} - Validation result object.
 *
 */

// For internal testing naturally get file extensions
// For example when searching if file exists search as-is and with .html, .htm, .php, etc. extensions
// For external links, rely on URL resolution to determine final URL

export async function checkLinkValidity(content, link, config = {}, sourceFile, startUrl) {
  // Currently log every link being validated
  debug(`[checkLinkValidity] Validating link: ${link} from sourceFile: ${sourceFile}`);

  // Helper: treat hash-only links as internal immediately
  if (link && link.startsWith('#')) {
    return await checkLinkValidityInt(content, link, config, sourceFile);
  }

  // Normalize protocol-relative links for parsing but don't assume external forever
  let normalizedLink = link;
  if (link && link.startsWith('//')) normalizedLink = 'https:' + link;
  debug(`[checkLinkValidity] Normalized link: ${normalizedLink}`);

  // Improved heuristics for external vs internal:
  // - Any http(s):// URL (except localhost) is always external
  // - Protocol-relative (//) is external unless localhost
  // - startUrl provided => we will resolve relative links against it and decide by origin
  // - Otherwise, no scheme or no leading // => internal


  let isExternal = false;
  if (typeof normalizedLink === 'string' &&
    (/^https?:\/\//i.test(normalizedLink) && !/^https?:\/\/localhost/i.test(normalizedLink))) {
    isExternal = true;
  } else if (typeof normalizedLink === 'string' && normalizedLink.startsWith('//')) {
    // Protocol-relative: treat as external unless localhost
    isExternal = !/^\/\/localhost/i.test(normalizedLink);
  } else if (startUrl) {
    isExternal = true;
  } else {
    isExternal = false;
  }

  // Prevent accidental double .html tokens in user-supplied hrefs
  if (typeof normalizedLink === 'string' && normalizedLink.endsWith('.html.html')) {
    normalizedLink = normalizedLink.replace(/\.html\.html$/, '.html');
  }

  // Treat localhost absolute URLs as internal
  if (typeof normalizedLink === 'string' && (/^https?:\/\/localhost/i.test(normalizedLink))) {
    return await checkLinkValidityInt(content, normalizedLink, config, sourceFile);
  }

  // If offline, skip external validation early
  if (config.isOffline && isExternal) {
    return { isError: false, isWarning: true, reason: `Offline mode: external link validation skipped`, message: link, target: link, sourceFile };
  }

  // When marked external we still try to resolve against startUrl/config.startUrl and
  // prefer local validation when the resolved URL matches the site origin and a local
  // output directory (config.outDir) is available. This allows natural routing (e.g. '/about')
  // to be validated against local files (index.html or .html variants) instead of forcing
  // an external HTTP check or appending .html blindly.
  if (isExternal) {
    let baseForUrl;
    if (startUrl) {
      try {
        const origin = new URL(startUrl).origin;
        baseForUrl = normalizedLink.startsWith('/') ? origin : startUrl;
      } catch {
        baseForUrl = startUrl;
      }
    } else {
      baseForUrl = config.startUrl || undefined;
    }

    let urlObj;
    try {
      urlObj = new URL(normalizedLink);
    } catch {
      try {
        urlObj = new URL(normalizedLink, baseForUrl);
      } catch (err) {
        // Could not form a URL; fall back to treating as internal path
        const fallbackResult = await checkLinkValidityInt(content, link, config, sourceFile);
        if (fallbackResult && fallbackResult.isError) {
          return { ...fallbackResult, reason: `${fallbackResult.reason}`, message: `Validated path: ${link}`, sourceFile };
        }
        return { isError: false, isWarning: false, reason: `Link is valid`, message: link, target: link, sourceFile };
      }
    }

    // Normalize pathname double .html
    if (urlObj.pathname && urlObj.pathname.endsWith('.html.html')) {
      urlObj.pathname = urlObj.pathname.replace(/\.html\.html$/, '.html');
    }

    // If this URL resolves to the same origin as the site (startUrl/config.startUrl)
    // and we have a local outDir, prefer local/internal validation. This lets '/about'
    // map naturally to '/about/index.html' or '/about.html' depending on what exists.
    let siteOrigin = null;
    try {
      siteOrigin = new URL(startUrl || config.startUrl).origin;
    } catch { }

    if (siteOrigin && urlObj.origin === siteOrigin && config.outDir) {
      const pathAndQueryHash = `${urlObj.pathname}${urlObj.search || ''}${urlObj.hash || ''}`;
      const intResult = await checkLinkValidityInt(content, pathAndQueryHash, config, sourceFile);
      if (!intResult || !intResult.isError) {
        return { isError: false, isWarning: false, reason: `Link is valid (resolved locally)`, message: urlObj.href, target: urlObj.href, sourceFile };
      }
      // otherwise fall through to external check
    }

    const result = await checkLinkValidityExt(urlObj.href, config, sourceFile);
    if (!result || !result.isError) {
      return { isError: false, isWarning: false, reason: `Link is valid`, message: urlObj.href, target: urlObj.href, sourceFile };
    }
    return result;
  }

  // Internal/local link resolution: delegate to internal validator which already
  // handles routing (appends index.html) and tries .html fallbacks.
  try {
    const result = await checkLinkValidityInt(content, link, config, sourceFile);
    if (result && result.isError) {
      return { ...result, reason: `${result.reason}`, message: `Validated path: ${link}`, sourceFile };
    }
    return { isError: false, isWarning: false, reason: `Link is valid`, message: link, target: link, sourceFile };
  } catch (err) {
    return { isError: true, isWarning: false, reason: 'Internal link validation error', message: err.message, target: link };
  }
}