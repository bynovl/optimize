// Meta Open Graph Tags
export const ogTitle =
  /<meta\b(?=[^>]*\bproperty=["']og:title["'])(?=[^>]*\bcontent=["']([^"']*)["'])[^>]*>/gi;
export const ogDesc =
  /<meta\b(?=[^>]*\bproperty=["']og:description["'])(?=[^>]*\bcontent=["']([^"']*)["'])[^>]*>/gi;
export const ogImage =
  /<meta\b(?=[^>]*\bproperty=["']og:image["'])(?=[^>]*\bcontent=["']([^"']*)["'])[^>]*>/gi;
export const ogUrl =
  /<meta\b(?=[^>]*\bproperty=["']og:url["'])(?=[^>]*\bcontent=["']([^"']*)["'])[^>]*>/gi;

// Twitter
export const twitterTitle =
  /<meta\b(?=[^>]*\bname=["']twitter:title["'])(?=[^>]*\bcontent=["']([^"']*)["'])[^>]*>/gi;
export const twitterDesc =
  /<meta\b(?=[^>]*\bname=["']twitter:description["'])(?=[^>]*\bcontent=["']([^"']*)["'])[^>]*>/gi;
export const twitterImage =
  /<meta\b(?=[^>]*\bname=["']twitter:image["'])(?=[^>]*\bcontent=["']([^"']*)["'])[^>]*>/gi;
