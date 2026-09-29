import fs from 'fs';
import { debug } from '@bynovl/optimize-utils/debug-log.js';
import mergeConfig from './merge-config.js';
import globalConfig from './set-config.js';
import path from 'path';
import { packageLoader } from './resolve-packages.js';
import { loadCheckWeights } from './get-check-weights.js';
import { pathToFileURL } from 'url';
import { createRequire } from 'node:module';

const CONFIG_FILENAMES = [
    'optimize.config.js',
    'optimize.config.mjs',
    'optimize.config.cjs',
];

// Shared helper: both loadConfig and updateUserConfig use this
export function findConfigPath(cwd = process.cwd(), filenames = CONFIG_FILENAMES) {
    return filenames
        .map((f) => path.resolve(cwd, f))
        .find((fp) => fs.existsSync(fp)) || null;
}
// User config helper
export async function loadConfig(configFile) {
    if (!configFile) {
        return {};
    }

    const importedConfig = await import(pathToFileURL(configFile).href);

    // ESM: export default {...}
    // CommonJS: module.exports = {...}
    const config = importedConfig.default ?? importedConfig;

    if (typeof config === 'function') {
        return await config();
    }

    return config;
}
// Get default dir 
function getDefaultOutDir() {
    const defaultDirs = ['_opt', 'dist', 'out', '_site', '_build', 'public'];
    let ourDir = null;
    for (const dir of defaultDirs) {
        if (fs.existsSync(dir) && fs.lstatSync(dir).isDirectory()) {
            ourDir = dir;
            break;
        }
    }
    return ourDir;
}
// Default config 
export async function defaultConfig() {
    // Start with global defaults
    let combinedConfig = { outDir: getDefaultOutDir(), ...globalConfig };
    const pkgDirs = packageLoader();
    for (const pkgDir of pkgDirs) {
        const configPath = path.join(pkgDir, 'default.config.js');
        if (fs.existsSync(configPath)) {
            try {
                const packageDefaultConfig = (await import(pathToFileURL(configPath).href)).default;
                // Merge package default config into combined config
                combinedConfig = mergeConfig(combinedConfig, packageDefaultConfig);
                debug(`[packageLoader] Loaded config from ${configPath}`);
            } catch (e) {
                debug(`Error importing config at ${configPath}: ${e.message}`);
            }
        }
    }
    // Load check weights from all packages and merge into combined config
    const checkWeights = await loadCheckWeights();
    combinedConfig.checkWeights = { ...combinedConfig.checkWeights, ...checkWeights };
    return combinedConfig;
}

// Get config 
export async function getConfig(enabledChecks = []) {
    // 1. Initialize local defaults. We'll load configs based on enabled checks.
    const combinedDefaultConfig = await defaultConfig();

    // 2. Load user config
    let userConfig = {};
    const getConfigPath = findConfigPath();
    const userConfigPath = await loadConfig(getConfigPath);

    if (fs.existsSync(userConfigPath)) {
        userConfig = (await import(pathToFileURL(userConfigPath).href)).default;
    }

    // Merge: 1. global < 2. local < 3. User
    const mergedConfig = mergeConfig(combinedDefaultConfig, userConfig);
    debug('Merged config:', mergedConfig);
    return { config: mergedConfig };
}
