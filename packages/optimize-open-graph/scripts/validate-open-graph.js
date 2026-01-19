import { checkLinkValidity } from '@bynovl/optimize-lib/check-link-validity.js';
import { ISSUE_KEY } from '@bynovl/optimize-lib/issue-keys.js';

export async function validateOpenGraph(regex, item, content, name, isUrl, isRequired, customValidation, config, file, startUrl) {
    const matches = [...content.matchAll(regex)];

    let metaProperty = 'property';
    if (/^twitter:/i.test(name)) metaProperty = 'name';

    // Missing tag
    if (matches.length === 0) {
        if (!customValidation || !customValidation.check) {
            item.openGraph.results.push({
                target: `<meta ${metaProperty}="${name}">`,
                reason: `missing ${name}`,
                type: ISSUE_KEY.missing,
                isError: !!isRequired,
                isWarning: !isRequired,
                message: `include ${name} meta tag`,
            });
        }
    } else {
        // Duplicate check
        if (matches.length > 1) {
            item.openGraph.results.push({
                target: `<meta ${metaProperty}="${name}">`,
                reason: `duplicate ${name}`,
                type: ISSUE_KEY.duplicate,
                isError: !!isRequired,
                isWarning: !isRequired,
                message: `there is more than one ${name} meta tag`,
            });
        }
        // Exists but empty value
        for (const match of matches) {
            const value = match[1];
            if (!value || value.trim() === '') {
                item.openGraph.results.push({
                    target: `<meta ${metaProperty}="${name}">`,
                    type: ISSUE_KEY.empty,
                    reason: `${name} tag exists but it is empty`,
                    isError: !!isRequired,
                    isWarning: !isRequired,
                    message: `make sure to provide a value for ${name} meta tag`,
                });
            }
            // If this is a URL tag, validate the URL
            if (isUrl && value) {
                const linkError = await checkLinkValidity(content, value, config, file, startUrl);
                if (linkError && linkError.isError) {
                    item.openGraph.results.push({
                        target: `<meta ${metaProperty}="${name}">`,
                        type: linkError.type,
                        reason: 'invalid link',
                        isError: !!isRequired,
                        isWarning: !isRequired,
                        message: `Make sure the ${name} link at ${value} is valid and reachable`,
                    });
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
                            target: `<meta ${metaProperty}="${name}">`,
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
