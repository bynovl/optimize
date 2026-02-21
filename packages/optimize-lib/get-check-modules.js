// Dynamically load checkProps and each check function from optimize-* modules
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getPackageRoot, searchFromDir } from './resolve-packages.js';
import { debug } from '@bynovl/optimize-utils/debug-log.js';

// Get this module's directory (works for both symlinked and direct installs)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function getCheckModules() {
  const checkModules = [];
  const checkExports = {};

  // Collect all check-props.js files from node_modules and packages/
  const seen = new Set();
  const checkPropsFiles = [];

  // 1. Search from where THIS module is located (handles external installs, symlinks)
  debug(`[getCheckModules] Module location: ${__dirname}`);
  searchFromDir(__dirname, seen, checkPropsFiles);

  // Dedupe by package root
  debug(`[getCheckModules] Total check-props.js files found: ${checkPropsFiles.length}`);
  const pkgRoots = new Set();
  for (const checkPropsPath of checkPropsFiles) {
    const pkgRoot = getPackageRoot(checkPropsPath);
    if (pkgRoot && !pkgRoots.has(pkgRoot)) {
      pkgRoots.add(pkgRoot);
    }
  }

  // Load check modules from each package root
  debug(`[getCheckModules] Unique package roots: ${[...pkgRoots].join(', ')}`);
  for (const pkgRoot of pkgRoots) {
    const pkgName = path.basename(pkgRoot);
    const checkPropsPath = path.join(pkgRoot, 'scripts', 'check-props.js');
    const indexPath = path.join(pkgRoot, 'index.js');

    if (!fs.existsSync(checkPropsPath) || !fs.existsSync(indexPath)) {
      debug(`[getCheckModules] Skipping ${pkgName}: missing check-props.js or index.js`);
      continue;
    }

    try {
      debug(`[getCheckModules] Importing: ${checkPropsPath}, ${indexPath}`);
      const checkPropsModule = await import(checkPropsPath);
      const checkFnModule = await import(indexPath);
      const checkProps = checkPropsModule.checkProps;
      const fn = checkFnModule.default || checkFnModule;

      checkModules.push({
        flag: checkProps.flag,
        fn,
        key: checkProps.key,
        label: checkProps.label,
        module: pkgName
      });
      checkExports[checkProps.key] = fn;
      checkExports['check' + checkProps.label.replace(/\s+/g, '')] = fn;
      debug(`[getCheckModules] Loaded check: ${checkProps.key} (${pkgName})`);
    } catch (e) {
      debug(`[getCheckModules] Error loading ${pkgName}:`, e && e.message);
    }
  }

  debug(`[getCheckModules] Total checks loaded: ${checkModules.length}`);
  return { checkModules, checkExports };
}
