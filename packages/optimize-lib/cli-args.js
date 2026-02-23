// Shared CLI argument parsing and helpers for NOVL Optimize
import { showHelp } from './get-help.js';

export const sharedHelpText = showHelp();

export function parseCliArgs(argv = process.argv.slice(2), helpText = sharedHelpText, version = null) {
  const opts = {};
  argv.forEach(arg => {
    if (arg.startsWith('--')) {
      opts[arg] = true;
    }
  });

  if (opts['--version'] || argv.includes('-v')) {
    if (version) console.log(version);
    opts._handled = true;
  }

  if (opts['--help'] || argv.includes('-h')) {
    if (helpText) console.log(sharedHelpText);
    opts._handled = true;
  }
  // path input option (use only --path for both file and directory)
  if (opts['--path'] && argv.indexOf('--path') + 1 < argv.length) {
    opts['--path'] = argv[argv.indexOf('--path') + 1];
  }
  // JSON output option
  if (opts['--json'] && argv.indexOf('--json') + 1 < argv.length) {
    opts['--json'] = argv[argv.indexOf('--json') + 1];
  }
  // CSV output option
  if (opts['--csv'] && argv.indexOf('--csv') + 1 < argv.length) {
    opts['--csv'] = argv[argv.indexOf('--csv') + 1];
  }

  return opts
}