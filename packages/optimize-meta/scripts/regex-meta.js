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

// Extend with custom meta tag regex generator
// Creates regex for meta tags based on provided name and attributes
// Use for custom meta checks

export const customMetaRegex = (metaName, attrs) => {
    // Dynamically create regex based on provided attributes
    if (!metaName) {
        throw new Error('Meta name is required for custom meta regex generation.');
    }
    let attributePatterns = `(?=[^>]*\\bname=["']${metaName}["'])`;
    for (const attr of attrs) {
        if (attr !== 'name') {
            attributePatterns += `(?=[^>]*\\b${attr}=["'][^"']*["'])`;
        }
    }
    return new RegExp(
        `meta\\b${attributePatterns}`, 'gi'
    );
}