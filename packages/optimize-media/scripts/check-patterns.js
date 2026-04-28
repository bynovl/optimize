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

// Validate <embed src> URLs
export async function validateEmbedSrc(content, config, file, startUrl) {
  const results = [];
  if (!Array.isArray(config.mediaTypes) || !config.mediaTypes.includes('embed')) return null;
  // Match all <embed> tags with a src attribute (including empty)
  const embedTags = content.match(/<embed\b[^>]*src=["'][^"']*["'][^>]*>/gi) || [];
  for (const tag of embedTags) {
    const srcMatch = tag.match(/\bsrc\s*=\s*(["'])(.*?)\1/i);
    const src = srcMatch && typeof srcMatch[2] === 'string' ? srcMatch[2].trim() : '';
    if (!src) {
      results.push({
        target: '<embed>',
        reason: 'missing embed src attribute',
        type: ISSUE_KEY.missing,
        isError: true,
        isWarning: false,
        message: 'embed tag is missing src attribute.',
      });
      continue;
    }
    if (src.startsWith('data:')) continue;
    const linkError = await checkLinkValidity(content, src, config, file, startUrl);
    if (linkError && linkError.isError) {
      const isExternal = linkError.type === ISSUE_KEY.unreachableExtLink || linkError.type === ISSUE_KEY.invalidExtLink;
      results.push({
        isError: true,
        isWarning: false,
        reason: isExternal ? 'Invalid external embed src' : 'Invalid local embed src',
        type: linkError.type,
        message: (isExternal ? 'External embed src is invalid or unreachable: ' : 'Local embed file is missing or invalid: ') + src,
        target: src,
      });
    }
  }
  return results.length > 0 ? results : null;
}

// Custom validation functions for media check
export async function validateImgTag(content, config, file, startUrl) {
  const results = [];
  if (!Array.isArray(config.mediaTypes) || !config.mediaTypes.includes('img')) return null;
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
// Validate <audio src> URLs
export async function validateAudioSrc(content, config, file, startUrl) {
  const results = [];
  if (!Array.isArray(config.mediaTypes) || !config.mediaTypes.includes('audio')) return null;
  // Match all <audio> tags with a src attribute (including empty)
  const audioTags = content.match(/<audio\b[^>]*src=["'][^"']*["'][^>]*>/gi) || [];
  for (const tag of audioTags) {
    const srcMatch = tag.match(/\bsrc\s*=\s*(["'])(.*?)\1/i);
    const src = srcMatch && typeof srcMatch[2] === 'string' ? srcMatch[2].trim() : '';
    if (!src) {
      results.push({
        target: '<audio>',
        reason: 'missing audio src attribute',
        type: ISSUE_KEY.missing,
        isError: true,
        isWarning: false,
        message: 'audio tag is missing src attribute.',
      });
      continue;
    }
    const linkError = await checkLinkValidity(content, src, config, file, startUrl);
    if (linkError && linkError.isError) {
      results.push({
        isError: true,
        isWarning: false,
        reason: 'Invalid local audio src',
        type: ISSUE_KEY.invalid,
        message: 'Local audio file is missing or invalid: ' + src,
        target: src,
      });
    }
  }
  return results.length > 0 ? results : null;
}

// Validate <video src> URLs
export async function validateVideoSrc(content, config, file, startUrl) {
  const results = [];
  if (!Array.isArray(config.mediaTypes) || !config.mediaTypes.includes('video')) return null;
  // Match all <video> tags with a src attribute (including empty)
  const videoTags = content.match(/<video\b[^>]*src=["'][^"']*["'][^>]*>/gi) || [];
  for (const tag of videoTags) {
    const srcMatch = tag.match(/\bsrc\s*=\s*(["'])(.*?)\1/i);
    const src = srcMatch && typeof srcMatch[2] === 'string' ? srcMatch[2].trim() : '';
    if (!src) {
      results.push({
        target: '<video>',
        reason: 'missing video src attribute',
        type: ISSUE_KEY.missing,
        isError: true,
        isWarning: false,
        message: 'video tag is missing src attribute.',
      });
      continue;
    }
    const linkError = await checkLinkValidity(content, src, config, file, startUrl);
    if (linkError && linkError.isError) {
      results.push({
        isError: true,
        isWarning: false,
        reason: 'Invalid local video src',
        type: ISSUE_KEY.invalid,
        message: 'Local video file is missing or invalid: ' + src,
        target: src,
      });
    }
  }
  return results.length > 0 ? results : null;
}

// Validate <source srcset> URLs in <picture> or <video>
export async function validateSourceSrcset(content, config, file, startUrl) {
  const results = [];
  if (!Array.isArray(config.mediaTypes) || !config.mediaTypes.includes('source')) return null;
  const sourceTags = content.match(/<source\b[^>]*srcset=["'][^"']+["'][^>]*>/gi) || [];
  for (const tag of sourceTags) {
    const srcsetMatch = tag.match(/\bsrcset\s*=\s*(["'])(.*?)\1/i);
    const srcset = srcsetMatch && srcsetMatch[2];
    if (srcset) {
      // srcset can be multiple URLs separated by comma
      const urls = srcset.split(',').map(s => s.trim().split(' ')[0]);
      for (const url of urls) {
        if (url) {
          const linkError = await checkLinkValidity(content, url, config, file, startUrl);
          if (linkError && linkError.isError) {
            results.push({
              isError: true,
              isWarning: false,
              reason: 'Invalid local source srcset',
              type: ISSUE_KEY.invalid,
              message: 'Local source file is missing or invalid: ' + url,
              target: url,
            });
          }
        }
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
// Validate <object data> and type
export async function validateObjectData(content, config, file, startUrl) {
  const results = [];
  if (!Array.isArray(config.mediaTypes) || !config.mediaTypes.includes('object')) return null;
  // Match all <object> tags with a data attribute (including empty)
  const objectTags = content.match(/<object\b[^>]*>/gi) || [];
  for (const tag of objectTags) {
    // Check for type attribute
    const typeMatch = tag.match(/\btype\s*=\s*(["'])(.*?)\1/i);
    if (!typeMatch || !typeMatch[2].trim()) {
      results.push({
        target: '<object>',
        reason: 'missing object type attribute',
        type: ISSUE_KEY.missing,
        isError: true,
        isWarning: false,
        message: 'object tag is missing type attribute.',
      });
    }
    // Check for data attribute
    const dataMatch = tag.match(/\bdata\s*=\s*(["'])(.*?)\1/i);
    const data = dataMatch && typeof dataMatch[2] === 'string' ? dataMatch[2].trim() : '';
    if (!data) {
      results.push({
        target: '<object>',
        reason: 'missing object data attribute',
        type: ISSUE_KEY.missing,
        isError: true,
        isWarning: false,
        message: 'object tag is missing data attribute.',
      });
      continue;
    }
    if (data.startsWith('data:')) continue;
    const linkError = await checkLinkValidity(content, data, config, file, startUrl);
    if (linkError && linkError.isError) {
      const isExternal = linkError.type === ISSUE_KEY.unreachableExtLink || linkError.type === ISSUE_KEY.invalidExtLink;
      results.push({
        isError: true,
        isWarning: false,
        reason: isExternal ? 'Invalid external object data' : 'Invalid local object data',
        type: linkError.type,
        message: (isExternal ? 'External object data is invalid or unreachable: ' : 'Local object file is missing or invalid: ') + data,
        target: data,
      });
    }
  }
  return results.length > 0 ? results : null;
}

// Validate <iframe src>
export async function validateIframeSrc(content, config, file, startUrl) {
  const results = [];
  if (!Array.isArray(config.mediaTypes) || !config.mediaTypes.includes('iframe')) return null;
  // Match all <iframe> tags with a src attribute (including empty)
  const iframeTags = content.match(/<iframe\b[^>]*src=["'][^"']*["'][^>]*>/gi) || [];
  for (const tag of iframeTags) {
    const srcMatch = tag.match(/\bsrc\s*=\s*(["'])(.*?)\1/i);
    const src = srcMatch && typeof srcMatch[2] === 'string' ? srcMatch[2].trim() : '';
    if (!src) {
      results.push({
        target: '<iframe>',
        reason: 'missing iframe src attribute',
        type: ISSUE_KEY.missing,
        isError: true,
        isWarning: false,
        message: 'iframe tag is missing src attribute.',
      });
      continue;
    }
    if (src.startsWith('data:')) continue;
    const linkError = await checkLinkValidity(content, src, config, file, startUrl);
    if (linkError && linkError.isError) {
      const isExternal = linkError.type === ISSUE_KEY.unreachableExtLink || linkError.type === ISSUE_KEY.invalidExtLink;
      results.push({
        isError: true,
        isWarning: false,
        reason: isExternal ? 'Invalid external iframe src' : 'Invalid local iframe src',
        type: linkError.type,
        message: (isExternal ? 'External iframe src is invalid or unreachable: ' : 'Local iframe file is missing or invalid: ') + src,
        target: src,
      });
    }
  }
  return results.length > 0 ? results : null;
}