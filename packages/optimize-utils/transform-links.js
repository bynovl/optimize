export function transformLink(href, startUrl) {
    function getBase(url) {
        try {
            const urlObj = new URL(url);
            return { protocol: urlObj.protocol, domain: urlObj.origin };
        } catch {
            return { protocol: 'https:', domain: '' };
        }
    }
    const { protocol, domain } = getBase(startUrl);

    // Remove any leading ../_temp/[cache id]/ from href
    href = href.replace(/^\.\.\/(_temp\/[^/]+\/)/, '');

    // Absolute external URLs
    if (/^https?:\/\//.test(href)) return href;

    // Protocol-relative URLs
    if (href.startsWith('//')) return `${protocol}${href}`;

    // Ignore javascript:, mailto:, anchor links
    if (
        href.startsWith('javascript:') ||
        href.startsWith('mailto:') ||
        href.startsWith('#')
    ) return href;

    // Normalize path for all other cases using URL constructor
    try {
        // Use domain as base for relative resolution
        const base = domain || protocol + '//';
        const resolved = new URL(href, base);
        let cleanPath = resolved.pathname + (resolved.search || '') + (resolved.hash || '');
        // Normalize homepage: '/' becomes '/index.html'
        if (cleanPath === '/') {
            cleanPath = '/index.html';
        }
        // Normalize all directory URLs to /.../index.html
        const fileExtRegex = /\.[a-zA-Z0-9]+$/;
        if (!fileExtRegex.test(cleanPath.split('?')[0])) {
            // Remove trailing slash if present (except for root)
            if (cleanPath.length > 1 && cleanPath.endsWith('/')) {
                cleanPath = cleanPath.slice(0, -1);
            }
            // If not already /index.html, append /index.html
            if (!cleanPath.endsWith('/index.html')) {
                cleanPath += '/index.html';
            }
        }
        return `${domain}${cleanPath}`;
    } catch {
        // fallback to previous logic if URL fails
        let cleanPath = href;
        if (href.startsWith('./')) cleanPath = '/' + href.replace(/^\.\/+/, '');
        else if (href.startsWith('../')) cleanPath = '/' + href.replace(/^\.\.\/+/, '');
        else if (!href.startsWith('/')) cleanPath = '/' + href.replace(/^\/?/, '');
        const fileExtRegex = /\.[a-zA-Z0-9]+$/;
        if (
            cleanPath !== '/' &&
            !cleanPath.endsWith('/') &&
            !fileExtRegex.test(cleanPath.split('?')[0])
        ) {
            cleanPath += '/index.html';
        }
        return `${domain}${cleanPath}`;
    }
}