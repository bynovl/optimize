#!/usr/bin/env node
import { scriptHeader } from '@bynovl/optimize-lib/script-header.js';
import { scriptFooter } from '@bynovl/optimize-lib/script-footer.js';
import { cliDispatch } from '@bynovl/optimize-lib/cli-dispatch.js';
import { debug } from '@bynovl/optimize-utils/debug-log.js';

// Initialize CLI options and checkModules
const { args, enabledChecks, checkModules } = await cliDispatch();
if (args._handled) {
  process.exit(0);
}

const isFirstCheck = enabledChecks[0];

export async function runAllChecks(startUrl) {
  try {
    const { config, nonIgnoredHtmlFiles } = await scriptHeader(isFirstCheck, enabledChecks, args);
    const actualChecks = Array.isArray(config.enabledChecks) && config.enabledChecks.length > 0 ? config.enabledChecks : enabledChecks;
    const totalPagesChecked = nonIgnoredHtmlFiles.length;
    debug(config, 'Final merged config to be used for checks:');
    // If API mode, skip CLI output
    const isApiMode = config.apiMode || process.env.MODE === 'API';
    if (isApiMode) return;

    // Allow startUrl from config or env if not passed
    const effectiveStartUrl = startUrl || config.startUrl || process.env.START_URL;

    // Use checkModules from cliDispatch
    const checksToRun = actualChecks
      .map(flag => checkModules.find(m => m.flag === flag))
      .filter(Boolean);

    // Run all selected checks
    const results = await Promise.all(
      checksToRun.map(async (mod) => mod.fn(config, nonIgnoredHtmlFiles, effectiveStartUrl))
    );
    await scriptFooter(results, config, args, totalPagesChecked);
  } catch (error) {
    console.error('Error occurred while checking optimization requirements:', error);
  }
}

runAllChecks().then(() => {
  const isApiMode = process.env.MODE === 'API';
  if (!isApiMode) process.exit(0);
});