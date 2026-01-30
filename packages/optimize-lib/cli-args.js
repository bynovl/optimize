// Shared CLI argument parsing and helpers for NOVL Optimize

// Map of module flags to help text
export const moduleHelpTexts = {
  '--meta': `--meta           Run meta checks\n  Checks for meta tags: title, description, keywords, canonical, robots.`,
  '--open-graph': `--open-graph     Run open graph checks\n  Checks for Open Graph and Twitter meta tags for social sharing.`,
  '--schema': `--schema         Run schema checks\n  Validates structured data and schema.org markup.`,
  '--hierarchy': `--hierarchy      Run heading hierarchy checks\n  Checks heading order and nesting for semantic structure.`,
  '--accessibility': `--accessibility  Run accessibility checks\n  Validates accessibility features and ARIA attributes.`,
  '--links': `--links          Run link checks\n  Checks internal and external links for validity.`,
  '--media': `--media          Run media checks\n  Validates images, videos, and media tags.`,
  '--sources': `--sources        Run sources checks\n  Checks source tags and resource references.`
};

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
    // If module flags are present, show only relevant help
    const moduleFlags = Object.keys(moduleHelpTexts).filter(flag => opts[flag]);
    if (moduleFlags.length > 0) {
      moduleFlags.forEach(flag => console.log(moduleHelpTexts[flag]));
    } else {
      if (helpText) console.log(helpText);
    }
    opts._handled = true;
  }

  if (opts['--file'] && argv.indexOf('--file') + 1 < argv.length) {
    opts['--file'] = argv[argv.indexOf('--file') + 1];
  }

  return opts
}

export const sharedHelpText = `
Usage: optimize [options]

Options:
--meta                                 Run meta checks
--open-graph                           Run open graph checks
--schema                               Run schema checks
--hierarchy                            Run heading hierarchy checks
--accessibility                        Run accessibility checks
--links                                Run link checks
--media                                Run media checks
--sources                              Run sources checks
--all                                  Run all checks (default)
-v, --version                          Show version
-h, --help                             Show help
--ci                                   For CI/CD environments (non-interactive)
--file <path>                          Specify input file path (directory or HTML file)

Examples:

Pass any number of flags to isolate the checks you want to run:
npx optimize --meta --hierarchy  

Check a specific file:
npx optimize --file ./path/to/file.html --accessibility

Run all checks at once:
npx optimize                         
`;
