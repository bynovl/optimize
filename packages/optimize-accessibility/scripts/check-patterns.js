import { ISSUE_KEY } from '@bynovl/optimize-lib/issue-keys.js';
// See Full list of supported roles
// https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles

// REGEX 
const imgRegex = /<img\s+[^>]*>/gi;
const inputRegex = /<input\s+[^>]*id=["']([^"']+)["'][^>]*>/gi;
const ariaRoleRegex = /<([a-z0-9]+)[^>]*\srole=["']([^"']*)["']/gi;
const tabIndexRegex = /<([a-z0-9]+)[^>]*tabindex=["']?(-?\d+)["']?/gi;
const interactiveTags = ['button', 'input', 'select', 'textarea', 'a', 'area', 'summary'];
const validRoles = ['banner', 'navigation', 'main', 'complementary', 'contentinfo', 'region', 'search', 'form', 'article', 'alert', 'dialog', 'button', 'checkbox', 'img', 'link', 'listbox', 'menu', 'menubar', 'menuitem', 'option', 'progressbar', 'radio', 'radiogroup', 'scrollbar', 'slider', 'spinbutton', 'switch', 'tab', 'tabpanel', 'textbox', 'timer', 'tooltip', 'tree', 'treeitem', 'list'];

// Custom validation functions for accessibility check
export function checkAltText(content) {
  // Checks for missing or empty alt attributes on images
  const results = [];
  const imgs = content.match(imgRegex) || [];
  for (const imgTag of imgs) {
    // Skip images with data: src (likely presentational)
    const srcMatch = imgTag.match(/\bsrc\s*=\s*(["'])(.*?)\1/i);
    const srcValue = srcMatch && typeof srcMatch[2] === 'string' ? srcMatch[2].trim() : '';
    if (srcValue.startsWith('data:')) {
      continue;
    }
    const altMatch = imgTag.match(/\salt=["']([^"']*)["']/i);
    const hasAlt = imgTag.includes('alt=');
    if (!hasAlt) {
      results.push({
        target: 'alt',
        reason: 'missing alt',
        isError: true,
        isWarning: false,
        message: `Missing alt tag: ${imgTag}`,
        type: ISSUE_KEY.missing,
      });
    } else if (altMatch && altMatch[1].trim() === '') {
      results.push({
        target: 'alt',
        reason: 'empty alt',
        type: ISSUE_KEY.empty,
        isError: true,
        isWarning: false,
        message: `Include an alt description: ${imgTag}`,
      });
    }
  }
  return results.length > 0 ? results : null;
}
// Input Label Checks
export function checkLabelFor(content) {
  // Checks that every <input> has an associated <label for="">
  const results = [];
  let match;
  while ((match = inputRegex.exec(content)) !== null) {
    const id = match[1];
    const labelRegex = new RegExp(`<label[^>]*for=["']${id}["']`, 'i');
    if (!labelRegex.test(content)) {
      results.push({
        target: 'label',
        reason: 'missing label for input',
        type: ISSUE_KEY.missing,
        isError: true,
        isWarning: false,
        message: `<input id="${id}"> is missing a corresponding <label for="${id}">.`,
      });
    }
  }
  return results.length > 0 ? results : null;
}
// ARIA Role Checks
export function checkAriaRoles(content) {
  // Checks for elements with role attribute and warns if role is empty or invalid

  const results = [];
  let match;
  while ((match = ariaRoleRegex.exec(content)) !== null) {
    const tag = match[1];
    const role = match[2];
    if (!role) {
      results.push({
        target: 'aria-role',
        reason: 'empty role',
        type: ISSUE_KEY.empty,
        isError: true,
        isWarning: false,
        message: `<${tag}> has an empty ARIA role.`,
      });
    } else if (!validRoles.includes(role)) {
      results.push({
        target: 'aria-role',
        reason: 'invalid role',
        type: ISSUE_KEY.invalid,
        isError: true,
        isWarning: false,
        message: `<${tag}> has an invalid ARIA role: "${role}".`,
      });
    }
  }
  return results.length > 0 ? results : null;
}
// Checs if tabindex is non-zero or on non-interactive elements
export function checkTabIndex(content) {
  // Only flag tabindex > 0 (custom tab order) as a warning.
  // Optionally, flag tabindex on non-interactive native elements (e.g., <div>, <span>) as a warning.
  const results = [];
  let match;
  while ((match = tabIndexRegex.exec(content)) !== null) {
    const tag = match[1];
    const tabindex = parseInt(match[2], 10);
    // Warn if tabindex > 0 (custom tab order)
    if (tabindex > 0) {
      results.push({
        target: 'tabindex',
        reason: 'tabindex > 0 (custom tab order)',
        type: ISSUE_KEY.invalid,
        isError: false,
        isWarning: true,
        message: `<${tag}> has tabindex="${tabindex}" (custom tab order is discouraged).`,
      });
    }
    // Warn if tabindex is present on non-interactive native elements
    if (!interactiveTags.includes(tag)) {
      results.push({
        target: 'tabindex',
        reason: 'tabindex on non-interactive element',
        type: ISSUE_KEY.invalid,
        isError: false,
        isWarning: true,
        message: `<${tag}> has tabindex attribute but is not a native interactive element.`,
      });
    }
  }
  return results.length > 0 ? results : null;
}
// Check custom attribute tag 
export function checkAttrTag(content, tag, attr) {
  const results = [];
  const attrRegex = new RegExp(`<${tag}[^>]*\s${attr}=["']([^"']*)["']`, 'gi');
  let match;
  while ((match = attrRegex.exec(content)) !== null) {
    const value = match[1];
    if (!value) {
      results.push({
        target: attr,
        reason: 'empty attribute',
        type: ISSUE_KEY.empty,
        isError: true,
        isWarning: false,
        message: `<${tag}> has an empty ${attr} attribute.`,
      });
    }
  }
  return results.length > 0 ? results : null;
}