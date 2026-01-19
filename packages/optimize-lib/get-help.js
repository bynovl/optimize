export function showHelp() {
  console.log(`
Automate accessibility, SEO, GEO, and best practice checks for any static site.
Runs all checks when not passing arguments.

Configurable, extensible, and compatible with all static site generators.

Command:
  optimize                Run all checks concurrently
  optimize [flags]        Run specific checks

Flags:
  --meta                  Check required meta tags (title, description, canonical, and keywords)
  --open-graph            Check open graph tags (og:title, og:description, og:image, og:url, twitter:title, twitter:desc, twitter:image)
  --schema                Check default and custom schema JSON-LD
  --sources               Check internal and external links referenced in <script src=""> and <link href="">
  --hierarchy             Check heading structure and hierarchy
  --accessibility         Check accessibility best practices (alt text, form labels, tab-index)
  --media                 Check media elements (img support only right now) for alt text, internal and external links
  --links                 Check hash (#), internal and external links
  --version, -v           Show version number
  --help, -h              Show help information

Examples:
  optimize
  optimize --meta --hierarchy
  optimize --version

For more info, visit: https://github.com/bynovl/optimize
`);
}