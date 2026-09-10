// Validation helper for a custom check.  This module
// exports a single `validateCheck` function which is called from
// the main check runner (index.js) for every HTML file.
//
// It receives the current result item, the file content, config
// and path information, then applies one or more tag checks and
// augments the item with any findings.

import { filterByHtmlSection } from '@bynovl/optimize-utils/filter-html.js';
import { ISSUE_KEY } from '@bynovl/optimize-lib/issue-keys.js';
import { validateItem } from '@bynovl/optimize-lib/check-item.js';
import { checkProps } from './check-props.js';
import { customRegex, customValidation } from './check-patterns.js';

// customValidation is an optional callback defined in check-patterns
// that either overrides the default regex behaviour or performs
// deeper domain-specific checks (e.g. verifying an ISO code value).
// It should return a result object when an issue is detected.

export async function validateCheck(item, content, config, file, startUrl) {
    // Decide what subset of the HTML to inspect; some checks only
    // care about <head> or <body> sections. Uncomment/adjust filter
    // const filteredContent = filterByHtmlSection(content, 'html');
    const filteredContent = content;

    // Build the list of tag-based checks to run.  `defaultTagChecks`
    // contains the patterns for this check; additional rules can be
    // provided by user configuration and are concatenated below.
    // If a `customValidation` object is supplied, it completely
    // overrides the regex for that rule.
    // Can include any number of objects with the following properties:
    //   - name (required): label for the check, shown in results
    //   - regex (required if no customValidation): pattern to match in the HTML
    //   - required (optional, default false): whether this check must be present or it's just a warning
    //   - isUrl (optional, default false): whether the matched value is a URL that should be extracted and validated separately
    //   - message (optional): custom message to show when this check fails; otherwise a default message will be generated based on the name and reason.
    //   - reason (optional): a short string identifier for why the check failed, used in reporting and can be used for custom messaging. Default is 'pattern not found'.
    //   - customValidation (optional): an object with a `check` function that performs validation and returns a result object if an issue is found. If provided, this function is responsible for all validation logic for this rule.
    
    const defaultTagChecks = [
        {
            name: '<html> lang attribute', // label shown in results
            regex: customRegex,
            required: true,
            isUrl: false,
            customValidation: {
                check: customValidation,
                // pass whatever arguments your validator needs
                args: [filteredContent, config, file, startUrl]
            }
        },
    ];

    const customTagChecks = config.customChecks?.[checkProps.key] || [];
    const tagChecks = [...defaultTagChecks, ...customTagChecks];

    // Process each tag check sequentially to avoid overwhelming the system 
    // with too many concurrent requests.
    for (const tagCheck of tagChecks) {
        await validateItem(
            tagCheck.regex,
            checkProps,
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
    }

    // Assign custom labels if needed OR return an empty object if no custom labels are needed for this check.)
    const labels = {}; // Example of defining custom labels for the check results. 
    // Replace with actual labels as needed for your check. 
    // The keys should be the label names you want to use, and the values should correspond 
    // to the checkProps.key of the check they are labeling. This allows you to categorize 
    // and summarize results based on these labels in the final report.
    
    // const labels = {
    //     customLabel: 'customKeyValue',
    // };

    // Return the validated item and any labels for updating totals.
    return { validatedItem: item, labels };
}