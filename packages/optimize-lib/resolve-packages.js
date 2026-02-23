import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { debug } from '@bynovl/optimize-utils/debug-log.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_PREFIX = 'optimize-';
const SKIP_BASES = ['optimize-core', 'optimize-utils', 'optimize-lib', 'optimize-tests'];

let memoizedDirs = null;

// Walk up to find the nearest package.json, return its directory
function findRootDir(startDir) {
    let dir = path.resolve(startDir);
    while (dir !== path.dirname(dir)) {
        if (fs.existsSync(path.join(dir, 'package.json'))) return dir;
        dir = path.dirname(dir);
    }
    return null;
}

// Resolve a link:/file: specifier relative to rootDir
function resolveLinkedPath(version, rootDir) {
    if (!version || !version.match(/^(link|file):/)) return null;
    const rel = version.replace(/^link:|^file:/, '');
    const p = path.resolve(rootDir, rel);
    return fs.existsSync(p) ? p : null;
}

// Get current package directory (handles pnpm and monorepo)
export function getPackageRoot() {
    const monorepoIndex = __dirname.indexOf('./packages');
    const pnpmIndex = __dirname.indexOf('./node_modules/.pnpm');
    // If we're in a monorepo, packages will be under .../packages/
    if (monorepoIndex !== -1) {
        return path.join(__dirname.slice(0, monorepoIndex + 8), path.sep);
    // If we're in a pnpm workspace, packages will be under .../.pnpm/node_modules/@bynovl/
    } else if (pnpmIndex !== -1) {
        return path.join(__dirname.slice(0, pnpmIndex + 5), 'node_modules', '@bynovl');
    }
    // Otherwise, just return the parent directory (normal npm/yarn install)
    return path.dirname(__dirname);
}

// Discover all optimize-* packages in the root directory + linked custom packages. Memoized.
export function packageLoader() {
    if (memoizedDirs) return memoizedDirs;
    
    const root = getPackageRoot();
    const results = [];
    const seen = new Set();
    
    if (!fs.existsSync(root)) {
        return (memoizedDirs = []);
    }
    
    // 1. Scan the package root directory
    for (const entry of fs.readdirSync(root)) {
        if (!entry.startsWith(PACKAGE_PREFIX)) continue;
        if (SKIP_BASES.includes(entry)) continue;
        const full = path.join(root, entry);
        if (fs.existsSync(path.join(full, 'package.json'))) {
            results.push(full);
            seen.add(path.basename(full));
        }
    }
    
    // 2. Also check root package.json for linked/custom packages
    const rootDir = findRootDir(process.cwd());
    if (rootDir) {
        let pkgJson = {};
        try {
            pkgJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
        } catch (_) { /* ignore */ }
        
        const allDeps = Object.assign({}, pkgJson.dependencies, pkgJson.devDependencies);
        for (const [dep, version] of Object.entries(allDeps)) {
            if (!dep.includes(PACKAGE_PREFIX)) continue;
            const short = dep.split('/').pop();
            if (SKIP_BASES.includes(short) || seen.has(short)) continue;
            
            const linked = resolveLinkedPath(version, rootDir);
            if (linked && fs.existsSync(path.join(linked, 'package.json'))) {
                results.push(linked);
            }
        }
    }
    
    memoizedDirs = results;
    debug(`[packageLoader] discovered ${results.length} package(s)`);
    return memoizedDirs;
}