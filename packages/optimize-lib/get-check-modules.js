// Dynamically load checkProps and each check function from optimize-* modules
import path from 'path';
import fs from 'fs';
const __dirname = path.dirname(new URL(import.meta.url).pathname); 

export async function getCheckModules() {
  const packagesDir = path.join(__dirname, '..');
  const checkModules = [];
  const checkExports = {};
  for (const pkg of fs.readdirSync(packagesDir)) {
    if (pkg.startsWith('optimize-')) {
      const checkPropsPath = path.join(packagesDir, pkg, 'scripts', 'check-props.js');
      const checkFnPath = path.join(packagesDir, pkg, 'index.js');
      if (fs.existsSync(checkPropsPath) && fs.existsSync(checkFnPath)) {
        const checkPropsModule = await import(checkPropsPath);
        const checkFnModule = await import(checkFnPath);
        const checkProps = checkPropsModule.checkProps;
        const fn = checkFnModule.default || checkFnModule;
        checkModules.push({
          flag: checkProps.flag,
          fn,
          key: checkProps.key,
          label: checkProps.label,
          module: pkg
        });
        // Export each check function by its key and by its conventional name (e.g. checkMeta)
        checkExports[checkProps.key] = fn;
        const exportName = 'check' + checkProps.label.replace(/\s+/g, '');
        checkExports[exportName] = fn;
      }
    }
  }
  // Return both modules and exports for programmatic use
  return { checkModules, checkExports };
}