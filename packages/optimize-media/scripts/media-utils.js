import path from 'path';

// Helper to determine the correct base directory for a media URL
export function getBaseForMediaUrl(url, currentFile, config) {
  if (!url) return config.outDir;
  if (url.startsWith('/')) {
    // Root-relative: resolve from site root
    return config.outDir;
  }
  if (/^https?:\/\//.test(url)) {
    // External: base is irrelevant
    return null;
  }
  // Relative: resolve from current file's directory
  return currentFile ? path.dirname(currentFile) : config.outDir;
}

export function getStyleSnippet(styleContent, maxLength = 100) {
  if (!styleContent || typeof styleContent !== 'string') return '';
  return styleContent.length > maxLength ? styleContent.slice(0, maxLength) + '...' : styleContent;
}

// Utility to decode only &quot;, &#39;, and &amp; in URLs (minimal for this use case)
export function decodeHtmlEntities(str) {
  if (!str || typeof str !== 'string') return str;
  let decoded = str
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');

  decoded = decoded.replace(/^['"]|['"]$/g, '');

  return decoded
}
