#!/usr/bin/env node
// Entry point for the CLI. Only modify the import block below when
// creating a new custom check (update function name and paths).
import { scriptHeader } from '@bynovl/optimize-lib/script-header.js';
import { scriptFooter } from '@bynovl/optimize-lib/script-footer.js';
import { cliDispatch } from '@bynovl/optimize-lib/cli-dispatch.js';

// === CUSTOM CHECK IMPORTS ===
import checkLang from '../index.js'; // replace with your function name
import { checkProps } from '../scripts/check-props.js';
// ============================

// parse CLI args and determine which checks are enabled
const { args, enabledChecks, checkModules } = await cliDispatch([checkProps.flag]);
if (args._handled) {
    // Help/version was shown, exit early
    process.exit(0);
}

// determine if this flag is the first enabled (controls header display)
const isFirstCheck = enabledChecks[0] === checkProps.flag;

// main runner used when invoked via CLI
export default async function runAllChecks() {
    const { config, nonIgnoredHtmlFiles } = await scriptHeader(isFirstCheck, enabledChecks, args);
    const actualChecks = Array.isArray(config.enabledChecks) ? config.enabledChecks : enabledChecks;
    const totalPagesChecked = nonIgnoredHtmlFiles.length;
    const isApiMode = config.apiMode || process.env.MODE === 'API';
    if (isApiMode) return;

    let results = [];
    if (actualChecks.includes(checkProps.flag)) {
        // call the custom check function imported above
        results = [await checkCustomCheck(config, nonIgnoredHtmlFiles)];
    }
    await scriptFooter(results, config, args, totalPagesChecked);
}

// Run if executed from CLI
runAllChecks().then(() => {
    const isApiMode = process.env.MODE === 'API';
    if (!isApiMode) process.exit(0);
});
