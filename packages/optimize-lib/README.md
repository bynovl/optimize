# @novl/optimize-lib

Shared logic and helper library for NOVL Optimize. Provides core functions, validation routines, CLI utilities, and result formatting used by all optimize submodules and the main orchestrator.

## What It Does

- Exposes reusable validation and reporting functions for meta, accessibility, links, media, schema, and more.
- Provides CLI utilities (banner, header, footer, config loader, etc.) for consistent UX across all submodules.
- Handles result aggregation, stats, and output formatting.

> This package is NOT intended for direct CLI use. Import os as a library in submodules or your own tools or as part of optimize submodules.

## Usage
 
Import helpers in your own submodule or custom tool:

```js
import { scriptHeader, scriptFooter, returnResults } from '@novl/optimize-lib';

const { config, nonIgnoredHtmlFiles } = await scriptHeader('path/to/config.js');
// ...run your checks...
await scriptFooter(results, config);
```

See the [project README](../../README.md) for more full configuraton. 


## Extending

- Add new helpers or validation routines in this package to share logic across all checks.
- Follow the project conventions for parameter order and error/warning reporting.
- Document new helpers with JSDoc-style comments for discoverability.

## Related Packages

- [@bynovl/optimize-core](../optimize-core/) — Main CLI orchestrator
- [@bynovl/optimize-utils](../optimize-utils/) — Utility functions (file, path, batch, etc.)
- All other @novl/optimize-* submodules



## Power your project
We love building and seeing other builds! Go ahead and use it your project. You can use `@bynovl/optimize-lib` to build your own tools or use it as a reference for best-practice utility logic for non-commercial use. *For full license terms see the [LICENSE](./LICENSE) file.*

## Contributing
We don't have the in-house capacity yet to manage a full pull-request lifecycle but we welcome new utilities and improvements. And we're committed to making changes every 3-weeks. Feel free to report an issue, suggest a patch, or request a feature and all that. 

If you're inspired to contribute, yay we love hellos. Join us in building cool things sometimes just because, others for a cause and a few with a dash of for profit to keep the lights on (no this wasn't AI).

Reach out at contributors@bynovl.com