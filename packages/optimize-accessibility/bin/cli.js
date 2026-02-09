#!/usr/bin/env node
import { scriptHeader } from '@bynovl/optimize-lib/script-header.js';
import { scriptFooter } from '@bynovl/optimize-lib/script-footer.js';
import { cliDispatch } from '@bynovl/optimize-lib/cli-dispatch.js';
import checkAccessibility from '../index.js';

const currentFlag = '--accessibility';
const { args, enabledChecks } = cliDispatch([currentFlag]);

if (args._handled) {
    // Help/version was shown, exit early
    process.exit(0);
}

const isFirstCheck = enabledChecks[0] === currentFlag;

export default async function runAllChecks() {
    const { config, nonIgnoredHtmlFiles } = await scriptHeader(isFirstCheck, enabledChecks, args);
    const actualChecks = Array.isArray(config.enabledChecks) ? config.enabledChecks : enabledChecks;
    const isApiMode = config.apiMode || process.env.MODE === 'API';
    if (isApiMode) return;

    let results = [];
    if (actualChecks.includes(currentFlag)) {
        results = [await checkAccessibility(config, nonIgnoredHtmlFiles)];
    }
    await scriptFooter(results, config, args);
}

// Run if executed from CLI
runAllChecks().then(() => {
    const isApiMode = process.env.MODE === 'API';
    if (!isApiMode) process.exit(0);
});