import { ISSUE_KEY } from './issue-keys.js';
import { checkLinkValidity } from './check-link-validity.js';

export async function validateItem(regex, checkProps, item, content, checkName, isUrl, isRequired, message, reason, customValidation, config, file, startUrl) {
  const matches = regex ? [...content.matchAll(regex)] : [];
  if (!item[checkProps.key]) item[checkProps.key] = { results: [] };

  // Skip regex-based matching and run custom validation directly when regex is not provided but customValidation is defined.
  if (customValidation && regex == null) {
    await runCustomValidation(null, checkProps, item, checkName, isRequired, message, reason, customValidation);
    return;
  }

  // Optional tag with custom validation: only validate based on custom validaton
  if (!isRequired && customValidation) {
    await runCustomValidation(matches, checkProps, item, checkName, isRequired, message, reason, customValidation);
    return;
  }

  // Default flow: regex-based matching with optional custom validation for each match.
  if (matches.length === 0) {
    item[checkProps.key].results.push({
      target: checkName,
      reason: `missing ${checkName}`,
      type: ISSUE_KEY.missing,
      isError: !!isRequired,
      isWarning: !isRequired,
      message: `${checkName} is required but was not found.`,
    });
    return;
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
    // Matches found
    for (const match of matches) {
      const value = match[1];
      // If run it for each match (e.g. Robots meta tag that's not required but has multiple directives that are invalid, like noindex and nofollow)
      if (customValidation) {
        await runCustomValidation([match], checkProps, item, checkName, isRequired, message, reason, customValidation);
      }

      // Exists but empty value
      if (!value || value.trim() === '') {
        item[checkProps.key].results.push({
          target: checkName,
          reason: `${checkName} tag exists but it is empty`,
          type: ISSUE_KEY.empty,
          isError: !!isRequired,
          isWarning: !isRequired,
          message: `Provide a value for ${checkName}.`,
        });
        // continue;
      }

      // If this is a URL tag, validate the URL
      if (isUrl && value) {
        const linkError = await checkLinkValidity(content, value, config, file, startUrl);
        if (linkError && linkError.isError) {
          item[checkProps.key].results.push({
            target: checkName,
            type: linkError.type,
            reason: linkError.reason || 'invalid link',
            isError: !!isRequired,
            isWarning: !isRequired,
            message: linkError.message || `The URL provided for ${checkName} is invalid.`,
          });
        }
      }
    }
  }
}

async function runCustomValidation(matches, checkProps, item, checkName, isRequired, message, reason, customValidation) {
  const validation = typeof customValidation === 'function'
    ? { check: customValidation }
    : customValidation;

  if (!validation || typeof validation.check !== 'function') return;

  const customArgs = validation.args || [];
  const customResultItem = {
    target: checkName,
    reason: validation.reason || reason || `invalid ${checkName}`,
    type: validation.type || ISSUE_KEY.invalid,
    isError: !!isRequired,
    isWarning: !isRequired,
    message: validation.message || message || `Custom validation failed for ${checkName}.`,
  };

  try {
    const pushCustomResults = (customResults) => {
      if (Array.isArray(customResults)) {
        for (const result of customResults) {
          if (result === true) {
            item[checkProps.key].results.push({ ...customResultItem });
          } else if (result && typeof result === 'object') {
            item[checkProps.key].results.push(result);
          }
        }
      } else if (customResults === true) {
        item[checkProps.key].results.push({ ...customResultItem });
      } else if (customResults && typeof customResults === 'object') {
        item[checkProps.key].results.push(customResults);
      }
    };

    if (matches == null) {
      const customResults = await validation.check(...customArgs);
      pushCustomResults(customResults);
      return;
    }

    for (const match of matches) {
      const value = match[1];
      if (!value || value.trim() === '') continue;

      const customResults = await validation.check(value, ...customArgs);
      pushCustomResults(customResults);
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
}
