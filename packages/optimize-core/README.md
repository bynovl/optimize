# @novl/optimize-core

Main CLI orchestrator for NOVL Optimize. Coordinates and runs all individual site checkers (accessibility, links, meta, media, schema, etc.) as part of a unified workflo
## Quick Start

**CLI:**
By default without flags, runs all checks. Use flags to run specific checks only.
```bash 
npx optimize
```

Run specific checks with flags
```bash
npx optimize --accessibilty --links --meta
# Full list
# [--accessibility] [--links] [--meta] [--media] [--schema] [--hierarchy] [--open-graph] [--sources]
```

Or define the checks you want to run in the `optimize.config.js`:

```js 
{  
  "enabledChecks": ["--meta", "--hierarchy"]
}
```

**API:**
```js
import { runAllChecks } from '@novl/optimize-core/api.js';
const results = await runAllChecks(config);
```

## What It Does

- Provides the main CLI entry point (`npx optimize`) for running all checks across a static site.
- Dynamically loads and executes enabled submodule checkers based on CLI flags or config.
- Handles configuration loading, merging user and default settings, and passing them to each checker.
- Export results as JSON and CSV reporting
- Exposes a programmatic API for advanced custom tooing.

## Configuration

- Uses `optimize.config.js` at the project root for user overrides.
- Merges user config with submodule defaults.
- Supports custom batch size, output directory, ignore patterns, and submodule-specific options.

See the [project README](../../README.md) for more full configuraton. 

## Developer Notes

- Each checker is a separate submodule (e.g., `optimize-accessibility`, `optimize-links`, etc.) are installed as dependencies
- Shared CLI utilities (banner, header, footer, init) are imported from `optimize-lib`.
- All validation and helper functions follow the strict parameter order:  
  `content, item, relPath, siteDir, file (optional), ...function-specific`
- To add a new check, add the submodule and wire it up in the `@bynovl/optimize-core/index.js`. *Note: this hasn't been thoroughly tested so if you use this feature and see a bug please let us know*

## Power your project
We love building and seeing other builds! Go ahead and use it your project. You can use `@bynovl/optimize-core` to build your own tools or use it as a reference for best-practice utility logic for non-commercial use. *For full license terms see the [LICENSE](./LICENSE) file.*

## Contributing
We don't have the in-house capacity yet to manage a full pull-request lifecycle but we welcome new utilities and improvements. And we're committed to making changes every 3-weeks. Feel free to report an issue, suggest a patch, or request a feature and all that. 

If you're inspired to contribute, yay we love hellos. Join us in building cool things sometimes just because, others for a cause and a few with a dash of for profit to keep the lights on (no this wasn't AI).

Reach out at contributors@bynovl.com