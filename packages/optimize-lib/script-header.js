import { getConfig } from './get-config.js';
import path from 'path';
import fs from 'fs';
import { walk } from '@bynovl/optimize-utils/walk.js';
import { isOffline } from '@bynovl/optimize-utils/online-status.js';
import shouldIgnore from './should-ignore.js';
import { cliBanner } from './cli-banner.js';
import { startStopSpinner } from '@bynovl/optimize-utils/spinner.js';

export async function scriptHeader(isFirstCheck = true, enabledChecks = [], args) {
    // Load configuration and checksOverride
    const { config } = await getConfig(enabledChecks);

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

    // Determine which HTML files to check based on --path argument and config.outDir
    const file = args['--path'] || null;
    const siteDir = config.outDir;
    let htmlFiles;

    if (file) {
        const filePath = path.resolve(siteDir, file);
        if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) {
            htmlFiles = [filePath];
        } else if (fs.existsSync(filePath) && fs.lstatSync(filePath).isDirectory()) {
            htmlFiles = walk(filePath, [], ['.html']);
        } else {
            // File or directory does not exist
            console.error(`Error: The specified file or directory does not exist within siteDir: ${file}`);
            process.exit(1);
        }
    } else {
        htmlFiles = walk(siteDir, [], ['.html']);
    }
    const nonIgnoredHtmlFiles = htmlFiles.filter((f) => {
        const relPath = path.relative(siteDir, f).replace(/\\/g, '/');
        return !shouldIgnore(config, relPath);
    });
    return { config, nonIgnoredHtmlFiles, htmlFiles };
}
