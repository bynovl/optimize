import { getConfig } from './get-config.js';
import { walk } from '@bynovl/optimize-utils/walk.js';
import { isOffline } from '@bynovl/optimize-utils/online-status.js';
import shouldIgnore from './should-ignore.js';
import { cliBanner } from './cli-banner.js';
import { startStopSpinner } from '@bynovl/optimize-utils/spinner.js';

export async function scriptHeader(isFirstCheck = true, enabledChecks = []) {
    // Load configuration and checksOverride
    const { config, userEnabledChecks } = await getConfig(enabledChecks);

    if (!config.apiMode) {
        // Start timer (update for accuracy)
        startStopSpinner(true);
    }

    // Show banner only once (if first check)
    if (isFirstCheck && config.apiMode !== true) {
        await cliBanner();
    }

    // Check online status
    config.isOffline = await isOffline();

    // Merge Schema config keys as required
    const defaultKeys = Array.isArray(config.schemaDataDefault)
        ? config.schemaDataDefault
        : [];
    const customKeys = Array.isArray(config.schemaDataCustom)
        ? config.schemaDataCustom
        : [];

    config.allSchemaKeys = [...defaultKeys, ...customKeys];

    const siteDir = config.outDir;
    const htmlFiles = walk(siteDir, [], ['.html']);
    const nonIgnoredHtmlFiles = htmlFiles.filter((file) => {
        const relPath = file.replace(siteDir + '/', '');
        return !shouldIgnore(config, relPath);
    });
    return { config, nonIgnoredHtmlFiles, htmlFiles, userEnabledChecks };
}
