export const imgRegex = /<img\b[^>]*>/gi;
export const altTextRegex = /\balt\s*=\s*(["'])(.*?)\1/i;
export const srcTagRegex = /\ssrc=["']([^"']+)["']/i;
export const inlineStyleRegex = /<[^>]+\sstyle\s*=\s*(['"\&quot;])([\s\S]*?)\1[^>]*>/gi;
export const styleTagRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
export const bgUrlRegex = /background(?:-image)?\s*:\s*url\(([^)]+)\)/gi;
export const cssUrlRegex = /url\((['"]?)(.*?)\1\)/gi;
