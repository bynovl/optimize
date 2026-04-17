import { parseCliArgs, sharedHelpText } from './cli-args.js';
import { getCheckModules } from './get-check-modules.js';
import { resolveVersion } from '@bynovl/optimize-utils/resolve-version.js';

// Dynamically load module flags from getCheckModules
export async function cliDispatch(enabledCheck = []) {
  // Get CLI args
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
  // Pass crawlUrl in args for scriptHeader
  return { args, enabledChecks, checkModules: filteredModules };
}