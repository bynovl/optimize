// helps target specific HTML sections
import { filterByHtmlSection } from '@bynovl/optimize-utils/filter-html.js';
import { validateItem } from '@bynovl/optimize-lib/check-item.js';
import { checkProps } from './check-props.js';
import { validateImgTag, validateInlineStyles, validateStyleBlocks } from './check-patterns.js';

export async function validateCheck(item, content, config, file, startUrl) {
  // Validate the content of the HTML file based on your custom check logic.
  const filteredContent = filterByHtmlSection(content, 'body');

  // Define the checks for your custom check.
  const defaultTagChecks = [
    {
      name: '<img src="...">',
      regex: null,
      required: true,
      isUrl: true,
      customValidation: {
        check: validateImgTag,
        args: [filteredContent, config, file, startUrl]
      }
    },
    {
      name: 'style="background(-image)?: url(...)"',
      regex: null,
      required: false,
      isUrl: true,
      customValidation: {
        check: validateInlineStyles,
        args: [filteredContent, config, file, startUrl]
      }
    },
    {
      name: '<style>background(-image): url(...)</style>',
      regex: null,
      required: false,
      isUrl: true,
      customValidation: {
        check: validateStyleBlocks,
        args: [item, filteredContent, config, file, startUrl]
      }
    }
  ];

  const customTagChecks = config.extendChecks?.[checkProps.key] || [];
  const tagChecks = [...defaultTagChecks, ...customTagChecks];
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

  let labels = {}
  // Create custom properties/labels for each
  // The label is the key used in stats (e.g. missingTitle),
  // and the value is the tag name (e.g. 'title') assigned from tagCheck.name.
  // This value is used to match errors and aggregate stats for each tag.
  // For example, if the check is for missing title, the label would be 'missingTitle' and the value 'title'.
  labels = {
    totalImages: 'image',
    brokenInternal: 'internal',
    brokenExternal: 'external',
    brokenImages: 'image',
    emptyImgSrc: 'empty',
    missingImgSrc: 'missing',
    invalidImgSrc: 'invalid',
  };
  return { validatedItem: item, labels };
}
