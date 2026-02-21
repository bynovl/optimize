// Example File for defining custom checks for different categories
// Note: This is just a template to illustrate how to structure custom checks.
// ------------------------------------------
// INSTRUCTIONS
// ------------------------------------------
// 1. Define your custom checks in the appropriate category arrays (e.g., customMetaChecks, customLinkChecks, etc.)
// 2. Each check should include a name, regex for validation, whether it's required, if it's a URL, and custom messages for failures.
// 3. Optionally, include a custom validation function for more complex logic.
// 4. Import this file into your optimize.config.js and include the checks in the extendChecks section of your configuration.
// 5. Customize the checks as needed based on your specific requirements and the structure of your HTML content.

// ------------------------------------------
// IMPORTS (if needed)
// ------------------------------------------
// Import any necessary libraries or helper functions here

// ------------------------------------------
// REGEX PATTERNS AND VALIDATION FUNCTIONS
// -------------------------------------------
const metaLang = /<meta name="language" content="(.*?)"/i;

// Example custom validation function (replace with actual logic)
function customValidationFunction(value) {
  // Implement custom validation logic here
  return true; // Return true if valid, false otherwise
}

// ------------------------------------------
// CUSTOM VALIDATION CHECKS
// -------------------------------------------
export const customMetaChecks = [
  {
    name: '<meta name="language">',
    regex: metaLang, // Regex to validate the meta tag
    required: true, // Whether this check is mandatory
    isUrl: false, // Whether the value is a URL
    message: 'Meta language tag is missing or invalid',
    reason: 'Double check that the lang exists',
    // customValidation: customValidationFunction, // (optional)
  },
];

export const customOpenGraphChecks = [
  {
    name: '<meta property="og:title">',
    regex: /<meta property="og:title" content="(.*?)"/i, // Example regex for Open Graph title
    required: true,
    isUrl: false,
    message: 'Open Graph title is missing or invalid',
    reason: 'Ensure the og:title tag is present and valid'
    // customValidation: customValidationFunction, // (optional)
  },
];

export const customMediaChecks = [
  {
    name: '<img alt>',
    regex: /<img [^>]*alt="(.*?)"/i, // Example regex for image alt attributes
    required: true,
    isUrl: false,
    // Example custom validation function (replace with actual logic)
    message: 'Image alt attribute is missing or empty',
    reason: 'Ensure all images have descriptive alt attributes',
    customValidation: customValidationFunction, // (optional)
  },
];

// Add similar structures for other categories (e.g., links, schema, accessibility, etc.)
// Ensure each check includes meaningful validation logic and messages
export const customHierarchyChecks = []
export const customSourcesChecks = [];
export const customLinkChecks = [];
export const customAccessibilityChecks = [];
export const customLangChecks = [];

// ------------------------------------------
// Note: schema checks may require more complex validation logic,
// For custom schema checks use the schemaDefault and schemaCustom
// properties in your optimize.config.js to define the custom 
// schema attributes. See the documentation for more details on how to implement this.