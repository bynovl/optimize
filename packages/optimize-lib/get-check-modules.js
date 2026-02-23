// Dynamically load checkProps and each check function from optimize-* modules
import fs from 'fs';
import path from 'path';
import { debug } from '@bynovl/optimize-utils/debug-log.js';
import { packageLoader } from './resolve-packages.js';

export async function getCheckModules() {
  const checkModules = [];
  const checkExports = {};
  
  // Use the optimized package loader for discovery
  const pkgDirs = packageLoader();

  for (const pkgRoot of pkgDirs) {
    const pkgName = path.basename(pkgRoot);
    const indexPath = path.join(pkgRoot, 'index.js');
    let checkPropsPath = path.join(pkgRoot, 'scripts', 'check-props.js');
    if (!fs.existsSync(checkPropsPath)) {
      checkPropsPath = path.join(pkgRoot, 'check-props.js');
    }
    if (!fs.existsSync(checkPropsPath) || !fs.existsSync(indexPath)) {
      continue;
    }

    try {
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
    } catch (e) {
      console.warn(`Failed to load check module from ${pkgRoot}: ${e.message}`);
    }
  }
  debug(`[getCheckModules] Total checks loaded: ${checkModules.length}`);
  return { checkModules, checkExports };
}
