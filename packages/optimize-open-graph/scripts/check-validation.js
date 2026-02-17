// helps target specific HTML sections
import { filterByHtmlSection } from '@bynovl/optimize-utils/filter-html.js';
import { validateItem } from '@bynovl/optimize-lib/check-item.js';
import { checkProps } from './check-props.js';
import { ogTitle, ogDesc, ogImage, ogUrl, twitterTitle, twitterDesc, twitterImage } from './check-patterns.js';

export async function validateCheck(item, content, config, file, startUrl) {
  // Validate the content of the HTML file based on your custom check logic.
  const filteredContent = filterByHtmlSection(content, 'html');

  // Define the checks for your custom check.
  const defaultTagChecks = [
    { name: 'og:title', regex: ogTitle, required: true },
    { name: 'og:description', regex: ogDesc, required: true },
    { name: 'og:image', regex: ogImage, required: true, isUrl: true },
    { name: 'og:url', regex: ogUrl, required: true, isUrl: true },
    { name: 'twitter:title', regex: twitterTitle, required: true },
    { name: 'twitter:description', regex: twitterDesc, required: true },
    { name: 'twitter:image', regex: twitterImage, required: true, isUrl: true },
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

  function toCapitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Create labels for reporting based on tag names
  const labels = {};
  for (const { name } of tagChecks) {
    const label = name.split(':');
    const labelKey =
      'missing' + toCapitalize(label[0]) + toCapitalize(label[1]);
    labels[labelKey] = name;
  }

  return { validatedItem: item, labels };
}
