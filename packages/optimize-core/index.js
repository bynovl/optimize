import { getCheckModules } from '@bynovl/optimize-lib/get-check-modules.js';

// Export a mapping object for programmatic use
export const checkFns = await getCheckModules().then(mods => mods.checkExports);

// Optionally, export a function to run all enabled checks
export async function runAllChecks(config, htmlFiles, startUrl) {
  const { checkModules } = await getCheckModules();
  let checksToRun;
  if (config.enabledChecks && Array.isArray(config.enabledChecks) && config.enabledChecks.length > 0) {
    checksToRun = config.enabledChecks
      .map(flag => checkModules.find(m => m.flag === flag))
      .filter(Boolean);
  } else {
    // fallback: run all checkModules
    checksToRun = checkModules;
  }
  return await Promise.all(
    checksToRun.map(mod => mod.fn(config, htmlFiles, startUrl))
  );
}