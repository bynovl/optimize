import { ISSUE_KEY } from '@bynovl/optimize-lib/issue-keys.js';

// See Full list of supported roles
// https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles

// This is super important for accessibility
function checkAltText(content) {
    // Checks for missing or empty alt attributes on images
    const issues = [];
    const imgRegex = /<img\s+[^>]*>/gi;
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
            issues.push({
                target: 'alt',
                reason: 'missing alt',
                isError: true,
                isWarning: false,
                message: `Missing alt tag: ${imgTag}`,
                type: ISSUE_KEY.missing,
            });
        } else if (altMatch && altMatch[1].trim() === '') {
            issues.push({
                target: 'alt',
                reason: 'empty alt',
                type: ISSUE_KEY.empty,
                isError: true,
                isWarning: false,
                message: `Include an alt description: ${imgTag}`,
            });
        }
    }
    return issues;
}
// This is super important for accessibility
function checkLabelFor(content) {
    // Checks that every <input> has an associated <label for="">
    const issues = [];
    const inputRegex = /<input\s+[^>]*id=["']([^"']+)["'][^>]*>/gi;
    let match;
    while ((match = inputRegex.exec(content)) !== null) {
        const id = match[1];
        const labelRegex = new RegExp(`<label[^>]*for=["']${id}["']`, 'i');
        if (!labelRegex.test(content)) {
            issues.push({
                target: 'label',
                reason: 'missing label for input',
                type: ISSUE_KEY.missing,
                isError: true,
                isWarning: false,
                message: `<input id="${id}"> is missing a corresponding <label for="${id}">.`,
            });
        }
    }
    return issues;
}
// This is super important for accessibility
function checkAriaRoles(content) {
    // Checks for elements with role attribute and warns if role is empty or invalid
    const validRoles = [
        'banner',
        'navigation',
        'main',
        'complementary',
        'contentinfo',
        'region',
        'search',
        'form',
        'article',
        'alert',
        'dialog',
        'button',
        'checkbox',
        'img',
        'link',
        'listbox',
        'menu',
        'menubar',
        'menuitem',
        'option',
        'progressbar',
        'radio',
        'radiogroup',
        'scrollbar',
        'slider',
        'spinbutton',
        'switch',
        'tab',
        'tabpanel',
        'textbox',
        'timer',
        'tooltip',
        'tree',
        'treeitem',
        'list',
    ];
    const issues = [];
    const roleRegex = /<([a-z0-9]+)[^>]*\srole=["']([^"']*)["']/gi;
    let match;
    while ((match = roleRegex.exec(content)) !== null) {
        const tag = match[1];
        const role = match[2];
        if (!role) {
            issues.push({
                target: 'aria-role',
                reason: 'empty role',
                type: ISSUE_KEY.empty,
                isError: true,
                isWarning: false,
                message: `<${tag}> has an empty ARIA role.`,
            });
        } else if (!validRoles.includes(role)) {
            issues.push({
                target: 'aria-role',
                reason: 'invalid role',
                type: ISSUE_KEY.invalid,
                isError: true,
                isWarning: false,
                message: `<${tag}> has an invalid ARIA role: "${role}".`,
            });
        }
    }
    return issues;
}
// Checs if tabindex is non-zero or on non-interactive elements
function checkTabIndex(content) {
    // Only flag tabindex > 0 (custom tab order) as a warning.
    // Optionally, flag tabindex on non-interactive native elements (e.g., <div>, <span>) as a warning.
    const issues = [];
    const interactiveTags = ['button', 'input', 'select', 'textarea', 'a', 'area', 'summary'];
    const tabRegex = /<([a-z0-9]+)[^>]*tabindex=["']?(-?\d+)["']?/gi;
    let match;

    while ((match = tabRegex.exec(content)) !== null) {
        const tag = match[1];
        const tabindex = parseInt(match[2], 10);
        // Warn if tabindex > 0 (custom tab order)
        if (tabindex > 0) {
            issues.push({
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
            issues.push({
                target: 'tabindex',
                reason: 'tabindex on non-interactive element',
                type: ISSUE_KEY.invalid,
                isError: false,
                isWarning: true,
                message: `<${tag}> has tabindex attribute but is not a native interactive element.`,
            });
        }
    }
    return issues;
}
// Check custom attribute tag 
function checkAttrTag(content, tag, attr) {
    const issues = [];
    const attrRegex = new RegExp(`<${tag}[^>]*\s${attr}=["']([^"']*)["']`, 'gi');
    let match;
    while ((match = attrRegex.exec(content)) !== null) {
        const value = match[1];
        if (!value) {
            issues.push({
                target: attr,
                reason: 'empty attribute',
                type: ISSUE_KEY.empty,
                isError: true,
                isWarning: false,
                message: `<${tag}> has an empty ${attr} attribute.`,
            });
        }
    }
    return issues;
}
export {
    checkAltText,
    checkLabelFor,
    checkAriaRoles,
    checkTabIndex,
    checkAttrTag,
};
