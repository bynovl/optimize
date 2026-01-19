import { ISSUE_KEY } from '@bynovl/optimize-lib/issue-keys.js';

// Pass additional arguments to accept an array
// of additional checks for extensibility  
// easily check different types the result function 
// should return a issues.obj that includes a pre-defined   
// ISSUE_KEY and the following keys: target, reason, type (ISSUE_KEY), isError, isWarning, message

export function checkHeadingOrder(tagsArr, content) {
    let issues = [];
    let h1Count = 0;
    // Find the first heading (h1-h6) or paragraph (p) tag object
    let firstTag = tagsArr.find((t) => /^h[1-6]$|^p$/.test(t.tag));

    if (firstTag && firstTag.tag !== 'h1') {
        // Extract the text between the open and closing tag for firstTag using its index
        const tagName = firstTag.tag;
        // Find the open and close tag positions using the index from tagsArr
        const openTagRegex = new RegExp(`<${tagName}[^>]*>`, 'i');
        const closeTagRegex = new RegExp(`<\/${tagName}>`, 'i');
        const openMatch = openTagRegex.exec(content.slice(firstTag.index));
        let tagText = '';
        if (openMatch) {
            const openTagEnd = firstTag.index + openMatch[0].length;
            const closeMatch = closeTagRegex.exec(content.slice(openTagEnd));
            if (closeMatch) {
                tagText = content.slice(openTagEnd, openTagEnd + closeMatch.index).trim();
            }
        }
        issues.push({
            target: 'invalidFirstHeading',
            reason: 'first heading is not H1',
            type: ISSUE_KEY.invalid,
            isError: true,
            isWarning: false,
            message: `First heading is not <h1>. Found: <${tagName}> with text: "${tagText.slice(0, 80)}" instead.`
        });
    }

    // Track h1s and their container (section or div)
    let h1Containers = {};
    tagsArr.forEach((t) => {
        // Find all possible container tags in the content (non-heading tags)
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

    // Multiple h1s must be in separate containers
    if (h1Count > 1) {
        let badContainers = Object.values(h1Containers).filter(
            (count) => count > 1
        ).length;

        if (badContainers > 0) {
            issues.push({
                target: 'multipleH1Tags',
                reason: 'multiple H1 tags in the same container',
                type: ISSUE_KEY.duplicate,
                isError: true,
                isWarning: false,
                message:
                    'Multiple <h1> tags found in the same container. Each <h1> should be in its own <section> or <div>.',
            });
        }
    }

    // Check heading order (should not skip levels)
    let lastLevel = 0;
    tagsArr.forEach((t) => {
        if (/^h[1-6]$/.test(t.tag)) {
            let level = parseInt(t.tag[1]);
            if (lastLevel && level > lastLevel + 1) {
                issues.push({
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
    return issues;
}
