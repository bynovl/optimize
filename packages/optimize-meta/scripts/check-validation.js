// helps target specific HTML sections
import { filterByHtmlSection } from '@bynovl/optimize-utils/filter-html.js';
import { ISSUE_KEY } from '@bynovl/optimize-lib/issue-keys.js';
import { validateItem } from '@bynovl/optimize-lib/check-item.js';
import { checkProps } from './check-props.js';
import { metaTitleRegex, metaDescRegex, metaKeywordsRegex, canonicalUrlRegex, robotsRegex, robotsValidation } from './check-patterns.js';

export async function validateCheck(item, content, config, file, startUrl) {
  // Validate the content of the HTML file based on your custom check logic.
  const filteredContent = filterByHtmlSection(content, 'head');

  // Define the checks for your custom check. 
  const defaultTagChecks = [
    { name: 'title', regex: metaTitleRegex, required: true },
    { name: 'description', regex: metaDescRegex, required: true },
    { name: 'keywords', regex: metaKeywordsRegex, required: false },
    { name: 'canonical', regex: canonicalUrlRegex, required: true, isUrl: true },
    {
      name: 'robots',
      regex: robotsRegex,
      required: false,
      customValidation: {
        check: robotsValidation,
        type: ISSUE_KEY.invalid,
        reason: 'robots tag contains noindex or nofollow',
        message: 'remove noindex/nofollow from robots meta tag',
      }
    },
  ];

  const customTagChecks = config.customChecks?.[checkProps.key] || [];

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
  // Assign Custom Label Names (optional)
  // Labels correspond to stats keys in results.
  // missingTitle, is labeled as 'title' for easier understanding
  let labels = {
    missingTitle: 'title',
    missingDescription: 'description',
    missingKeywords: 'keywords',
    missingCanonical: 'canonical',
    noIndexPages: 'noindex',
  };

  return { validatedItem: item, labels };
}
