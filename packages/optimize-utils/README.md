# @novl/optimize-utils

Utility function library for NOVL Optimize. Provides low-level helpers for file handling, path resolution, batching, logging, and other common tasks used by all optimize submodules and the main orchestrator.

---

## What It Does

- Exposes utility functions for file and directory operations, globbing, batching, logging, and more.
- Used internally by all checks and the main CLI for consistent, DRY code.
- Not intended for direct CLI use—import as a library in submodules or your own tools.

## Usage

Import utilities in your own submodule or custom tool:

```js
import { batchProcess, debugLog, dirname } from '@novl/optimize-utils/index.js';

const files = await batchProcess(fileList, batchSize, processFn);
debugLog('Batch processing complete!');
```

See the source for available utilities and their parameters.

## Extending

- Add new utility functions in this package to share logic across all checks.
- Keep utilities focused, generic, and well-documented.
- Use JSDoc-style comments for discoverability.

## Related Packages

- [@bynovl/optimize-lib](../optimize-lib/) — Shared logic and validation helpers
- [@bynovl/optimize-core](../optimize-core/) — Main CLI orchestrator
- All other @novl/optimize-* submodules

---


## Power your project
We love building and seeing other builds! Go ahead and use it your project. You can use `@bynovl/optimize-utils` to build your own tools or use it as a reference for best-practice utility logic for non-commercial use. *For full license terms see the [LICENSE](./LICENSE) file.*

## Contributing
We don't have the in-house capacity yet to manage a full pull-request lifecycle but we welcome new utilities and improvements. And we're committed to making changes every 3-weeks. Feel free to report an issue, suggest a patch, or request a feature and all that. 

If you're inspired to contribute, yay we love hellos. Join us in building cool things sometimes just because, others for a cause and a few with a dash of for profit to keep the lights on (no this wasn't AI).

Reach out at contributors@bynovl.com