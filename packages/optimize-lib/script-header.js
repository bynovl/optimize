import { getConfig } from './get-config.js';
import { walk } from '@bynovl/optimize-utils/walk.js';
import { isOffline } from '@bynovl/optimize-utils/online-status.js';
import shouldIgnore from './should-ignore.js';
import { cliBanner } from './cli-banner.js';
import { startStopSpinner } from '@bynovl/optimize-utils/spinner.js';

export async function scriptHeader(isFirstCheck = true, enabledChecks = [], file) {
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
    let htmlFiles;

    // check if specific file or directory is provided
    if (file) {
        // If file has an extension, treat as file; otherwise, treat as directory
        const hasExt = /\.[^/.]+$/.test(file);
        if (hasExt) {
            const filePath = file.startsWith('/') ? file : `${siteDir}/${file}`;
            htmlFiles = [filePath];
        } else {
            // Treat as directory, traverse for HTML files
            const dirPath = file.startsWith('/') ? file : `${siteDir}/${file}`;
            htmlFiles = walk(dirPath, [], ['.html']);
        }
    } else {
        htmlFiles = walk(siteDir, [], ['.html']);
    }
    const nonIgnoredHtmlFiles = htmlFiles.filter((f) => {
        const relPath = f.replace(siteDir + '/', '');
        return !shouldIgnore(config, relPath);
    });
    return { config, nonIgnoredHtmlFiles, htmlFiles, userEnabledChecks };
}
