import { checkLinkValidity } from '@bynovl/optimize-lib/check-link-validity.js';
import { ISSUE_KEY } from '@bynovl/optimize-lib/issue-keys.js';

/**
 * @param {RegExp} regex
 * @param {object} item
 * @param {string} content
 * @param {string} name
 * @param {boolean} isUrl
 * @param {object} config
 * @param {string} file
 * @param {string} startUrl
 * @param {function|RegExp} [customCheck] - Optional custom check function or pattern for tag value(s)
 **/

export async function validateTag(regex, item, content, name, isUrl, isRequired, customValidation, config, file, startUrl) {
    // Use content directly as the search area since it is already filtered
    const matches = [...content.matchAll(regex)];
    // Unified logic for all meta tags, including title
    if (matches.length === 0) {
        if (!customValidation || !customValidation.check) {
            item.meta.results.push({
                target: `<meta name="${name}">`,
                reason: name === 'title' ? 'missing page title' : `missing ${name}`,
                type: ISSUE_KEY.missing,
                isError: !!isRequired,
                isWarning: !isRequired,
                message: name === 'title' ? 'include <title> meta' : `include ${name}`,
            });
        }
    } else {
        // Check for duplicates
        if (matches.length > 1) {
            item.meta.results.push({
                target: `<meta name="${name}">`,
                reason: `duplicate ${name}`,
                type: ISSUE_KEY.duplicate,
                isError: !!isRequired,
                isWarning: !isRequired,
                message: `there is more than one ${name} meta`,
            });
        }
        // Check for empty content (only push one error per empty tag occurrence)
        for (const match of matches) {
            if (!match[1] || match[1].trim().length === 0) {
                item.meta.results.push({
                    target: `<meta name="${name}">`,
                    type: ISSUE_KEY.empty,
                    reason: `${name} tag exists but it is empty`,
                    isError: !!isRequired,
                    isWarning: !isRequired,
                    message: `make sure to provide a value for ${name} meta`,
                });
            }
        }
        // If this is a URL tag, validate the URL (more flexible, like validate-open-graph.js)
        if (isUrl) {
            for (const match of matches) {
                const urlValue = match[1];
                if (match[1]) {
                    const linkError = await checkLinkValidity(content, urlValue, config, file, startUrl);
                    if (linkError && linkError.isError) {
                        item.meta.results.push({
                            target: `<meta name="${name}">`,
                            type: linkError.type,
                            reason: 'invalid link',
                            isError: !!isRequired,
                            isWarning: !isRequired,
                            message: `Make sure the ${name} link at ${urlValue} is valid and reachable`,
                        });
                    }
                }
            }
        }
        // If customValidation is provided, use it for custom validation (e.g., robots) IN ADDITION to other checks
        if (customValidation && (typeof customValidation.check === 'function' || customValidation.check instanceof RegExp)) {
            for (const match of matches) {
                if (match[1]) {
                    const value = match[1];
                    let customResult = false;
                    if (typeof customValidation.check === 'function') {
                        customResult = customValidation.check(value);
                    } else if (customValidation.check instanceof RegExp) {
                        customResult = customValidation.check.test(value);
                    }
                    if (customResult) {
                        item.meta.results.push({
                            target: `<meta name="${name}">`,
                            reason: customValidation.reason,
                            type: customValidation.type || ISSUE_KEY.invalid,
                            isError: !!isRequired,
                            isWarning: !isRequired,
                            message: customValidation.message
                        });
                    }
                }
            }
        }
    }
}