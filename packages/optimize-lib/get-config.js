import fs from 'fs';
import { debug } from '@bynovl/optimize-utils/debug-log.js';
import mergeConfig from './merge-config.js';
import globalConfig from './set-config.js';
import path from 'path';
import { packageLoader } from './resolve-packages.js';

export async function getConfig(enabledChecks = []) {
    // 1. Initialize local defaults. We'll load configs based on enabled checks.
    let localDefaultConfig = {};

    // 2. Load package configs for all discovered optimize-* packages via packageLoader
    const pkgDirs = packageLoader();
    for (const pkgDir of pkgDirs) {
        const configPath = path.join(pkgDir, 'default.config.js');
        if (fs.existsSync(configPath)) {
            try {
                const packageDefaultConfig = (await import(configPath)).default;
                localDefaultConfig = mergeConfig(localDefaultConfig, packageDefaultConfig);
                debug(`[packageLoader] Loaded config from ${configPath}`);
            } catch (e) {
                debug(`Error importing config at ${configPath}: ${e.message}`);
            }
        }
    }

    // 3. Load user config
    let userConfig = {};
    const userConfigPath = path.resolve(process.cwd(), 'optimize.config.js');
    if (fs.existsSync(userConfigPath)) {
        userConfig = (await import(userConfigPath)).default;
    }

    // Merge: 1. global < 2. local < 3. User
    const mergedConfig = mergeConfig(globalConfig, localDefaultConfig, userConfig);
    debug('Merged config:', mergedConfig);
    return { config: mergedConfig };
}