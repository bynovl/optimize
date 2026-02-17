import { ISSUE_KEY } from '@bynovl/optimize-lib/issue-keys.js';
import { checkLinkValidity } from '@bynovl/optimize-lib/check-link-validity.js';

// REGEX
export const stylesheetRegex = /<link\b(?=[^>]*rel=["']stylesheet["'])(?=[^>]*href=["']([^"']+)["'])[^>]*>/gi;
export const scriptRegex = /<script\s+[^>]*src=["']([^"']+)["']/gi;

// Validation functions
export async function validateStylesheets(content, config, file, startUrl) {
  const results = [];
  const stylesheets = content.match(stylesheetRegex) || [];
  for (const stylesheet of stylesheets) {
    const hrefMatch = stylesheet.match(/href=["']([^"']+)["']/i);
    const href = hrefMatch && hrefMatch[1] ? hrefMatch[1].trim() : '';
    if (href) {
      const linkError = await checkLinkValidity(content, href, config, file, startUrl);
      if (linkError && linkError.isError) {
        const isExternal = linkError.type === ISSUE_KEY.unreachableExtLink || linkError.type === ISSUE_KEY.invalidExtLink;
        results.push({
          target: href,
          isError: true,
          isWarning: false,
          reason: isExternal ? 'Invalid external stylesheet href' : 'Invalid local stylesheet href',
          type: linkError.type,
          message: (isExternal ? 'External stylesheet href is invalid or unreachable: ' : 'Local stylesheet file is missing or invalid: ') + href,
        });
      }
    }
  }
  return results.length > 0 ? results : null;
}

export async function validateScripts(content, config, file, startUrl) {
  const results = [];
  const scripts = content.match(scriptRegex) || [];
  for (const script of scripts) {
    const srcMatch = script.match(/src=["']([^"']+)["']/i);
    const srcUrl = srcMatch && srcMatch[1] ? srcMatch[1].trim() : '';
    if (srcUrl) {
      const linkError = await checkLinkValidity(content, srcUrl, config, file, startUrl);
      if (linkError && linkError.isError) {
        const isExternal = linkError.type === ISSUE_KEY.unreachableExtLink || linkError.type === ISSUE_KEY.invalidExtLink;
        results.push({
          target: srcUrl,
          isError: true,
          isWarning: false,
          reason: isExternal ? 'Invalid external script src' : 'Invalid local script src',
          type: linkError.type,
          message: (isExternal ? 'External script src is invalid or unreachable: ' : 'Local script file is missing or invalid: ') + srcUrl,
          target: srcUrl,
        });
      }
    }
  }
  return results.length > 0 ? results : null;
}
