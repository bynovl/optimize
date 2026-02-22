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

  let pkgDirs = [];

  // Extract current package name from path (works for any package)
  const currentPkg = path.basename(__dirname);
  debug(`[getCheckModules] __dirname: ${__dirname}`);
  debug(`[getCheckModules] Current package: ${currentPkg}`);

  // Determine parent directory based on path structure
  // In pnpm: .pnpm/node_modules/@bynovl/ contains the real packages
  // In monorepo/npm: parent of current package has siblings
  let parentDir;
  const pnpmIndex = __dirname.indexOf('.pnpm');
  if (pnpmIndex !== -1) {
    // pnpm: look in .pnpm/node_modules/@bynovl/
    parentDir = path.join(__dirname.slice(0, pnpmIndex + 5), 'node_modules', '@bynovl');
  } else {
    parentDir = path.dirname(__dirname);
  }
  debug(`[getCheckModules] Parent directory: ${parentDir}`);

  // Check parent directory for optimize-* packages
  const parentEntries = fs.readdirSync(parentDir, { withFileTypes: true })
    .filter(e => (e.isDirectory() || e.isSymbolicLink()) && e.name.includes('optimize-') && e.name !== currentPkg && !e.name.includes('optimize-tests') && !e.name.includes('optimize-utils') && !e.name.includes('optimize-lib') && !e.name.includes('optimize-core'));

  debug(`[getCheckModules] Found ${parentEntries.length} optimize-* packages in parent`);
  pkgDirs = parentEntries.map(e => path.join(parentDir, e.name));

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
