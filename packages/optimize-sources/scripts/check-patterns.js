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
        results.push({
          target: href,
          isError: linkError.isError,
          isWarning: linkError.isWarning,
          reason: linkError.reason,
          type: linkError.type,
          message: linkError.message,
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
        results.push({
          target: srcUrl,
          isError: linkError.isError,
          isWarning: linkError.isWarning,
          reason: linkError.reason,
          type: linkError.type,
          message: linkError.message,
        });
      }
    }
  }
  return results.length > 0 ? results : null;
}
