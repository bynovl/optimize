import fs from 'fs';
import { debug } from '@bynovl/optimize-utils/debug-log.js';
import mergeConfig from './merge-config.js';
import globalConfig from './set-config.js';
import path from 'path';
import { packageLoader } from './resolve-packages.js';
import { loadCheckWeights } from './load-check-weights.js';


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

export async function defaultConfig() {
    // Start with global defaults
    let combinedConfig = { outDir: getDefaultOutDir(), ...globalConfig };
    const pkgDirs = packageLoader();
    for (const pkgDir of pkgDirs) {
        const configPath = path.join(pkgDir, 'default.config.js');
        if (fs.existsSync(configPath)) {
            try {
                const packageDefaultConfig = (await import(configPath)).default;
                // Merge package default config into combined config
                combinedConfig = mergeConfig(combinedConfig, packageDefaultConfig);
                debug(`[packageLoader] Loaded config from ${configPath}`);
            } catch (e) {
                debug(`Error importing config at ${configPath}: ${e.message}`);
            }
        }
    }
    /// Load check weights from all packages and merge into combined config
    const checkWeights = await loadCheckWeights();
    combinedConfig.checkWeights = { ...combinedConfig.checkWeights, ...checkWeights };
    return combinedConfig;
}

export async function getConfig(enabledChecks = []) {
    // 1. Initialize local defaults. We'll load configs based on enabled checks.
    const combinedDefaultConfig = await defaultConfig();

    // 3. Load user config
    let userConfig = {};
    const userConfigPath = path.resolve(process.cwd(), 'optimize.config.js');
    if (fs.existsSync(userConfigPath)) {
        userConfig = (await import(userConfigPath)).default;
    }

    // Merge: 1. global < 2. local < 3. User
    const mergedConfig = mergeConfig(combinedDefaultConfig, userConfig);
    debug('Merged config:', mergedConfig);
    return { config: mergedConfig };
}