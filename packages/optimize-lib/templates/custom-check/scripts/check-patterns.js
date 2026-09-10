// =====================================
// Pattern definitions and optional custom validation
//
// This file exports regex patterns used by the check-validation
// logic and a `customValidation` function for cases where the
// basic regex match is insufficient. The orchestrator will use
// `customRegex` to locate elements. If `customValidation` is
// defined it overrides the default regex logic, so it must
// handle missing/duplicate/empty cases itself; otherwise, only
// deeper value checks are necessary.
//
// When creating a new custom check, update the regex and validation
// routine to suit your specific requirements. Remove this file if
// pattern-based matching isn't needed at all.
// =====================================

// Regex pattern to match
// Matches <html ... lang="..."> (case-insensitive, flexible spacing)
export const customRegex = /<html\b[^>]*\blang\s*=\s*['\"][^'\"]+['\"]/gi;

export function customValidation(content) {
  // Find all lang attributes
    // Use a non-global regex to extract lang value
  const langRegex = /<html\b[^>]*\blang\s*=\s*['\"]([^'\"]+)['\"]/i;
  const langMatch = content.match(langRegex);
  if (!langMatch) {
    return {
      target: '<html> lang attribute',
      reason: 'missing lang attribute',
      type: 'missing',
      isError: true,
      isWarning: false,
      message: 'The <html> tag is missing the required lang attribute.'
    };
  }
  const langValue = langMatch[1];
  if (!langValue || langValue.trim() === '') {
    return {
      target: '<html> lang attribute',
      reason: 'empty lang attribute',
      type: 'empty',
      isError: true,
      isWarning: false,
      message: 'The lang attribute value is empty.'
    };
    }
  // Advanced validation: check if lang value is valid ISO code
  const isoLangPattern = /^[a-z]{2,3}(-[A-Z]{2,3})?$/;
  if (!isoLangPattern.test(langValue.trim())) {
    return {
      target: '<html> lang attribute',
      reason: 'invalid lang value',
      type: 'invalid',
      isError: true,
      isWarning: false,
      message: `Lang attribute value '${langValue}' is not a valid ISO code.`
    };
  }
}