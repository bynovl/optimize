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
  // Early return for null, undefined, or empty string links
  if (link === null || link === undefined || link === '') {
    return {
      isError: true,
      isWarning: false,
      reason: `Link href is missing, empty, null, or undefined (value: ${String(link)})`,
      message: 'Link href is missing, empty, null, or undefined (no href attribute or value)',
      target: '',
      sourceFile
    };
  }

  // Centralized normalization logic
  function normalizeLink(link) {
    let normalized = normalizeProtocolRelative(link);
    let wasDoubleHtml = typeof normalized === 'string' && /\.html\.html$/.test(normalized);
    let final = removeDoubleHtml(normalized);
    return { normalized: final, wasDoubleHtml };
  }

  // Protocols to skip or warn about
  const skipOrWarnProtocols = [
    'data:', 'mailto:', 'tel:', 'javascript:', 'ftp:', 'file:', 'irc:', 'news:', 'gopher:', 'ws:', 'wss:'
  ];
  const lowerLink = String(link).toLowerCase();
  for (const proto of skipOrWarnProtocols) {
    if (lowerLink.startsWith(proto)) {
      return {
        isError: false,
        isWarning: true,
        reason: `Link uses unsupported or non-navigable protocol (${proto.replace(':','')})`,
        message: `Link with protocol ${proto} skipped or not validated`,
        target: link,
        sourceFile
      };
    }
  }

  // 1. Internal/Local checks
  if (link?.startsWith('#')) {
    // Optionally warn for href="#" as a placeholder
    if (link === '#') {
      return {
        isError: false,
        isWarning: true,
        reason: 'Fragment-only link ("#") often used as placeholder',
        message: 'Fragment-only link ("#") often used as placeholder',
        target: link,
        sourceFile
      };
    }
    return validateInternal(content, link, config, sourceFile);
  }
  if (link === '/' && !startUrl) {
    return validateInternal(content, 'index.html', config, sourceFile, '/');
  }
  if (isLocalhostRoot(link)) {
    return validateInternal(content, 'index.html', config, sourceFile, link);
  }

  const { normalized: normalizedLink, wasDoubleHtml } = normalizeLink(link);
  const originalLink = link;

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
    // If normalization changed the link, include both in the message and reason, and mention normalization if it was double .html
    if (originalLink !== normalizedLink) {
      let label = `original: ${link}, normalized: ${normalizedLink}`;
      if (wasDoubleHtml) {
        label += ' (normalized from .html.html to .html)';
      }
      // Pass label as both reason and message for clarity
      return {
        isError: false,
        isWarning: false,
        reason: label,
        message: label,
        target: normalizedLink,
        sourceFile
      };
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

    const originalPathname = urlObj.pathname;
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
        let msg = urlObj.href;
        let reason = 'Link is valid (resolved locally)';
        if (originalPathname !== urlObj.pathname) {
          msg = `original: ${link}, normalized: ${urlObj.href}`;
          reason += ` (original: ${link}, normalized: ${urlObj.href})`;
          if (wasDoubleHtml) {
            msg += ' (normalized from .html.html to .html)';
            reason += ' (normalized from .html.html to .html)';
          }
        }
        return { isError: false, isWarning: false, reason, message: msg, target: urlObj.href, sourceFile };
      }
      // Otherwise, fall through to external check
    }

    if (isIgnoredSSAUrl(urlObj.href)) {
      return { isError: false, isWarning: true, reason: 'Ignored SSA URL', message: urlObj.href, target: urlObj.href, sourceFile };
    }

    const result = await checkLinkValidityExt(urlObj.href, config, sourceFile);
    if (!result?.isError) {
      let msg = urlObj.href;
      let reason = 'Link is valid';
      if (originalPathname !== urlObj.pathname) {
        msg = `original: ${link}, normalized: ${urlObj.href}`;
        reason += ` (original: ${link}, normalized: ${urlObj.href})`;
        if (wasDoubleHtml) {
          msg += ' (normalized from .html.html to .html)';
          reason += ' (normalized from .html.html to .html)';
        }
      }
      return { isError: false, isWarning: false, reason, message: msg, target: urlObj.href, sourceFile };
    }
    // If error, also include original/normalized if changed
    if (originalPathname !== urlObj.pathname) {
      result.message = `original: ${link}, normalized: ${urlObj.href} | ${result.message}`;
      result.reason = `${result.reason} (original: ${link}, normalized: ${urlObj.href})`;
    }
    // Always append normalization note for .html.html normalization if it occurred, but avoid duplicates
    const normNote = ' (normalized from .html.html to .html)';
    if (wasDoubleHtml) {
      if (!result.reason?.includes(normNote)) {
        result.reason = (result.reason || '') + normNote;
      }
    }
    return result;
  }
}