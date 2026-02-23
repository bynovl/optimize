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
    // Markers for detection
    const pnpmMarker = '/node_modules/.pnpm';
    const monorepoMarker = '/optimize/packages';
    const pnpmIndex = __dirname.indexOf(pnpmMarker);
    const monorepoIndex = __dirname.indexOf(monorepoMarker);

    let result;

    if (pnpmIndex !== -1) {
        result = path.join(__dirname.slice(0, pnpmIndex + pnpmMarker.length), 'node_modules', '@bynovl');
        debug(`[packageLoader] Detected pnpm workspace. Using package root: ${result}`); // --- IGNORE ---
    } else if (monorepoIndex !== -1) {
        result = path.join(__dirname.slice(0, monorepoIndex + monorepoMarker.length));
        debug(`[packageLoader] Detected monorepo workspace. Using package root: ${result}`); // --- IGNORE ---
    } else {
        result = path.dirname(__dirname);
        debug(`[packageLoader] Detected npm/yarn workspace. Using package root: ${result}`); // --- IGNORE ---
    }

    return result;
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