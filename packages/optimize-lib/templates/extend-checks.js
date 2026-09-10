// ---------------------------------------------------
// EXTEND CHECK PATTERNS
// ----------------------------------------------------
// This file is for code/config only.
// For full documentation see README.md.
//
// You can define custom checks to extend the default validation logic.
// These checks will be merged with the default checks and executed during validation.
//
// Each check can have:
// - name: A descriptive name for the check (used in messages and labels)
// - regex: The regex to find the relevant tag/element and capture its value
//          Use `null` when you want to skip regex matching and pass filtered content
//          directly into `customValidation`.
// - required: Whether this check should be treated as an error if missing (true) or just a warning (false)
// - isUrl: Whether the captured value should be validated as a URL (optional)
// - message: Custom message to display when the check fails (optional)
// - reason: A short reason for the failure, used in stats and labels (optional)
// - customValidation: A function or object for more complex validation logic (optional)
//
// Recommended mental model:
// No customValidation (simple presence/value checks)
//    Use this when the presence of the tag/element is all you need to enforce.
//    The core flow will handle missing/duplicate/empty cases based on the regex and required flag.
//
// 1) Simple customValidation
//    Use a function when the tag is optional, or when a matched value just needs
//    a quick true/false validation.
//    - Return true to use the configured type/reason/message on the item.
//    - Return false when the value is valid.
//    - Return an error object if you want to fully control the result.
//
// 2) Robust customValidation
//    Use an object when you want to pass args or define default error metadata
//    alongside the validation function.
//    Shape: { check: fn, args, type, reason, message }
//
// 3) Direct content validation (`regex: null`)
//    Use this when your validator should receive the filtered content directly
//    instead of a regex match value. This is useful for checks like hierarchy,
//    links, media, or sources where the validator parses the content itself.
//
// Notes:
// - Generic checks like missing / duplicate / empty are handled by the core flow.
// - customValidation is best used for value-specific logic after a tag is matched.
// - If `regex` is `null`, `customValidation` runs directly against the filtered content/args.
// - The validation function can receive any arguments you need.

// Regex
const metaThemeColor = /<meta\b(?=[^>]*\bname=["']theme-color["'])(?=[^>]*\bcontent=["']([^"']*)["'])[^>]*>/gi;
const metaAppName = /<meta\b(?=[^>]*\bname=["']application-name["'])(?=[^>]*\bcontent=["']([^"']*)["'])[^>]*>/gi;
const metaViewport = /<meta\b(?=[^>]*\bname=["']viewport["'])(?=[^>]*\bcontent=["']([^"']*)["'])[^>]*>/gi;


// 1) Simple customValidation example
// This tag is optional, but if it exists we want to reject generic values.
function validateApplicationName(value) {
  if (!value || typeof value !== 'string') return false;
  return /^(app|site|homepage)$/i.test(value.trim()) || value.trim().length < 3;
}

// 2) Robust customValidation example
// This required tag must exist AND include a few expected tokens.
function validateViewportIncludes(value, ...requiredTokens) {
  if (!value || typeof value !== 'string') return false;

  const lower = value.toLowerCase();
  const missingTokens = requiredTokens.filter((token) => !lower.includes(token.toLowerCase()));

  if (missingTokens.length === 0) return false;

  return [{
    target: '<meta name="viewport">',
    type: 'invalid',
    reason: `viewport is missing: ${missingTokens.join(', ')}`,
    isError: true,
    isWarning: false,
    message: `Include ${missingTokens.join(', ')} in the viewport content.`,
  }];
}

// Custom check definitions (array of checks for each category)
export const customMetaChecks = [
  // No customValidation
  // Use this when presence is all you need to enforce (e.g. missing/duplicate/empty handling is sufficient).
  {
    name: '<meta name="theme-color">',
    regex: metaThemeColor,
    required: true,
    isUrl: false,
  },

  // 1) Simple customValidation
  // Optional tag: only validate its value if it exists.
  {
    name: '<meta name="application-name">',
    regex: metaAppName,
    required: false,
    isUrl: false,
    customValidation: { check: validateApplicationName },
    type: 'invalid',
    reason: 'application-name is too short or generic',
    message: 'application-name should be descriptive and long enough.',
  },

  // 2) Robust customValidation
  // Required tag: use normal missing/duplicate/empty handling first, then validate value.
  {
    name: '<meta name="viewport">',
    regex: metaViewport,
    required: true,
    isUrl: false,
    customValidation: {
      check: validateViewportIncludes,
      args: ['width=device-width', 'initial-scale=1'],
      type: 'invalid',
      reason: 'viewport is missing standard responsive directives',
      message: 'Viewport should include width=device-width and initial-scale=1.',
    },
  },
];

// Add similar structures for other categories (e.g., links, schema, accessibility, etc.)
export const customHierarchyChecks = [];
export const customSourcesChecks = [];
export const customLinkChecks = [];
export const customAccessibilityChecks = [];
export const customOpenGraphChecks = [];
export const customMediaChecks = [];

// For custom schema checks, use schemaDefault and schemaCustom properties in your optimize.config.js.