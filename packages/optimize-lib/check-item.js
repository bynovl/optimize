import { ISSUE_KEY } from './issue-keys.js';
import { checkLinkValidity } from './check-link-validity.js';

export async function validateItem(regex, checkProps, item, content, checkName, isUrl, isRequired, message, reason, customValidation, config, file, startUrl) {
  const matches = [...content.matchAll(regex)];
  // Ensure item.results exists for customCheck
  if (!item[checkProps.key]) item[checkProps.key] = { results: [] };

  // If customValidation is present, use it for all <img> tag validation (robust logic)
  if (customValidation && typeof customValidation.check === 'function') {
    let customArgs = customValidation.args || [];
    try {
      const customResults = await customValidation.check(...customArgs);
      if (Array.isArray(customResults)) {
        for (const result of customResults) {
          if (result) item[checkProps.key].results.push(result);
        }
      } else if (customResults) {
        item[checkProps.key].results.push(customResults);
      }
    } catch (err) {
      item[checkProps.key].results.push({
        target: checkName,
        reason: `Error in customValidation: ${err.message}`,
        type: ISSUE_KEY.invalid,
        isError: true,
        isWarning: false,
        message: `Custom validation failed for ${checkName}: ${err.message}`,
      });
    }
    return;
  }

  if (matches.length === 0) {
    item[checkProps.key].results.push({
      target: checkName,
      reason: reason || `missing ${checkName}`,
      type: ISSUE_KEY.missing,
      isError: !!isRequired,
      isWarning: !isRequired,
      message: `${checkName} is required but was not found.`,
    });
  } else {
    // Duplicate
    if (matches.length > 1) {
      item[checkProps.key].results.push({
        target: checkName,
        reason: `duplicate ${checkName}`,
        type: ISSUE_KEY.duplicate,
        isError: !!isRequired,
        isWarning: !isRequired,
        message: `More than one ${checkName} found.`,
      });
    }
    // Exists but empty value
    for (const match of matches) {
      const value = match[1];
      if (!value || value.trim() === '') {
        item[checkProps.key].results.push({
          target: checkName,
          reason: reason || `${checkName} tag exists but it is empty`,
          type: ISSUE_KEY.empty,
          isError: !!isRequired,
          isWarning: !isRequired,
          message: `Provide a value for ${checkName}.`,
        });
      }
      // If this is a URL tag, validate the URL
      if (isUrl && value) {
        const linkError = await checkLinkValidity(content, value, config, file, startUrl);
        if (linkError && linkError.isError) {
          item[checkProps.key].results.push({
            target: checkName,
            type: linkError.type,
            reason: reason || linkError.reason || 'invalid link',
            isError: !!isRequired,
            isWarning: !isRequired,
            message: linkError.message || `The URL provided for ${checkName} is invalid.`,
          });
        }
      }
    }
  }
}

