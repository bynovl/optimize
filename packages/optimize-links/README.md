# @novl/optimize-links

Links validation submodule for NOVL Optimize. Checks HTML files for valid, working, and well-structured internal and external links to ensure site integrity and best practices for static sites.

---

## Quick Start

**CLI:**
Single check
```bash
npx optimize-links
```
Core CLI with flags (with core package only):
```bash
npx optimize --links
```
Defined config checks in `optimize.config.js`:
```js 
{ 
  "enabledChecks": ["--links"]
}
```

**API:**
Meant to be used for local use only.

```js
import checkLinks from '@bynovl/optimize-links/index.js';
// config: object, htmlFiles: array of file paths
const results = await checkLinks(config, htmlFiles);
```

---

## What It Does

- **Validates internal and external links:**  
  Checks for broken links, unreachable URLs, and malformed hrefs.
- **Checks for missing or empty hrefs:**  
  Reports anchor tags without hrefs or with empty values.
- **Flags redirect and protocol issues:**  
  Detects HTTP/HTTPS mismatches, excessive redirects, and non-canonical URLs.
- **Integrates with the NOVL Optimize CLI:**  
  Can be run standalone or as part of the full site check suite.

## Configuration

- Inherit config from the global config or provide a local config `optimize.config.js`.

Key options:
  - `outDir`: Directory containing built HTML files.
  - `ignore`: Array of glob patterns or paths to exclude.
  - `batchSize`: Number of files to process in parallel.
  - `processingType`: Link processing mode (`default`, `concurrent`, or `max`).
  - `processingSize`: Batch size or max links to process per page (integer).

See [Project README](../../README.md) for full configuration and parameter conventions.

## Output

Returns an array of result objects per file, with details for each link issue:
```js
[
  {
    "page": "about.html",
    "links": [
      {
        "target": "<a href=\"/broken\">",
        "reason": "broken internal link",
        "isError": true,
        "isWarning": false,
        "message": "Link to /broken not found in output directory"
      },
      // ...
    ]
  }
]
```

## Developer Notes

- All validation and helper functions follow the strict parameter order:  
  `content, item, relPath, siteDir, file (optional), ...function-specific`
- To add new hierarchy checks, create a new helper in `optimize-links/scripts/new-validation.js` and follow the module code pattern and logic. *Note: this hasn't been thoroughly tested so if you use this feature and see a bug please let us know*


## Power your project
We love building and seeing other builds! Go ahead and use it your project. You can use `@bynovl/optimize-links` to build your own tools or use it as a reference for best-practice utility logic for non-commercial use. *For full license terms see the [LICENSE](./LICENSE) file.*

## Contributing
We don't have the in-house capacity yet to manage a full pull-request lifecycle but we welcome new utilities and improvements. And we're committed to making changes every 3-weeks. Feel free to report an issue, suggest a patch, or request a feature and all that. 

If you're inspired to contribute, yay we love hellos. Join us in building cool things sometimes just because, others for a cause and a few with a dash of for profit to keep the lights on (no this wasn't AI).

Reach out at contributors@bynovl.com