# @novl/optimize-accessibility

Accessibility validation submodule for NOVL Optimize. Checks HTML files for accessibility best practices, ARIA usage, and common a11y issues to ensure static sites are usable by everyone.

## Quick Start

**CLI:**
Single check
```bash
npx optimize-accessibility
```
Core CLI with flags (with core package only):
```bash
npx optimize --accessibility
```
Defined config checks in `optimize.config.js` with Core package:
```js 
{ 
  "enabledChecks": ["--accessibility"]
}
```

**API:**
```js
import checkAccessibility from '@novl/optimize-accessibility/index.js';
// config: object, htmlFiles: array of file paths
const results = await checkAccessibility(config, htmlFiles);
```

## What It Does

- **Validates accessibility attributes and structure:**  
  Ensures presence and correctness of ARIA attributes, alt text, and form labels.
- **Checks for missing, duplicate, or empty attributes:**  
  Reports missing `alt` text, unlabeled form fields, duplicate IDs, and aria attributess
- **Integrates with the NOVL Optimize CLI:**  
  Can be run standalone or as part of the full site check suite.

## Configuration

- Inherit config from the main `default.config.js` or provide a local config `optimize.config.js`.
- Key options:
  - `outDir`: Directory containing built HTML files.
  - `ignore`: Array of glob patterns or paths to exclude.
  - `batchSize`: Number of files to process in parallel.

See the [project README](../../README.md) for full configuration and parameter conventions.

## Output

Returns an array of result objects per file, with details for each accessibility issue:
```js
[
  {
    "page": "index.html",
    "accessibility": [
      { "target": "<img>", "reason": "missing alt attribute", ... },
      // ...
    ]
  }
]

```
## Developer Notes

- All validation and helper functions follow the strict parameter order:  
  `content, item, relPath, siteDir, file (optional), ...function-specific`
- To add new accessibility checks, create a new helper in `optimize-accessibility/scripts/new-validation.js` following the existing project pattern. *Note: this hasn't been thoroughly tested so if you use this feature and see a bug please let us know*


## Power your project
We love building and seeing other builds! Go ahead and use it your project. You can use `@bynovl/optimize-acceesibility` to build your own static site QA tools, or as a reference for best-practice utility logic for non-commercial use. *For full license terms see the [LICENSE](./LICENSE) file.*

## Contributing
We don't have the in-house capacity yet to manage a full pull-request lifecycle but we welcome new utilities and improvements. And we're committed to making changes every 3-weeks. Feel free to report an issue, suggest a patch, request a feature and all that. 

If you're inspired to contribute, yay we love hellos. Join us in building cool things sometimes just because, others for a cause and a few with a dash of for profit to keep the lights on (no this wasn't AI).

Reach out at contributors@bynovl.com
