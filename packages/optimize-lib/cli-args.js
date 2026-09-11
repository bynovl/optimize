import { isValidHttpUrl } from '@bynovl/optimize-utils/crawl-utils.js';
import { showHelp } from './get-help.js';
import path from 'node:path';

export const sharedHelpText = showHelp();

export function parseCliArgs(argv = process.argv.slice(2), helpText = sharedHelpText, version = null, checkModules = []) {
  const opts = {};

  const getOptionalFlagValue = (flag) => {
    if (!opts[flag]) return null;

    const index = argv.indexOf(flag);
    if (index === -1 || index + 1 >= argv.length) {
      return true;
    }

    const nextArg = argv[index + 1];
    if (nextArg.startsWith('--')) {
      return true;
    }

    return nextArg;
  };

  argv.forEach(arg => {
    if (arg.startsWith('--')) {
      opts[arg] = true;
    }
  });

  // Get dynamic check flags from checkModules
  const dynamicCheckFlags = checkModules.map(m => m.flag).filter(Boolean);

  // List of known flags for validation
  const systemFlags = [
    '--crawl',
    '--skills',
    '--setup',
    '--version',
    '--help',
    '--path',
    '--json',
    '--csv',
    '--report',
    '--ci',
    '--output',
    '--dry-run',
    '--force',
    '-v',
    '-h',
  ];

  // All known flags (system + dynamic)
  const knownFlags = new Set([...systemFlags, ...dynamicCheckFlags]);

  // Check for unknown flags in argv
  const unknown = argv.filter(tok => {
    // Only look at tokens that *look* like flags.
    if (!tok.startsWith('-')) return false;
    // If the token is exactly a known flag, it’s fine.
    if (knownFlags.has(tok)) return false;
    // Anything else (including “-x” or “--foo”) is unknown.
    return true;
  });

  const positional = [];
  if (argv.length > 0 && (argv[0] === 'web' || argv[0] === 'dashboard')) {
    positional.push(argv[0]);   // remember it
    argv = argv.slice(1);       // remove it so the flag loop sees only flags
  }

  if (positional.length) {
    opts._ = positional;   // e.g., opts._ = ['web']
  }

  // Safety/Helper for unknown flags: if any unknown flags are present, exit with an error message.
  if (unknown.length > 0) {
    // By default we just warn – the tool will keep running.
    // If you prefer a hard stop, set the env var OPTIMIZE_STRICT_FLAGS=1.
    const strict = process.env.OPTIMIZE_STRICT_FLAGS === '1';
    const msg = `Warning: Unrecognised CLI flag${unknown.length > 1 ? 's' : ''}: ${unknown.join(', ')}`;
    console.error(msg);
    console.error('Run with "npx optimize" with --help or "-h" to see the list of supported flags.');
    process.exit(1);
  }


  if (opts['--crawl'] && argv.indexOf('--crawl') + 1 < argv.length) {
    const crawlUrl = argv[argv.indexOf('--crawl') + 1];
    if (!isValidHttpUrl(crawlUrl)) {
      console.error('Error: --crawl flag must be followed by a valid URL (http/https).');
      process.exit(1);
    }
    opts['--crawl'] = crawlUrl;
  }

  if (opts['--skills']) {
    if (argv.indexOf('--skills') + 1 < argv.length) {
      const idx = argv.indexOf('--skills');
      const names = [];
      for (let i = idx + 1; i < argv.length; i++) {
        const token = argv[i];
        if (token.startsWith('--')) break;   // stop at the next flag
        names.push(token);
      }
      // store the array (empty = “install all”)
      opts['--skills'] = names;
    }
  }

  if (argv.includes('--setup')) {
    const idx = argv.indexOf('--setup');
    const next = argv[idx + 1];
    // If the next token exists and is *not* another flag, treat it as the mode
    if (next && !next.startsWith('--')) {
      opts['--setup'] = next;
    } else {
      opts['--setup'] = true;
    }
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
  // Ouput directory option
  if (opts['--output'] && argv.indexOf('--output') + 1 < argv.length) {
    opts['--output'] = argv[argv.indexOf('--output') + 1];
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