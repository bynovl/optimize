// Dynamically load checkProps and each check function from optimize-* modules
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { debug } from '@bynovl/optimize-utils/debug-log.js';

// Get this module's directory (works for both symlinked and direct installs)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function getCheckModules() {
  const checkModules = [];
  const checkExports = {};

  // Try to find optimize-* packages in multiple locations:
  // 1. Siblings of this module's parent (monorepo / flat node_modules)
  // 2. node_modules/@bynovl walking up from this module (pnpm / npm / yarn)

  let pkgDirs = [];

  // 1. Check siblings first (monorepo structure: packages/optimize-*)
  const parentDir = path.dirname(__dirname);
  debug(`[getCheckModules] Parent directory: ${parentDir}`);

  const siblings = fs.readdirSync(parentDir, { withFileTypes: true })
    .filter(e => e.isDirectory() && e.name.startsWith('optimize-') && e.name !== 'optimize-lib' && e.name !== 'optimize-tests');

  if (siblings.length > 0) {
    debug(`[getCheckModules] Found ${siblings.length} optimize-* siblings`);
    pkgDirs = siblings.map(s => path.join(parentDir, s.name));
  } else {
    // 2. Fallback: walk up looking for node_modules/@bynovl (pnpm/npm/yarn installs)
    debug(`[getCheckModules] No siblings found, searching node_modules/@bynovl...`);
    let currentDir = __dirname;
    while (true) {
      const bynovlDir = path.join(currentDir, 'node_modules', '@bynovl');
      if (fs.existsSync(bynovlDir)) {
        debug(`[getCheckModules] Found @bynovl at: ${bynovlDir}`);
        const entries = fs.readdirSync(bynovlDir, { withFileTypes: true })
          .filter(e => e.isDirectory() && e.name.startsWith('optimize-') && e.name !== 'optimize-lib' && e.name !== 'optimize-tests');
        pkgDirs = entries.map(e => path.join(bynovlDir, e.name));
        if (pkgDirs.length > 0) break;
      }
      const parent = path.dirname(currentDir);
      if (parent === currentDir) break;
      currentDir = parent;
    }
    debug(`[getCheckModules] Found ${pkgDirs.length} packages in node_modules/@bynovl`);
  }

  // Load check modules from each package directory
  for (const pkgRoot of pkgDirs) {
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
