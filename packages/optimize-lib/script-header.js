import { getConfig } from './get-config.js';
import path from 'path';
import fs from 'fs';
import { walk } from '@bynovl/optimize-utils/walk.js';
import { isOffline } from '@bynovl/optimize-utils/online-status.js';
import { createConfig } from './create-config.js';
import shouldIgnore from './should-ignore.js';
import { cliBanner } from './cli-banner.js';
import { startStopSpinner } from '@bynovl/optimize-utils/spinner.js';
import { crawlSite } from './crawl.js';
import { colors } from '@bynovl/optimize-utils/ansi-colors.js';

export async function scriptHeader(isFirstCheck = true, enabledChecks = [], args) {

    // Load configuration and checksOverride
    const { config } = await getConfig(enabledChecks);

    function earlyExitError() {
        process.exit(1);
    }

    // Ensure outDir exists
    if (config.outDir == null) {
        console.log(colors.red(`[novl optimize] Error: You must use a recognized output directory (_opt, dist, out, _site, _build, public) or define a custom outDir in your optimize.config.js`))
        earlyExitError();
    }

    // Check if outDir exists but is empty (no HTML files)
    const htmlFilesInOutDir = fs.readdirSync(config.outDir).filter(f => f.endsWith('.html'));
    if (htmlFilesInOutDir.length === 0) {
        console.log(colors.red(`[novl optimize] Error: The output directory '${config.outDir}' exists but contains no HTML files to check.`));
        earlyExitError();
    }

    // Show banner only once (if first check)
    if (isFirstCheck && config.apiMode !== true) {
        await cliBanner();
    }

    // If --setup was requested, create a new optimize.config.js and exit
    if (args['--setup']) {
        await createConfig();
        // Exit after setup; no further checks needed
        process.exit(0);
    }

    // If --crawl was requested, check for API key before running crawl
    if (args['--crawl']) {
        // Full crawl: require config.crawl enabled and both apiToken and accountId set
        if (config.crawl) {
            const apiToken = config.crawl.apiToken || process.env.CLOUDFLARE_API_TOKEN;
            const accountId = config.crawl.accountId || process.env.CLOUDFLARE_ACCOUNT_ID;
            if (!apiToken || !accountId) {
                console.error('[novl optimize] Error: The --crawl option is set to use a full site crawl, but required API credentials were not found.');
                console.error([
                    'There are two crawl modes:',
                    '',
                    '1. Simple crawl (fetches a single webpage):',
                    '   - Do NOT set the crawl config option.',
                    '   - This mode does not require an API token.',
                    '',
                    '2. Full site crawl (fetches the entire site up to limit):',
                    '   - Enable and configure the crawl option in optimize.config.js.',
                    '   - You MUST set crawl.apiToken and crawl.accountId in your config, or set the CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID environment variables.',
                    ''
                ].join('\n'));
                process.exit(1);
            }
        }
        await crawlSite(config, args['--crawl']);
    }

    if (!config.apiMode) {
        // Start timer (update for accuracy)
        startStopSpinner(true);
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
