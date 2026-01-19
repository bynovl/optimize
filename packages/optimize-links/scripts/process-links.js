import { checkLinkValidity } from "@bynovl/optimize-lib/check-link-validity.js";

export async function processLinksConcurrently(type, links, options) {
  const { content, config, file, startUrl, item } = options;
  // Process links concurrently with a limit of size
  const linksArr = [...links];
  let idx = 0;
  async function worker() {
    while (idx < linksArr.length) {
      const href = linksArr[idx++];
      const linkError = await checkLinkValidity(content, href, config, file, startUrl);
      if (linkError && linkError.isError) {
        item[type].results.push({
          isError: true,
          isWarning: false,
          reason: linkError.reason || 'Invalid link',
          message: linkError.message || '',
          target: href,
          type: linkError.type,
        });
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(config.processingSize, linksArr.length) }, worker));
}

export async function processLinksMax(type, links, options) {
  const { content, config, file, startUrl, item } = options;
  // Only process up to max links (size) links
  const linksArr = [...links].slice(0, config.processingSize);
  for (const href of linksArr) {
    const linkError = await checkLinkValidity(content, href, config, file, startUrl);
    if (linkError && linkError.isError) {
      item[type].results.push({
        isError: true,
        isWarning: false,
        reason: linkError.reason || 'Invalid link',
        message: linkError.message || '',
        target: href,
        type: linkError.type,
      });
    }
  }
}

export async function processLinksDefault(type, links, options) {
  const { item, content, config, file, startUrl } = options;

  // Process all links without limit
  for (const href of links) {
    const linkError = await checkLinkValidity(content, href, config, file, startUrl);
    if (linkError && linkError.isError) {
      item[type].results.push({
        isError: true,
        isWarning: false,
        reason: linkError.reason || 'Invalid link',
        message: linkError.message || '',
        target: href,
        type: linkError.type,
      });
    }
  }
}

export async function processLinks(type, links, options) {
  const method = options.config.processingType || 'default';
  if (method === 'concurrent') {
    await processLinksConcurrently(type, links, options);
  } else if (method === 'max') {
    await processLinksMax(type, links, options);
  } else {
    await processLinksDefault(type, links, options);
  }
}