import { parseCliArgs, sharedHelpText } from './cli-args.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pkg = require('./package.json');

// Potential Extension: Possible to extend checks at this level with custom functions
// Recommend format

// Array of flag-function pairs (function names as strings)
export const checkModules = [
  { flag: '--meta', fn: 'checkMeta' },
  { flag: '--open-graph', fn: 'checkOpenGraph' },
  { flag: '--schema', fn: 'checkSchema' },
  { flag: '--hierarchy', fn: 'checkHierarchy' },
  { flag: '--accessibility', fn: 'checkAccessibility' },
  { flag: '--links', fn: 'checkLinks' },
  { flag: '--media', fn: 'checkMedia' },
  { flag: '--sources', fn: 'checkSources' },
];

// Return the requested flags, no imports or function references
export function cliDispatch() {
  const argv = process.argv.slice(2);
  const args = parseCliArgs(argv, sharedHelpText, pkg.version);
  const file = args['--file'] || null;

  // Determine which module flags are present
  const moduleFlags = checkModules.map(m => m.flag);
  const presentModuleFlags = Object.keys(args).filter(flag => moduleFlags.includes(flag));
  let enabledChecks;
  if (presentModuleFlags.length === 0) {
    // No module flags present (even if --ci is present): run all checks
    enabledChecks = moduleFlags;
  } else {
    // Only run specified module flags
    enabledChecks = presentModuleFlags;
  }
  return { args, enabledChecks, file };
}