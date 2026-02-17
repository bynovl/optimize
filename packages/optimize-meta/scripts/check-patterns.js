// Meta Regex
export const robotsRegex =
  /<meta\b(?=[^>]*\bname=["']robots["'])(?=[^>]*\bcontent=["']([^"']*)["'])[^>]*>/gi;
export const metaTitleRegex = /<title[^>]*>([\s\S]*?)<\/title>/gi;
export const canonicalUrlRegex =
  /<link\b(?=[^>]*\brel=["']canonical["'])(?=[^>]*\bhref=["']([^"']+)["'])[^>]*>/gi;
export const metaDescRegex =
  /<meta\b(?=[^>]*\bname=["']description["'])(?=[^>]*\bcontent=["']([^"']*)["'])[^>]*>/gi;
export const metaKeywordsRegex =
  /<meta\b(?=[^>]*\bname=["']keywords["'])(?=[^>]*\bcontent=["']([^"']*)["'])[^>]*>/gi;

// Define tag checks with their regex and requirement status
// Easy to extend in the future (or allow custom tag checks by add more objects via optimize config)
export const robotsValidation = (value) => {
  if (!value || typeof value !== 'string') return false;
  const lower = value.toLowerCase();
  return lower.includes('noindex') || lower.includes('nofollow');
};
