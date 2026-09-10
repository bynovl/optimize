export function showHelp() {
  return `
Automate accessibility, SEO, GEO, and best practice checks for any static site.
Runs all checks when not passing arguments. Configurable, extensible, and 
compatible with all static site generators.

Command:
  optimize                Run all checks concurrently
  optimize [flags]        Run specific checks

Check Flags:
  --meta                  Check required meta tags (title, description, canonical, and keywords)
  --open-graph            Check open graph and twitter tags
  --schema                Check default and custom schema JSON-LD
  --sources               Check internal and external links referenced in <script src=""> and <link href="">
  --hierarchy             Check heading structure and hierarchy
  --accessibility         Check accessibility best practices (alt text, form labels, tab-index)
  --media                 Check media elements for alt text, internal and external links
  --links                 Check hash (#), internal and external links

Output Flags:
  --path [file or dir]   Specify a file or directory to check (defaults to current directory)
  --json [output.json]   Output results in JSON format to a file
  --csv [output.csv]     Output results in CSV format to a file
  --report               Generate an Technical Audit (Markdown).
  --ci                   For CI/CD environments (non-interactive)
  
Crawl Flag:  
  --crawl [URL]          Crawl a web page by entering URL. For full site crawl use Cloudflare crawl token and configure in optimize.config.js

General Flags:
  --help, -h            Show this help message
  --version, -v         Show version number
  --setup [mode]        Create project files. Mode: config, custom-check, extend-check, workflow, all. If no mode is provided, the default config file will be created.
  --skills [name]       Installs all skills by default with name. Or provide the skills you want to install. For example: --skills site fix analyze.

Examples:
  optimize 
  optimize --meta --hierarchy
  optimize --path ./dist --json results.json

For more info, visit: https://github.com/bynovl/optimize
`;
}