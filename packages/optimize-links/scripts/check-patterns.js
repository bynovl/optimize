import { ISSUE_KEY } from '@bynovl/optimize-lib/issue-keys.js';
import { checkLinkValidity } from '@bynovl/optimize-lib/check-link-validity.js';

// Regex for <a href="..."> tags
export const anchorRegex = /<a\b[^>]*>/gi;
export const hrefAttrRegex = /\bhref\s*=\s*(["'])(.*?)\1/i;
export const allHrefRegex = /href\s*=\s*(["'])(.*?)\1/gi;

// DRY dispatcher for processing links
export async function processLinks(config, links, processFn) {
  const mode = config?.processingMode || 'default';
  if (mode === 'concurrent') {
    // Concurrent: process links in parallel with a limit
    const linksArr = Array.from(links);
    let idx = 0;
    const results = [];
    async function worker() {
      while (idx < linksArr.length) {
        const href = linksArr[idx++];
        const res = await processFn(href);
        if (res) results.push(res);
      }
    }
    const concurrency = config.processingSize || 4;
    await Promise.all(Array.from({ length: Math.min(concurrency, linksArr.length) }, worker));
    return results;
  } else if (mode === 'max') {
    // Only process up to max links
    return Array.from(links).slice(0, config.processingSize || 10);
  } else {
    // Default: return all links for sequential processing
    return Array.from(links);
  }
}

// Validate all <a href="..."> links (excluding anchors)
export async function validateLinks(content, config, file, startUrl) {
  // This function now expects an array of hrefs (already extracted by validateItem)
  // If called directly, fallback to extracting hrefs for backward compatibility
  let hrefs = [];
  if (Array.isArray(content)) {
    hrefs = content;
  } else {
    // fallback: extract hrefs from content
    const matches = [...(content.matchAll(allHrefRegex) || [])];
    hrefs = matches.map(m => m[2]?.trim()).filter(Boolean);
  }
  const results = [];
  for (const hrefValue of hrefs) {
    const linkError = await checkLinkValidity(content, hrefValue, config, file, startUrl);
    if (linkError && linkError.isError) {
      const isExternal = linkError.type === ISSUE_KEY.unreachableExtLink || linkError.type === ISSUE_KEY.invalidExtLink;
      results.push({
        isError: true,
        isWarning: false,
        reason: isExternal ? 'Invalid external link href' : 'Invalid local link href',
        type: linkError.type,
        message: (isExternal ? 'External link href is invalid or unreachable: ' : 'Local link file is missing or invalid: ') + hrefValue,
        target: hrefValue,
      });
    }
  }
  return results.length > 0 ? results : null;
}
