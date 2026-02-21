// Dynamically load checkProps and each check function from optimize-* modules
import fs from 'fs';
import path from 'path';
import { debug } from '@bynovl/optimize-utils/debug-log.js';

export async function getCheckModules() {
  let isMonorepo = false;
  let packagesDir = path.resolve(process.cwd(), 'packages');
  let optimizeDeps = [];
  let sourceType = 'external';
  const checkModules = [];
  const checkExports = {};

  try {
    const corePkgPath = require.resolve('@bynovl/optimize-core/package.json');
    const corePkg = JSON.parse(fs.readFileSync(corePkgPath, 'utf8'));
    optimizeDeps = Object.keys(corePkg.dependencies || {}).filter(dep => dep.startsWith('@bynovl/optimize-'));
  } catch {
    if (fs.existsSync(packagesDir)) {
      isMonorepo = true;
      sourceType = 'monorepo';
      optimizeDeps = fs.readdirSync(packagesDir)
        .filter(pkg => pkg.startsWith('optimize-'))
        .filter(pkg => !pkg.endsWith('-tests') && !pkg.endsWith('-utils') && !pkg.endsWith('-lib') && !pkg.endsWith('-core'));
    }
  }

  // Helper to get check function and check-props paths for a given package
  function isPathTransform(pkg) {
    const checkFnPath = isMonorepo
      ? path.join(packagesDir, pkg, 'index.js')
      : `${pkg}/index.js`;
    const checkPropsPath = isMonorepo
      ? path.join(packagesDir, pkg, 'scripts', 'check-props.js')
      : `${pkg}/scripts/check-props.js`;
    if (isMonorepo && (!fs.existsSync(checkFnPath) || !fs.existsSync(checkPropsPath))) {
      return null;
    }
    return { checkFnPath, checkPropsPath, module: isMonorepo ? path.join(packagesDir, pkg) : pkg };
  }

  // Only log check loading and summary
  for (const pkg of optimizeDeps) {
    const paths = isPathTransform(pkg);
    if (!paths) {
      debug(`[getCheckModules] Skipping package (missing files): ${pkg}`);
      continue;
    }
    try {
      const checkPropsModule = await import(paths.checkPropsPath);
      const checkFnModule = await import(paths.checkFnPath);
      const checkProps = checkPropsModule.checkProps;
      const fn = checkFnModule.default || checkFnModule;
      checkModules.push({
        flag: checkProps.flag,
        fn,
        key: checkProps.key,
        label: checkProps.label,
        module: paths.module
      });
      checkExports[checkProps.key] = fn;
      checkExports['check' + checkProps.label.replace(/\s+/g, '')] = fn;
      debug(`[getCheckModules] Loaded check: ${checkProps.key} (${pkg})`);
    } catch (e) {
      debug(`[getCheckModules] Error loading check for ${pkg}:`, e && e.message);
    }
  }

  debug(`[getCheckModules] Total checks loaded: ${checkModules.length}`);

  return { checkModules, checkExports, sourceType };
}