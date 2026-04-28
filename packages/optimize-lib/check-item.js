import { ISSUE_KEY } from './issue-keys.js';
import { checkLinkValidity } from './check-link-validity.js';

export async function validateItem(regex, checkProps, item, content, checkName, isUrl, isRequired, message, reason, customValidation, config, file, startUrl) {
  try {
    // If regex is provided, ensure it is a RegExp and has the global flag for matchAll
    let matches = [];
    if (regex) {
      if (!(regex instanceof RegExp)) {
        console.error(`[validateItem] Error: Provided regex is not a RegExp object for check: ${checkName}`);
        process.exit(1);
      }
      if (!regex.global) {
        console.error(`[validateItem] Error: String.prototype.matchAll called with a non-global RegExp argument for check: ${checkName}`);
        process.exit(1);
      }
      matches = [...content.matchAll(regex)];
    }

    // Initialize the results array for this check if it doesn't exist yet.
    if (!item[checkProps.key]) item[checkProps.key] = { results: [] };

    // Skip regex-based matching and run custom validation directly when regex is not provided but customValidation is defined.
    if (customValidation && regex == null) {
      await runCustomValidation(null, checkProps, item, checkName, isRequired, message, reason, customValidation, content, isUrl, config, file, startUrl);
      return;
    }

    // Optional tag with custom validation: only validate based on custom validaton
    if (!isRequired && customValidation) {
      await runCustomValidation(matches, checkProps, item, checkName, isRequired, message, reason, customValidation, content, isUrl, config, file, startUrl);
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
    }

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

    // Always perform all checks for each match
    for (const match of matches) {
      const value = match[1];

      // Custom validation (if any)
      if (customValidation) {
        await runCustomValidation([match], checkProps, item, checkName, isRequired, message, reason, customValidation, content);
      }

      // Empty value check
      if (!value || value.trim() === '') {
        item[checkProps.key].results.push({
          target: checkName,
          reason: `${checkName} tag exists but it is empty`,
          type: ISSUE_KEY.empty,
          isError: !!isRequired,
          isWarning: !isRequired,
          message: `Provide a value for ${checkName}.`,
        });
      }

      // Always perform URL check last if isUrl is true and value exists
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
  } catch (err) {
    console.error(`[validateItem] Error:`, err);
    process.exit(1);
    // Do not return or push any result if there is an error.
  }
}

async function runCustomValidation(matches, checkProps, item, checkName, isRequired, message, reason, customValidation, content, isUrl, config, file, startUrl) {
  const validation = typeof customValidation === 'function'
    ? { check: customValidation }
    : customValidation;

  if (!validation || !(typeof validation.check === 'function' || validation.check === true || validation.check === false)) {
    // Report misconfigured customValidation.check and exit
    console.error(`[runCustomValidation] Error: customValidation.check for '${checkName}' must be a function, true, or false. Got:`, typeof validation.check);
    process.exit(1);
  }

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
      }
    };

    // If matches is null, run direct content or full-args validation.
    if (matches == null) {
      let customResults;
      // If customArgs is a non-empty array, treat as full-args signature (e.g., schema/media)
      if (Array.isArray(customArgs) && customArgs.length > 0) {
        customResults = await validation.check(...customArgs);
      } else {
        // Defensive: ensure first arg is a string for content-based checks
        let firstArg = content;
        if (typeof firstArg !== 'string') {
          if (firstArg && typeof firstArg.toString === 'function') {
            firstArg = firstArg.toString();
          } else {
            throw new TypeError(`[validateItem] Custom validation expected string content but got: ${typeof firstArg}`);
          }
        }
        customResults = await validation.check(firstArg);
      }
      pushCustomResults(customResults);
      return;
    }

    for (const match of matches) {
      const value = match[1];
      if (!value || value.trim() === '') continue;

      let customResults = await validation.check(value, ...customArgs);
      
      // If isUrl is true, also check link validity and merge results
      if (isUrl && value) {
        const linkError = await checkLinkValidity(content, value, config, file, startUrl);
        if (linkError && linkError.isError) {
          if (!Array.isArray(customResults)) customResults = [customResults].filter(Boolean);
          customResults.push({
            target: checkName,
            type: linkError.type,
            reason: linkError.reason || 'invalid link',
            isError: !!isRequired,
            isWarning: !isRequired,
            message: linkError.message || `The URL provided for ${checkName} is invalid.`,
          });
        }
      }
      pushCustomResults(customResults);
    }
  } catch (err) {
    console.error(`[validateItem] Error:`, err);
    process.exit(1);
  }
}

// === Validation Patterns Reference ===
//
// 1. regex: true, customValidation: function/object
//    - Run regex-based matching to get all matches.
//    - For each match:
//        a) Run customValidation (e.g., value checks, warnings, etc).
//        b) If isUrl is true and value exists, always run link validation (URL check) after customValidation.
//    - This ensures both custom and URL validation are applied to every match.
//
// 2. regex: null, customValidation: function/object
//    - No regex matching is performed.
//    - The customValidation.check function is called directly, usually with the full content or custom args.
//    - If you want to check URLs or values, you must do so entirely within the customValidation.check function.
//    - isUrl is ignored in this mode; no automatic link validation is performed by the core.
//
// 3. isUrl: true (with regex)
//    - After customValidation and empty checks, the core always performs a link check for each non-empty value.
//    - This guarantees that URL validation is always run for every match, regardless of customValidation result.
//
// 4. isUrl: true (with regex: null)
//    - No automatic link validation is performed by the core.
//    - If you want to check URLs, you must do so inside your customValidation.check function.
//
// This pattern ensures:
//   - All present tags are checked.
//   - Empty values are flagged.
//   - Custom logic can be injected as needed.
//   - URL validation is always performed for regex-based matches with isUrl: true.
