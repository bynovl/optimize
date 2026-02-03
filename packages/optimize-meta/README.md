# @novl/optimize-meta

Meta tag validation submodule for NOVL Optimize. Checks HTML files for the presence, uniqueness, and completeness of essential meta tags to ensure SEO and best practices for static sites.

## Quick Start

**CLI:**
Single check
```bash
npx optimize-meta
```
Core CLI with flags (with core package only):
```bash
npx optimize --meta
```
Defined config checks in `optimize.config.js` with Core package:
```js 
{ 
  "enabledChecks": ["--meta"]
}
```

**API:**
```js
import checkMeta from '@novl/optimize-meta/index.js';
// config: object, htmlFiles: array of file paths
const results = await checkMeta(config, htmlFiles);
```

## What It Does

- **Validates required meta tags:**  
  Ensures each HTML file includes `<title>`, `<meta name="description">`, `<meta name="keywords">`, `<link rel="canonical">`, and `<meta name="robots">` as appropriate.
- **Checks for missing, duplicate, or empty tags:**  
  Reports missing tags, duplicate tags, and tags with empty values.
- **Flags SEO blockers:**  
  Detects `noindex`/`nofollow` in robots meta tags.
- **Integrates with the NOVL Optimize CLI:**  
  Can be run standalone or as part of the full site check suite.

## Configuration

- Inherit config from the main `default.config.js` or provide a local config `optimize.config.js`.
- Key options:
  - `outDir`: Directory containing built HTML files.
  - `ignore`: Array of glob patterns or paths to exclude.
  - `batchSize`: Number of files to process in parallel.

See the [project README](../../README.md) for full configuraton. 

## Output

Returns an array of result objects per file, with details for each meta tag issue:
```js
[
  {
    "page": "index.html",
    "meta": [
      {
        "target": "<meta name=\"description\">",
        "reason": "missing description",
        "isError": true,
        "isWarning": false,
        "message": "Add a meta description for SEO"
      },
      // ...
    ]
  }
]
```

## Developer Notes

- All validation and helper functions follow the strict parameter order:  
  `content, item, relPath, siteDir, file (optional), ...function-specific`
- To add new hierarchy checks, create a new helper in `optimize-meta/scripts/new-validation.js` and follow the module code pattern and logic. *Note: this hasn't been thoroughly tested so if you use this feature and see a bug please let us know*


## Power your project
We love building and seeing other builds! Go ahead and use it your project. You can use `@bynovl/optimize-meta` to build your own tools or use it as a reference for best-practice utility logic for non-commercial use. *For full license terms see the [LICENSE](./LICENSE) file.*

## Contributing
We don't have the in-house capacity yet to manage a full pull-request lifecycle but we welcome new utilities and improvements. And we're committed to making changes every 3-weeks. Feel free to report an issue, suggest a patch, or request a feature and all that. 

If you're inspired to contribute, yay we love hellos. Join us in building cool things sometimes just because, others for a cause and a few with a dash of for profit to keep the lights on (no this wasn't AI).

Reach out at contributors@bynovl.com