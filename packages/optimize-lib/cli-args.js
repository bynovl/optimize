import { isValidHttpUrl } from '@bynovl/optimize-utils/crawl-utils.js';
import { showHelp } from './get-help.js';

export const sharedHelpText = showHelp();

export function parseCliArgs(argv = process.argv.slice(2), helpText = sharedHelpText, version = null) {
  const opts = {};
  argv.forEach(arg => {
    if (arg.startsWith('--')) {
      opts[arg] = true;
    }
  });

  if (opts['--crawl'] && argv.indexOf('--crawl') + 1 < argv.length) {
    const crawlUrl = argv[argv.indexOf('--crawl') + 1];
    if (!isValidHttpUrl(crawlUrl)) {
      console.error('Error: --crawl flag must be followed by a valid URL (http/https).');
      process.exit(1);
    }
    opts['--crawl'] = crawlUrl;
  }

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
  // Report output option
  if (opts['--report'] && argv.indexOf('--report') + 1 < argv.length) {
    opts['--report'] = argv[argv.indexOf('--report') + 1];
  }

  return opts
}