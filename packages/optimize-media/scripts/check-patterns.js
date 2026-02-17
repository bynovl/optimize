import { ISSUE_KEY } from '@bynovl/optimize-lib/issue-keys.js';
import { checkLinkValidity } from '@bynovl/optimize-lib/check-link-validity.js';
import { getStyleSnippet, decodeHtmlEntities } from './check-utils.js';

// REGEX
export const imgRegex = /<img\b[^>]*>/gi;
export const altTextRegex = /\balt\s*=\s*(["'])(.*?)\1/i;
export const srcTagRegex = /\ssrc=["']([^"']+)["']/i;
export const inlineStyleRegex = /<[^>]+\sstyle\s*=\s*(['"\&quot;])([\s\S]*?)\1[^>]*>/gi;
export const styleTagRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
export const bgUrlRegex = /background(?:-image)?\s*:\s*url\(([^)]+)\)/gi;
export const cssUrlRegex = /url\((['"]?)(.*?)\1\)/gi;
export const imgAltRegex = /<img\b[^>]*\bsrc\s*=\s*(['"])(.*?)\1[^>]*\balt\s*=\s*(['"])(.*?)\3[^>]*>/gi;
export const srcAttrRegex = /\bsrc\s*=\s*(["'])(.*?)\1/i;

// Custom validation functions for media check
export async function validateImgTag(content, config, file, startUrl) {
  const results = [];
  const imgTags = content.match(imgRegex) || [];
  if (config.htmlFiles === true) {
    for (const imgTag of imgTags) {
      const srcMatch = imgTag.match(srcAttrRegex);
      const srcValue = srcMatch && typeof srcMatch[2] === 'string' ? srcMatch[2].trim() : '';
      if (!srcValue) {
        results.push({
          target: '<img>',
          reason: 'missing image src attribute',
          type: ISSUE_KEY.missing,
          isError: true,
          isWarning: false,
          message: 'image tag is missing src attribute.',
        });
        continue;
      }
      if (srcValue.startsWith('data:')) continue;
      const linkError = await checkLinkValidity(content, srcValue, config, file, startUrl);
      if (linkError && linkError.isError) {
        const isExternal = linkError.type === ISSUE_KEY.unreachableExtLink || linkError.type === ISSUE_KEY.invalidExtLink;
        results.push({
          isError: true,
          isWarning: false,
          reason: isExternal ? 'Invalid external image src' : 'Invalid local image src',
          type: linkError.type,
          message: (isExternal ? 'External image src is invalid or unreachable: ' : 'Local image file is missing or invalid: ') + srcValue,
          target: srcValue,
        });
      }
    }
  }
  return results.length > 0 ? results : null;
}
export async function validateInlineStyles(content, config, file, startUrl) {
  const results = [];
  if (config.htmlFiles === true) {
    const inlineStyles = content.match(inlineStyleRegex) || [];
    for (const styleContent of inlineStyles) {
      let bgMatch;
      while ((bgMatch = bgUrlRegex.exec(styleContent)) !== null) {
        let url = bgMatch[1] ? bgMatch[1].trim() : '';
        url = decodeHtmlEntities(url);

        if (!url || url.trim() === '') {
          results.push({
            isError: true,
            isWarning: false,
            type: ISSUE_KEY.empty,
            reason: 'empty background-image URL in inline style',
            message:
              'No valid URL found for background-image in inline style attribute.',
            target: getStyleSnippet(styleContent),
          });
          continue;
        }
        const linkError = await checkLinkValidity(content, url, config, file, startUrl);
        if (linkError && linkError.isError) {
          const isExternal = linkError.type === ISSUE_KEY.unreachableExtLink || linkError.type === ISSUE_KEY.invalidExtLink;
          results.push({
            isError: true,
            isWarning: false,
            type: linkError.type,
            reason:
              isExternal
                ? 'Invalid external background-image URL in inline style'
                : 'Invalid local background-image URL in inline style',
            message:
              isExternal
                ? 'External background-image URL is invalid or unreachable: '
                : 'Local background-image file is missing or invalid: ' + url,
            target: url,
          });
        }
      }
    }
  }
  return results.length > 0 ? results : null;
}
export async function validateStyleBlocks(item, content, config, file, startUrl) {
  let results = [];
  const styleTags = content.match(styleTagRegex) || [];

  if (config.htmlFiles === true) {
    for (const styleTag of styleTags) {
      const styleContent = Array.isArray(styleTag) ? styleTag[1] : styleTag;
      let bgMatch;
      bgUrlRegex.lastIndex = 0;
      while ((bgMatch = bgUrlRegex.exec(styleContent)) !== null) {
        const url = bgMatch[1] ? bgMatch[1].replace(/^['"]|['"]$/g, '') : '';
        if (!url || url.trim() === '') {
          results.push({
            isError: true,
            isWarning: false,
            reason: 'empty background-image url in style block',
            type: ISSUE_KEY.empty,
            message: 'no valid URL found for background-image in style block',
            target: getStyleSnippet(styleContent),
          });
          continue;
        }
        const linkError = await checkLinkValidity(content, url, config, file, startUrl);
        if (linkError && linkError.isError) {
          const isExternal = linkError.type === ISSUE_KEY.unreachableExtLink || linkError.type === ISSUE_KEY.invalidExtLink;
          results.push({
            isError: true,
            isWarning: false,
            reason:
              isExternal
                ? 'Invalid external background-image URL in style block'
                : 'Invalid local background-image URL in style block',
            message:
              isExternal
                ? 'External background-image URL is invalid or unreachable: '
                : 'Local background-image file is missing or invalid: ' + url,
            type: linkError.type || 'unknown',
            target: getStyleSnippet(styleContent),
          });
        }
      }
    }
  }
  return results.length > 0 ? results : null;
}

// Can expand and check other media types in the future (e.g. <video>, <audio>, <source>, etc.)