// helps target specific HTML sections
import { filterByHtmlSection } from '../optimize-utils/filter-html.js';
import { ISSUE_KEY } from '../optimize-lib/issue-keys.js';
import { checkLinkValidity } from '../optimize-lib/check-link-validity';
import { exampleRegex, exampleRegex2, customValidationFunction } from './validate-patterns.js';

// If you have custom validatic logic  
// you can pass the tag name, regex to check for, and a customValidation function that will be called with the matches, config, and file as parameters.
// The customValidation function should return an object with isValid (boolean) and message (string) properties.
// For example, you might want to check that a URL in a tag is valid and returns a 200 status code.

export async function validateCheck(item, content, config, file, startUrl) {

    // Validate the content of the HTML file based on your custom check logic.
    const filteredContent = filterByHtmlSection(content, 'body');

    // Define the checks for your custom check. 
    // Each check should include the name, regex to validate against, whether it is required, whether it is a URL, and any custom validation logic or messages.
    // Minimal 1 check, but you can have as many as needed for your custom check.
    const tagChecks = [
        { name: 'example', regex: exampleRegex, required: true, isUrl: true, message: 'some message', reason: 'some reason', customValidation: customValidationFunction },
        { name: 'example2', regex: exampleRegex2, required: true, isUrl: true, message: 'another message', reason: 'some reason' },
    ];
    // Your validation logic for each check goes here.
    for (const tagCheck of tagChecks) {
        await validateItem(
            tagCheck.regex,
            item,
            filteredContent,
            tagCheck.name,
            tagCheck.isUrl,
            tagCheck.required,
            tagCheck.message,
            tagCheck.reason,
            tagCheck.customValidation,
            config,
            file,
            startUrl
        );
    };

    function toCapitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    // Build stats labels for Custom Check tags (optional)
    const labels = {};
    for (const { name } of tagChecks) {
        const label = name.split(':');
        const labelKey =
            'missing' + toCapitalize(label[0]) + toCapitalize(label[1]);
        labels[labelKey] = name;
    }

    return { validatedItem: item, labels };
}

// ValidateItem is a helper function that performs 
// the actual validation for each check based on the provided:
// regex, URL validation, and custom validation logic.

async function validateItem(regex, item, content, checkName, isUrl, isRequired, customValidation, message, reason, config, file, startUrl) {
    const matches = [...content.matchAll(regex)];
    // Ensure item.results exists for customCheck
    if (!item.customCheck) item.customCheck = { results: [] };

    // Missing
    if (matches.length === 0 && required) {
        item.customCheck.results.push({
            target: checkName,
            reason: reason || `missing ${checkName}`,
            type: ISSUE_KEY.missing,
            isError: !!isRequired,
            isWarning: !isRequired,
            message: message || `${checkName} is required but was not found.`,
        });
        return;
    }
    // Duplicate
    if (matches.length > 1) {
        item.customCheck.results.push({
            target: checkName,
            reason: `duplicate ${checkName}`,
            type: ISSUE_KEY.duplicate,
            isError: !!isRequired,
            isWarning: !isRequired,
            message: message || `More than one ${checkName} found.`,
        });
    }
    // Empty
    for (const match of matches) {
        if (!match[1] || match[1].trim().length === 0) {
            item.customCheck.results.push({
                target: checkName,
                reason: reason || `${checkName} tag exists but it is empty`,
                type: ISSUE_KEY.empty,
                isError: !!isRequired,
                isWarning: !isRequired,
                message: message || `Provide a value for ${checkName}.`,
            });
        }
    }
    // URL validation (if isUrl)
    if (isUrl) {
        for (const match of matches) {
            const urlValue = match[1];
            if (urlValue) {
                // Placeholder: implement actual URL validation logic or call a utility
                const linkError = await checkLinkValidity(content, urlValue, config, file, startUrl);
                if (linkError && linkError.isError) {
                    item.customCheck.results.push({
                        target: checkName,
                        type: linkError.type,
                        reason: reason || linkError.reason || 'invalid link',
                        isError: !!isRequired,
                        isWarning: !isRequired,
                        message: message || linkError.message || `The URL provided for ${checkName} is invalid.`,
                    });
                }
            }
        }
    }
    // Custom validation
    if (typeof customValidation === 'function') {
        for (const match of matches) {
            const validationResult = customValidation(match, config, file);
            if (!validationResult.isValid) {
                item.customCheck.results.push({
                    target: checkName,
                    reason: validationResult.reason || `custom validation failed for ${checkName}`,
                    type: ISSUE_KEY.invalid,
                    isError: !!isRequired,
                    isWarning: !isRequired,
                    message: validationResult.message || `Custom validation failed for ${checkName}`,
                });
            }
        }
    }
}