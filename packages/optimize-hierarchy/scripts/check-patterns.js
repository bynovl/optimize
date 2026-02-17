import { ISSUE_KEY } from '@bynovl/optimize-lib/issue-keys.js';
import { filterByHtmlSection } from '@bynovl/optimize-utils/filter-html.js';
import { extractTags } from '@bynovl/optimize-utils/extract-tags.js';

// Extract headings and paragraphs
const tagsArr = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p'];

// Makess functions that check patterns more efficient by filtering the content once 
// and passing the relevant parts to each check function, instead of each function filtering the content separately. 
// This is especially beneficial for larger HTML files, as it reduces redundant processing and speeds up the overall validation process.  
export function sanitizedContent(rawContent) {
  const filteredContent = filterByHtmlSection(rawContent, 'html');
  const filteredContentByTags = extractTags(rawContent, tagsArr);
  return { filteredContentByTags, filteredContent }
}

// Check if first heading is an H1
export function checkFirstHeading(content) {
  const { filteredContentByTags } = sanitizedContent(content);
  const results = [];
  let firstTag = filteredContentByTags.find((t) => /^h[1-6]$|^p$/.test(t.tag));
  if (firstTag && firstTag.tag !== 'h1') {
    const tagName = firstTag.tag;
    const openTagRegex = new RegExp(`<${tagName}[^>]*>`, 'i');
    const closeTagRegex = new RegExp(`</${tagName}>`, 'i');
    const openMatch = openTagRegex.exec(content.slice(firstTag.index));
    let tagText = '';
    if (openMatch) {
      const openTagEnd = firstTag.index + openMatch[0].length;
      const closeMatch = closeTagRegex.exec(content.slice(openTagEnd));
      if (closeMatch) {
        tagText = content.slice(openTagEnd, openTagEnd + closeMatch.index).trim();
      }
    }
    results.push({
      target: 'invalidFirstHeading',
      reason: 'first heading is not H1',
      type: ISSUE_KEY.invalid,
      isError: true,
      isWarning: false,
      message: `First heading is not <h1>. Found: <${tagName}> with text: "${tagText.slice(0, 80)}" instead.`
    });
  }
  return results;
}

// Check if there are multiple H1 tags in the same container
export function checkMultipleH1(content) {
  const { filteredContentByTags } = sanitizedContent(content);
  let results = [];
  let h1Count = 0;
  let h1Containers = {};
  filteredContentByTags.forEach((t) => {
    const tagRegex = /<([a-zA-Z0-9\-]+)(\s|>)/g;
    let possibleContainers = new Set();
    let match;
    while ((match = tagRegex.exec(content)) !== null) {
      const tagName = match[1].toLowerCase();
      if (!/^h[1-6]$/.test(tagName)) {
        possibleContainers.add(tagName);
      }
    }
    possibleContainers.forEach((containerTag) => {
      const openTagRegex = new RegExp(`<${containerTag}(\\s|>)`, 'gi');
      const closeTagRegex = new RegExp(`</${containerTag}\\s*>`, 'gi');
      let lastOpenIndex = -1;
      let nextCloseIndex = content.length + 1;
      let openMatch;
      while ((openMatch = openTagRegex.exec(content)) !== null) {
        if (openMatch.index < t.index) {
          lastOpenIndex = openMatch.index;
        } else {
          break;
        }
      }
      let closeMatch;
      while ((closeMatch = closeTagRegex.exec(content)) !== null) {
        if (closeMatch.index > t.index) {
          nextCloseIndex = closeMatch.index;
          break;
        }
      }
      if (lastOpenIndex !== -1 && nextCloseIndex !== content.length + 1) {
        t.containerIndex = `${containerTag}-${lastOpenIndex}-${nextCloseIndex}`;
      }
    });
    if (t.tag === 'h1') {
      h1Count++;
      if (!h1Containers[t.containerIndex]) h1Containers[t.containerIndex] = 0;
      h1Containers[t.containerIndex]++;
    }
  });
  if (h1Count > 1) {
    let badContainers = Object.values(h1Containers).filter((count) => count > 1).length;
    if (badContainers > 0) {
      results.push({
        target: 'multipleH1Tags',
        reason: 'multiple H1 tags in the same container',
        type: ISSUE_KEY.duplicate,
        isError: true,
        isWarning: false,
        message: 'Multiple <h1> tags found in the same container. Each <h1> should be in its own <section> or <div>.',
      });
    }
  }
  return results;
}

// Check Heading order (e.g. no skipping from h2 to h4) - this is a common hierarchy issue that can be easily checked with the filtered content by tags.
export function checkHeadingOrder(content) {
  const { filteredContentByTags } = sanitizedContent(content);
  let results = [];
  let lastLevel = 0;
  filteredContentByTags.forEach((t) => {
    if (/^h[1-6]$/.test(t.tag)) {
      let level = parseInt(t.tag[1]);
      if (lastLevel && level > lastLevel + 1) {
        results.push({
          target: 'invalidHeadingOrder',
          reason: 'skippedLevel',
          type: ISSUE_KEY.invalid,
          isError: true,
          isWarning: false,
          message: `Heading level jumps from <h${lastLevel}> to <${t.tag}>. Headings should follow a logical order without skipping levels.`,
        });
      }
      lastLevel = level;
    }
  });
  return results;
}
