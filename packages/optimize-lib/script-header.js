import { getConfig } from './get-config.js';
import path from 'path';
import fs from 'fs';
import { walk } from '@bynovl/optimize-utils/walk.js';
import { isOffline } from '@bynovl/optimize-utils/online-status.js';
import shouldIgnore from './should-ignore.js';
import { cliBanner } from './cli-banner.js';
import { startStopSpinner } from '@bynovl/optimize-utils/spinner.js';
import { crawlSite } from './crawl.js';
import { colors } from '@bynovl/optimize-utils/ansi-colors.js';

export async function scriptHeader(isFirstCheck = true, enabledChecks = [], args) {
    // Load configuration and checksOverride
    const { config } = await getConfig(enabledChecks);

    function earlyExitError() {
        console.error(colors.white('You must add or update the ') + colors.cyan('outDir') + colors.white(' property in your ') + colors.cyan('optimize.config.js') + colors.white(' file.'));
        console.error(colors.white('This is required so Optimize knows where to find your built HTML files.'));
        console.error(colors.white('For more information and setup instructions, visit: ') + colors.cyan('https://github.com/bynovl/optimize'));
        process.exit(1);
    }
    // Early exit if outDir is not set
    if (!config.outDir) {
        console.log(colors.red('[novl optimize] ERROR:') + ' ' + colors.yellow('No output directory (outDir) is set!'));
        earlyExitError();
    }

    // Ensure outDir exists
    if (!fs.existsSync(config.outDir) || !fs.lstatSync(config.outDir).isDirectory()) {
        // If outDir doesn't exist, check for common output directories in the project root and use the first one found
        // '_opt' is the branded default, followed by other common build folders
        const defaultDirs = ['_opt', 'dist', 'out', '_site', '_build', 'public'];
        let found = false;
        for (const dir of defaultDirs) {
            if (fs.existsSync(dir) && fs.lstatSync(dir).isDirectory()) {
                config.outDir = dir;
                found = true;
                break;
            }
        }
        if (!found) {
            // If no default output directory is found, log an error and exit
            console.log(colors.red(`[novl optimize] Error: The output directory specified in outDir ('${config.outDir}') does not exist, and no default output directory was found.`));
            earlyExitError();
        }
    }

    // Check if outDir exists but is empty (no HTML files)
    const htmlFilesInOutDir = fs.readdirSync(config.outDir).filter(f => f.endsWith('.html'));
    if (htmlFilesInOutDir.length === 0) {
        console.log(colors.red(`[novl optimize] Error: The output directory '${config.outDir}' exists but contains no HTML files to check. Exiting.`));
        earlyExitError();
    }
    
    // Exit early if LLM report is configured but no API key is available
    if ( args['--report']) {
        const llmConfig = config.llm || {};
        const apiKey = llmConfig.key || process.env.MODEL_KEY;
        if(llmConfig.model && !apiKey) {
            console.error('[novl optimize] Error: An LLM model is configured for report generation but no API key was found.');
            console.error('Set the MODEL_KEY environment variable or add llm.key to your optimize.config.js.');
            process.exit(1);
        }
    }

    // Show banner only once (if first check)
    if (isFirstCheck && config.apiMode !== true) {
        await cliBanner();
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
