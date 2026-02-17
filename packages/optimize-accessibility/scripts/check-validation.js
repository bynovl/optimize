// helps target specific HTML sections
import { filterByHtmlSection } from '@bynovl/optimize-utils/filter-html.js';
import { validateItem } from '@bynovl/optimize-lib/check-item.js';
import { checkProps } from './check-props.js';
import { checkAltText, checkAriaRoles, checkAttrTag, checkTabIndex, checkLabelFor } from './check-patterns.js';

export async function validateCheck(item, content, config, file, startUrl) {
  // Validate the content of the HTML file based on your custom check logic.
  const filteredContent = filterByHtmlSection(content, 'body');

  // Define the checks for your custom check.
  const defaultTagChecks = [
    {
      name: "altText",
      regex: null,
      required: true,
      isUrl: true,
      customValidation: {
        check: checkAltText,
        args: [filteredContent]
      }
    },
    {
      name: "inputLabel",
      regex: null,
      required: true,
      isUrl: true,
      customValidation: {
        check: checkLabelFor,
        args: [filteredContent]
      }
    },
    {
      name: "aria",
      regex: null,
      required: true,
      isUrl: true,
      customValidation: {
        check: checkAriaRoles,
        args: [filteredContent]
      }
    },
    {
      name: "tabIndex",
      regex: null,
      required: true,
      isUrl: true,
      customValidation: {
        check: checkTabIndex,
        args: [filteredContent]
      }
    },
    {
      name: "attrTag",
      regex: null,
      required: true,
      isUrl: true,
      customValidation: {
        check: checkAttrTag,
        args: [filteredContent]
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
  // And the value is the checkProps.key of the check you want to label.
  const labels = {
    missingAriaRoles: 'aria',
    missingAltText: 'altText',
    missingTabIndex: 'tabIndex',
    missingLabelFor: 'inputLabel',
  };

  // Return the validated item and any labels for updating totals.
  return { validatedItem: item, labels };
}