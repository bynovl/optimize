// Given a tag object {tag, index} and HTML content, find the nearest container (open/close) for any possible container tag
// Returns a string like `${containerTag}-${lastOpenIndex}-${nextCloseIndex}` or undefined if not found
// Simple flat regex traversal without nesting
export function findContainerIndexForTag(t, content) {
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
    for (const containerTag of possibleContainers) {
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
            return `${containerTag}-${lastOpenIndex}-${nextCloseIndex}`;
        }
    }
    return undefined;
}

export function extractTags(content, tags) {
    // Returns an array of { tag, index, containerIndex }
    const regex = new RegExp(`<(${tags.join('|')})(\\s|>)`, 'gi');
    let match,
        result = [];
    let containerIndex = -1;
    while ((match = regex.exec(content)) !== null) {
        const tag = match[1].toLowerCase();
        if (tag === 'section' || tag === 'div') {
            containerIndex++;
        }
        result.push({ tag, index: match.index, containerIndex });
    }
    return result;
}