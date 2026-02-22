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

  // Get siblings of optimize-lib (the parent directory contains all optimize-* packages)
  const parentDir = path.dirname(__dirname);
  debug(`[getCheckModules] Parent directory: ${parentDir}`);

  // List all sibling directories that have scripts/check-props.js
  const siblings = fs.readdirSync(parentDir, { withFileTypes: true })
    .filter(e => e.isDirectory() && e.name.startsWith('optimize-') && e.name !== 'optimize-lib' && e.name !== 'optimize-tests');

  debug(`[getCheckModules] Found ${siblings.length} optimize-* siblings`);

  for (const sibling of siblings) {
    const pkgRoot = path.join(parentDir, sibling.name);
    const checkPropsPath = path.join(pkgRoot, 'scripts', 'check-props.js');
    const indexPath = path.join(pkgRoot, 'index.js');

    if (!fs.existsSync(checkPropsPath) || !fs.existsSync(indexPath)) {
      debug(`[getCheckModules] Skipping ${sibling.name}: missing check-props.js or index.js`);
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
        module: sibling.name
      });
      checkExports[checkProps.key] = fn;
      checkExports['check' + checkProps.label.replace(/\s+/g, '')] = fn;
      debug(`[getCheckModules] Loaded check: ${checkProps.key} (${sibling.name})`);
    } catch (e) {
      debug(`[getCheckModules] Error loading ${sibling.name}:`, e && e.message);
    }
  }

  debug(`[getCheckModules] Total checks loaded: ${checkModules.length}`);
  return { checkModules, checkExports };
}
