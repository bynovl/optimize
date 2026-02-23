// Dynamically load and merge default config settings from all @bynovl/optimize-* dependencies
import path from 'path';
import fs from 'fs';
// read our own package.json without using JSON module import assertions
const pkg = JSON.parse(fs.readFileSync(path.resolve(new URL(import.meta.url).pathname, '../package.json'), 'utf8'));
const rootPkgPath = path.join(process.cwd(), 'package.json');
const rootPkg = JSON.parse(fs.readFileSync(rootPkgPath, 'utf8'));

const optimizeDeps = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(rootPkg.dependencies || {})
].filter(
    name => /^@?bynovl\/optimize-/.test(name)
        && name !== '@bynovl/optimize-core'
        && name !== '@bynovl/optimize-utils'
        && name !== '@bynovl/optimize-lib'
        && name !== '@bynovl/optimize-tests'
);
import { resolvePackageRoot, packageLoader } from '@bynovl/optimize-lib/resolve-packages.js';

async function loadAndMergeConfigs() {
    let merged = {};
    for (const dep of optimizeDeps) {
        try {
            // attempt to locate module directory first
            let pkgRoot = resolvePackageRoot(dep);
            if (!pkgRoot) {
                // fallback: check in monorepo via packageLoader results
                const all = packageLoader();
                const short = dep.includes('/') ? dep.split('/').pop() : dep;
                pkgRoot = all.find(p => path.basename(p) === short);
            }
            if (pkgRoot) {
                const configPath = path.join(pkgRoot, 'default.config.js');
                if (fs.existsSync(configPath)) {
                    const mod = await import(configPath);
                    const config = mod.DEFAULT_CONFIG_SETTINGS || mod.default || {};
                    merged = { ...merged, ...config };
                    continue;
                }
            }
            // last-resort try specifier (may fail)
            const mod = await import(`${dep}/default.config.js`);
            const config = mod.DEFAULT_CONFIG_SETTINGS || mod.default || {};
            merged = { ...merged, ...config };
        } catch (err) {
            console.warn(`Could not load config for ${dep}:`, err);
        }
    }
    return merged;
}

export const DEFAULT_CONFIG_SETTINGS = await loadAndMergeConfigs();



