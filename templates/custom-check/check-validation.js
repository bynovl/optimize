// helps target specific HTML sections
import { filterByHtmlSection } from '../optimize-utils/filter-html.js';
import { ISSUE_KEY } from '../optimize-lib/issue-keys.js';
import { checkProps } from './check-props.js';
import { metaLang, customValidation } from './validate-patterns.js';

// -- EXAMPLE CUSTOM VALIDATION FUNCTION ---
// The customValidation allows you to add any additional validation logic that is not covered by the regex, such as making an API call to validate a URL or checking the value against a list of allowed values. 

// It also allows you to define the error message and reason for the validation failure, which will be included in the results for better reporting and debugging.
// check, type, reason, message are all optional and can be defined based on the specific validation you want to perform. You can use ISSUE_KEY to define the type of issue (e.g., invalid, missing, duplicate) for better categorization in the results. Or use your own custom types if needed.
// ------------------------------------------
export async function validateCheck(item, content, config, file, startUrl) {
    // Validate the content of the HTML file based on your custom check logic.
    const filteredContent = filterByHtmlSection(content, 'body');

    // Define the checks for your custom check. 
    // Custom validation overrides the regex validation, so if both are defined, the custom validation will be used to determine if the check passes or fails.
    const defaultTagChecks = [
        {
            name: '<meta name="[tagname]">',
            regex: metaLang,
            required: true,
            isUrl: false,
            customValidation: {
                check: customValidation,
                type: ISSUE_KEY.invalid,
                reason: '[tagname] value is not valid',
                message: 'The [tagname] meta tag has an invalid value. Please ensure it follows the correct format and contains valid content.',
            }
        },
    ];

    // Check if there are checks defined in the config for this check 
    // and merge them with the default checks (aavoids mutation of defaultTagChecks).
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

    // Assign custom labels if needed 
    // Where the key is the custom label you want to use, 
    // And the value is the checkeProps.key of the check you want to label.
    const labels = {
        customLabel: 'customKeyValue',
    };


    // Return the validated item and any labels for updating totals.
    return { validatedItem: item, labels };
}