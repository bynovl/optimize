// Global custom check configuration. 
// This file defines the configuration for the custom check,
/// Avoid hardcoding values directly in the validate-check.js file to make it more reusable and maintainable.
export const checkProps = {
  label: 'Links',
  key: 'links',
  flag: '--links', // This is the CLI flag that will trigger this check. It should be unique and descriptive of the check being performed.
}

// ----------------------
// Manually update the following in the respective files when creating a new check:
// -----------------------
// 1. index.js: The function name and export in index.js (so it matches your checkProps.funcName).
// 2. bin/cli.js: The import and usage in cli.js (so it calls the correct function).

// To test with Core you will aslo need to update the following:
// optimize-core/index.js: Add an import for the check function and include it in the checks object with the same key as defined in checkProps.key.

// Note: funcName should match the name of key (camelCase)
// e.g. if key is 'metaLanguage', funcName should be 'checkMetaLanguage' and the function in index.js should also be named 'checkMetaLanguage' to ensure it is called correctly from the CLI.
// the key should be the same name as flag used in cli.js (without the --) to ensure it is included in the enabledChecks array and executed when the flag is used.
// flag: --your-check-key (e.g. --meta-language)