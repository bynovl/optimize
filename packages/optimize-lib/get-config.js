import fs from 'fs';
import { debug } from '@bynovl/optimize-utils/debug-log.js';
import mergeConfig from './merge-config.js';
import globalConfig from './set-config.js';
import path from 'path';

export async function getConfig(enabledChecks = []) {
    // 1. Load global config from import
    let localDefaultConfig = {};
    let globalCoreLoaded = false;
    try {
        // Try to import global core config via package specifier (production/external)
        const coreConfig = (await import('@bynovl/optimize/default.config.js')).default;
        localDefaultConfig = mergeConfig(localDefaultConfig, coreConfig);
        globalCoreLoaded = true;
        debug('Loaded global core config via package specifier.');
    } catch (e) {
        debug('Could not import global core config via package specifier:', e.message);
    }

    // Load user config
    let userConfig = {};
    const userConfigPath = path.resolve(process.cwd(), 'optimize.config.js');
    if (fs.existsSync(userConfigPath)) {
        userConfig = (await import(userConfigPath)).default;
    }

    // Determine enabled checks from user config or function argument
    let checksArray = [];
    if (userConfig.enabledChecks) {
        checksArray = Array.isArray(userConfig.enabledChecks) ? userConfig.enabledChecks : [userConfig.enabledChecks];
    } else {
        checksArray = Array.isArray(enabledChecks) ? enabledChecks : [enabledChecks];
    }

    // 2. Load package configs for enabled checks only if global core config is not loaded
    if (!globalCoreLoaded) {
        for (const check of checksArray) {
            const packageName = check.replace('--', 'optimize-');
            let loaded = false;
            try {
                // Try to import using the package specifier (production/external)
                const packageDefaultConfig = (await import(`@bynovl/${packageName}/default.config.js`)).default;
                localDefaultConfig = mergeConfig(localDefaultConfig, packageDefaultConfig);
                loaded = true;
                debug(`Package: Loaded default config for ${packageName} via package specifier.`);
            } catch (e) {
                debug(`Error importing config for ${packageName} via package specifier:`, e.message);
                // Fallback: Try physical path for monorepo/dev
                const monorepoConfigPath = path.resolve('packages', packageName, 'default.config.js');
                if (fs.existsSync(monorepoConfigPath)) {
                    try {
                        const packageDefaultConfig = (await import(monorepoConfigPath)).default;
                        localDefaultConfig = mergeConfig(localDefaultConfig, packageDefaultConfig);
                        loaded = true;
                        debug(`Monorepo: Loaded default config for ${packageName} from local monorepo packages.`);
                    } catch (e2) {
                        debug(`Could not load default config for ${packageName} from local monorepo packages:`, e2.message);
                    }
                }
            }
            if (!loaded) {
                debug(`Could not load default config for ${packageName} from either package specifier or local monorepo.`);
            }
        }
    }

    // Merge: 1. global < 2. local < 3. User
    const mergedConfig = mergeConfig(globalConfig, localDefaultConfig, userConfig);
    debug('Merged config:', mergedConfig);

    return { config: mergedConfig };
}