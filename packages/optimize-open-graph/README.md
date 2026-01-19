# @novl/optimize-open-graph

Open Graph validation submodule for NOVL Optimize. Checks HTML files for the presence, correctness, and completeness of Open Graph tags to ensure rich previews and best practices for static sites.

---

## Quick Start

**CLI:**
Single check
```bash
npx optimize-open-graph
```
Core CLI with flags (with Core package only):
```bash
npx optimize --open-graph
```
Defined config checks in `optimize.config.js` with Core package:
```js 
{ 
  "enabledChecks": ["--open-graph"]
}
```

**API:**
```js
import checkOpenGraph from '@novl/optimize-open-graph';
// config: object, htmlFiles: array of file paths
const results = await checkOpenGraph(config, htmlFiles);
```

---

## What It Does

- **Validates required Open Graph tags:**  
  Ensures each HTML file includes `<meta property="og:title">`, `<meta property="og:description">`, `<meta property="og:image">`, `<meta property="og:url">`, and other recommended tags.
- **Also validates Twitter tags:** Ensures each file include  `<meta name="twitter:card"> <meta name="twitter:title"> <meta name="twitter:description"> <meta name="twitter:image">`
- **Checks for missing, duplicate, or empty tags:**  
  Reports missing tags, duplicate tags, and tags with empty values.
- **Flags preview and sharing issues:**  
  Detects non-canonical URLs and nofollow robots text. 
- **Integrates with the NOVL Optimize CLI:**  
  Can be run standalone or as part of the full site check suite.

## Configuration

- Inherit config from the main `default.config.js` or provide a local config `optimize.config.js`.
- Key options:
  - `outDir`: Directory containing built HTML files.
  - `ignore`: Array of glob patterns or paths to exclude.
  - `batchSize`: Number of files to process in parallel.

See the [project README](../../README.md) for more full configuraton. 

## Output

Returns an array of result objects per file, with details for each Open Graph issue:
```js
[
  {
    "page": "index.html",
    "openGraph": [
      {
        "target": "<meta property=\"og:image\">",
        "reason": "missing og:image",
        "isError": true,
        "isWarning": false,
        "message": "Add an og:image for rich previews"
      },
      // ...
    ]
  }
]
```

## Developer Notes

- All validation and helper functions follow the strict parameter order:  
  `content, item, relPath, siteDir, file (optional), ...function-specific`
- To add new open graph checks, create a new helper in `optimize-open-graph/scripts/new-validation.js` and follow the module code patten and logic. *Note: this hasn't been thoroughly tested so if you use this feature and see a bug please let us know*

## Power your project
We love building and seeing other builds! Go ahead and use it your project. You can use `@bynovl/optimize-open-graph` to build your own tools or use it as a reference for best-practice utility logic for non-commercial use. *For full license terms see the [LICENSE](./LICENSE) file.*

## Contributing
We don't have the in-house capacity yet to manage a full pull-request lifecycle but we welcome new utilities and improvements. And we're committed to making changes every 3-weeks. Feel free to report an issue, suggest a patch, or request a feature and all that. 

If you're inspired to contribute, yay we love hellos. Join us in building cool things sometimes just because, others for a cause and a few with a dash of for profit to keep the lights on (no this wasn't AI).

Reach out at contributors@bynovl.com