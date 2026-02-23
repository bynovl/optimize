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
// - required: Whether this check should be treated as an error if missing (true) or just a warning (false)
// - isUrl: Whether the captured value should be validated as a URL (optional)
// - message: Custom message to display when the check fails (optional)
// - reason: A short reason for the failure, used in stats and labels (optional)
// - customValidation: A function or object for more complex validation logic (optional)
//
// Custom validation 
//  - Simple: customValidation: () => true/false or error object
//  - Robust: customValidation: { check: fn, args, type, reason, message } (see media/image checks for example)
//  - The check function can receive any arguments you need (e.g., value, content, config, file, startUrl, etc.)
//  - Return an error object (with isError/message) to flag a custom error, or true/undefined for valid.

// Regex
// Example custom validation function (replace with actual logic)
function customValidationFunction(value) {
  return true;
}

// Custom check definitions (array of checks for each category)
export const customMetaChecks = [
// Custom validation checks
  {
    name: '<meta name="language">',
    regex: metaLang,
    required: true,
    isUrl: false,
    message: 'Meta language tag is missing or invalid',
    reason: 'Double check that the lang exists',
    // customValidation: customValidationFunction, 
  }
];

// Add similar structures for other categories (e.g., links, schema, accessibility, etc.)
export const customHierarchyChecks = [];
export const customSourcesChecks = [];
export const customLinkChecks = [];
export const customAccessibilityChecks = [];
export const customLangChecks = [];

// For custom schema checks, use schemaDefault and schemaCustom properties in your optimize.config.js.