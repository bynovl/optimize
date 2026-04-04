import { parseCliArgs, sharedHelpText } from './cli-args.js';
import { createRequire } from 'module';
import { getCheckModules } from './get-check-modules.js';
import { readFileSync } from 'fs';
import { dirname, join, resolve } from 'path';

const require = createRequire(import.meta.url);

function resolveVersion(argv = [], enabledCheck = []) {
  const hasModuleFlag = enabledCheck.length > 0 || argv.some(a => a.startsWith('--') && a !== '--version' && a !== '--help' && a !== '--report' && a !== '--json' && a !== '--csv' && a !== '--path' && a !== '--ci');
  // No module-specific flag — default to core
  if (!hasModuleFlag) {
    try { return require('@bynovl/optimize-core/package.json').version; } catch {}
  }
  // Walk up from the running CLI file (max 3 levels: bin/ → package/ → scoped-org/)
  try {
    let dir = dirname(resolve(process.argv[1]));
    for (let i = 0; i < 3; i++) {
      try {
        const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
        if (pkg.version && pkg.name && pkg.name.startsWith('@bynovl/optimize')) return pkg.version;
      } catch {}
      const parent = resolve(dir, '..');
      if (parent === dir) break;
      dir = parent;
    }
  } catch {}
  try { return require('./package.json').version; } catch {}
  return null;
}

// Dynamically load module flags from getCheckModules
export async function cliDispatch(enabledCheck = []) {
  const argv = process.argv.slice(2);
  const args = parseCliArgs(argv, sharedHelpText, resolveVersion(argv, enabledCheck));

  // Get module flags dynamically
  const { checkModules } = await getCheckModules();
  const moduleFlags = checkModules.map(m => m.flag);
  let enabledChecks;
  let filteredModules = checkModules;

  if (enabledCheck && enabledCheck.length > 0) {
    // If enabledCheck is passed, filter to only that module
    enabledChecks = enabledCheck;
    filteredModules = checkModules.filter(m => enabledCheck.includes(m.flag));
  } else {
    const presentModuleFlags = Object.keys(args).filter(flag => moduleFlags.includes(flag));
    if (presentModuleFlags.length === 0) {
      // No module flags present (even if --ci is present): run all checks
      enabledChecks = moduleFlags;
    } else {
      // Only run specified module flags
      enabledChecks = presentModuleFlags;
      filteredModules = checkModules.filter(m => enabledChecks.includes(m.flag));
    }
  }
  return { args, enabledChecks, checkModules: filteredModules };
}