#!/usr/bin/env node
import { scriptHeader } from '@bynovl/optimize-lib/script-header.js';
import { scriptFooter } from '@bynovl/optimize-lib/script-footer.js';
import { cliDispatch } from '@bynovl/optimize-lib/cli-dispatch.js';
import checkHierarchy from '../index.js';
import { checkProps } from '../scripts/check-props.js';

const { args, enabledChecks } = await cliDispatch([checkProps.flag]);

if (args._handled) {
    // Help/version was shown, exit early
    process.exit(0);
}
const isFirstCheck = enabledChecks[0] === checkProps.flag;
export default async function runAllChecks(startUrl) {
    const { config, nonIgnoredHtmlFiles } = await scriptHeader(isFirstCheck, enabledChecks, args);
    const actualChecks = Array.isArray(config.enabledChecks) ? config.enabledChecks : enabledChecks;
    const totalPagesChecked = nonIgnoredHtmlFiles.length;

    const isApiMode = config.apiMode || process.env.MODE === 'API';
    if (isApiMode) return;

    // Allow startUrl from config or env if not passed
    const effectiveStartUrl = startUrl || config.startUrl || process.env.START_URL;

    let results = [];
    if (actualChecks.includes(checkProps.flag)) {
        results = [await checkHierarchy(config, nonIgnoredHtmlFiles, effectiveStartUrl)];
    }
    await scriptFooter(results, config, args, totalPagesChecked);
}

// Run if executed from CLI
runAllChecks().then(() => {
    const isApiMode = process.env.MODE === 'API';
    if (!isApiMode) process.exit(0);
});