# @novl/optimize-media

Media validation submodule for NOVL Optimize. Checks HTML files for valid, accessible, and optimized use of images, video, and other media assets to ensure best practices for static sites.

---

## Quick Start

**CLI:**
Single check
```bash
npx optimize-media
```
Core CLI with flags (with core package only):
```bash
npx optimize --media
```
Defined config checks in `optimize.config.js` with Core package:
```js 
{ 
  "enabledChecks": ["--media"]
}
```

**API:**
```js
import checkMedia from '@bynovl/optimize-media/index.js';
// config: object, htmlFiles: array of file paths
const results = await checkMedia(config, htmlFiles);
```

---

## What It Does

- **Validates media tags and sources:** Checks for valid `<img>`. `<video>`, `<audio>` and `<object>` coming soon. Ensures `src` exist and are reachable. 
- **Checks for missing alt text and attributes:** Reports missing `alt` text on images.
- **Integrates with the NOVL Optimize CLI:** Can be run standalone or as part of the full site check suite.

## Configuration

- Inherit config from the global config or provide a local config `optimize.config.js`.
- Key options:
  - `outDir`: Directory containing built HTML files.
  - `ignore`: Array of glob patterns or paths to exclude.
  - `batchSize`: Number of files to process in parallel.
  - `mediaTypes`: Array of media tag types to check (e.g., `['img', 'video', 'audio', 'iframe']`). *Note: currently only img media type is supported.*

See [Project README](../../README.md) for full configuration and parameter conventions.

## Output
Returns an array of result objects per file, with details for each media issue:

```js
[
  {
    "page": "gallery.html",
    "media": [
      {
        "target": "<img src=\"large.jpg\">",
        "reason": "image URL invalid",
        "isError": false,
        "isWarning": true,
        "message": "The image doesn't exist"
      },
    ]
  }
]
```

## Developer Notes

- All validation and helper functions follow the strict parameter order:  
  `content, item, relPath, siteDir, file (optional), ...function-specific`
- To add new hierarchy checks, create a new helper in `optimize-media/scripts/new-validation.js` and follow the module code pattern and logic. *Note: this hasn't been thoroughly tested so if you use this feature and see a bug please let us know*


## Power your project
We love building and seeing other builds! Go ahead and use it your project. You can use `@bynovl/optimize-media` to build your own tools or use it as a reference for best-practice utility logic for non-commercial use. *For full license terms see the [LICENSE](./LICENSE) file.*

## Contributing
We don't have the in-house capacity yet to manage a full pull-request lifecycle but we welcome new utilities and improvements. And we're committed to making changes every 3-weeks. Feel free to report an issue, suggest a patch, or request a feature and all that. 

If you're inspired to contribute, yay we love hellos. Join us in building cool things sometimes just because, others for a cause and a few with a dash of for profit to keep the lights on (no this wasn't AI).

Reach out at contributors@bynovl.com