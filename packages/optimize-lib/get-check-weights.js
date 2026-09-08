import fs from 'fs';
import path from 'path';
import { debug } from '@bynovl/optimize-utils/debug-log.js';
import { packageLoader } from './resolve-packages.js';

function pickWeightFromCheckProps(checkProps = {}) {
    if (typeof checkProps.key !== 'string' || typeof checkProps.weight !== 'number') {
        return null;
    }
    return { key: checkProps.key, weight: checkProps.weight };
}

export async function loadCheckWeights() {
    const checkWeights = {};
    const pkgDirs = packageLoader();

    for (const pkgRoot of pkgDirs) {
        let checkPropsPath = path.join(pkgRoot, 'scripts', 'check-props.js');
        if (!fs.existsSync(checkPropsPath)) {
            checkPropsPath = path.join(pkgRoot, 'check-props.js');
        }

        if (!fs.existsSync(checkPropsPath)) continue;

        try {
            const module = await import(checkPropsPath);
            const parsed = pickWeightFromCheckProps(module?.checkProps);
            if (parsed) checkWeights[parsed.key] = parsed.weight;
        } catch (e) {
            debug(`[loadCheckWeights] Failed to load check props from ${checkPropsPath}: ${e.message}`);
        }
    }

    // Local fallback to support custom check development in a consumer project.
    try {
        const localPath = path.join(process.cwd(), 'scripts', 'check-props.js');
        if (fs.existsSync(localPath)) {
            const localModule = await import(localPath);
            const parsed = pickWeightFromCheckProps(localModule?.checkProps);
            if (parsed) checkWeights[parsed.key] = parsed.weight;
        }
    } catch (e) {
        debug(`[loadCheckWeights] Failed to load local check props: ${e.message}`);
    }

    return checkWeights;
}
