import path from 'path';
import { checkLinkValidityInt } from './check-link-validity-int.js';
import { checkLinkValidityExt } from './check-link-validity-ext.js';
import { debug } from '../optimize-utils/debug-log.js';

/**
 * Main dispatcher for link validation.
 * Determines if a link is internal or external and delegates to the appropriate handler.
 * @param {string} content - The HTML string or cache for internal validation.
 * @param {string} link - The link to validate (can be relative or absolute).
 * @param {object} config - Config object. Should include startUrl (for offline/extracted validation), outDir, isOffline, etc.
 * @param {string} sourceFile - The source file path for context (used for resolving relative links).
 * @param {string} [startUrl] - Optional. The origin URL to resolve root-relative/relative links for offline/extracted pages.
 * @returns {Promise<object>} - Validation result object.
 */


// Helper: ignore SSA URLs
function isIgnoredSSAUrl(url) {
  return /^https:\/\/ssa\..*\.com/.test(url);
}

// Helper: check if link is localhost or 127.0.0.1 root
function isLocalhostRoot(link) {
  return (
    /^https?:\/\/localhost(:\d+)?\/?$/i.test(link) ||
    /^https?:\/\/127\.0\.0\.1(:\d+)?\/?$/i.test(link)
  );
}

// Helper: normalize protocol-relative links
function normalizeProtocolRelative(link) {
  return link?.startsWith('//') ? 'https:' + link : link;
}

// Helper: remove accidental double .html
function removeDoubleHtml(str) {
  return typeof str === 'string' && str.endsWith('.html.html')
    ? str.replace(/\.html\.html$/, '.html')
    : str;
}

// Helper: run internal validation and format result
async function validateInternal(content, path, config, sourceFile, label = null) {
  try {
    const result = await checkLinkValidityInt(content, path, config, sourceFile);
    if (result?.isError) {
      return { ...result, reason: result.reason, message: `Validated path: ${label || path}`, sourceFile };
    }
    return { isError: false, isWarning: false, reason: 'Link is valid', message: label || path, target: path, sourceFile };
  } catch (err) {
    return { isError: true, isWarning: false, reason: 'Internal link validation error', message: err.message, target: path };
  }
}

export async function checkLinkValidity(content, link, config = {}, sourceFile, startUrl) {
  // 1. Internal/Local checks
  if (link?.startsWith('#')) {
    return validateInternal(content, link, config, sourceFile);
  }
  if (link === '/' && !startUrl) {
    return validateInternal(content, 'index.html', config, sourceFile, '/');
  }
  if (isLocalhostRoot(link)) {
    return validateInternal(content, 'index.html', config, sourceFile, link);
  }

  let normalizedLink = normalizeProtocolRelative(link);
  normalizedLink = removeDoubleHtml(normalizedLink);

  // Determine if external
  const isExternal =
    (typeof normalizedLink === 'string' &&
      (/^https?:\/\//i.test(normalizedLink) || normalizedLink.startsWith('//')))
    || Boolean(startUrl);

  // Local/internal link resolution
  const isLocal =
    !isExternal ||
    (typeof normalizedLink === 'string' &&
      (/^https?:\/\/localhost/i.test(normalizedLink) || /^\/\/localhost/i.test(normalizedLink)));

  if (isLocal) {
    let internalPath = link;
    if (typeof normalizedLink === 'string' && (/^https?:\/\/localhost/i.test(normalizedLink) || /^\/\/localhost/i.test(normalizedLink))) {
      try {
        const urlObj = new URL(normalizedLink.startsWith('//') ? 'http:' + normalizedLink : normalizedLink);
        internalPath = urlObj.pathname + (urlObj.search || '') + (urlObj.hash || '');
      } catch {
        internalPath = normalizedLink;
      }
    }
    return validateInternal(content, internalPath, config, sourceFile);
  }

  // 2. External checks
  if (config.isOffline && isExternal) {
    return { isError: false, isWarning: true, reason: 'Offline mode: external link validation skipped', message: link, target: link, sourceFile };
  }

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
      baseForUrl = config.startUrl;
    }

    let urlObj;
    try {
      urlObj = new URL(normalizedLink);
    } catch {
      try {
        urlObj = new URL(normalizedLink, baseForUrl);
      } catch {
        // Fallback to internal validation
        return validateInternal(content, link, config, sourceFile);
      }
    }

    urlObj.pathname = removeDoubleHtml(urlObj.pathname);

    // Prefer local validation if same origin and outDir exists
    let siteOrigin = null;
    try {
      siteOrigin = new URL(startUrl || config.startUrl).origin;
    } catch {}

    if (siteOrigin && urlObj.origin === siteOrigin && config.outDir) {
      const pathAndQueryHash = `${urlObj.pathname}${urlObj.search || ''}${urlObj.hash || ''}`;
      const intResult = await checkLinkValidityInt(content, pathAndQueryHash, config, sourceFile);
      if (!intResult?.isError) {
        return { isError: false, isWarning: false, reason: 'Link is valid (resolved locally)', message: urlObj.href, target: urlObj.href, sourceFile };
      }
      // Otherwise, fall through to external check
    }

    if (isIgnoredSSAUrl(urlObj.href)) {
      return { isError: false, isWarning: true, reason: 'Ignored SSA URL', message: urlObj.href, target: urlObj.href, sourceFile };
    }

    const result = await checkLinkValidityExt(urlObj.href, config, sourceFile);
    if (!result?.isError) {
      return { isError: false, isWarning: false, reason: 'Link is valid', message: urlObj.href, target: urlObj.href, sourceFile };
    }
    return result;
  }
}