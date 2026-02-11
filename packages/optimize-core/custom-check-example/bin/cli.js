#!/usr/bin/env node
// This is a template CLI file for a custom check. 
// To create a new check, copy this file and replace the relevant parts (marked with comments) 
// with your custom check's logic and flag. Make sure to also implement the 
// actual check function in the index.js file of your custom check package.

// DO NOT REMOVE: Required for the CLI to function properly,
import { scriptHeader } from '@bynovl/optimize-lib/script-header.js';
import { scriptFooter } from '@bynovl/optimize-lib/script-footer.js';
import { cliDispatch } from '@bynovl/optimize-lib/cli-dispatch.js';

// EDIT: Import your custom check function from your index.js file.
// Replace checkCustom with the actual function name of your custom check.
import checkCustom from '../index.js';

// EDIT: Name of custom check flag 
// Replace the --custom-check with the actual flag you want to use (e.g. --performance)
const currentFlag = '--custom-check';
const { args, enabledChecks } = cliDispatch([currentFlag]);

// DO NOT REMOVE: This is required to prevent the script 
// from running when --help or --version is passed, which are handled in cliDispatch
if (args._handled) {
    // Help/version was shown, exit early
    process.exit(0);
}

// DO NOT REMOVE: This is required to determine if this is the first enabled check, 
// which affects whether the script header will be shown (e.g., spinner and summary)
const isFirstCheck = enabledChecks[0] === currentFlag;

// This is the main function that runs the check.
// It follows the standard pattern of running the script header, executing the check, and then running the script footer.
export default async function runAllChecks() {
    const { config, nonIgnoredHtmlFiles } = await scriptHeader(isFirstCheck, enabledChecks, args);
    const actualChecks = Array.isArray(config.enabledChecks) ? config.enabledChecks : enabledChecks;
    const totalPagesChecked = nonIgnoredHtmlFiles.length;
    const isApiMode = config.apiMode || process.env.MODE === 'API';
    if (isApiMode) return;

    let results = [];
    if (actualChecks.includes(currentFlag)) {
        // EDIT: This is where you would call your custom check function 
        // and pass the necessary parameters (e.g. config, list of HTML files, etc.)
        // Replace checkCustom with the actual function name of your custom check 
        // that you export from your index.js file.
        results = [await checkCustom(config, nonIgnoredHtmlFiles)];
    }
    await scriptFooter(results, config, args, totalPagesChecked);
}

// Run if executed from CLI
runAllChecks().then(() => {
    const isApiMode = process.env.MODE === 'API';
    if (!isApiMode) process.exit(0);
});
