# @bynovl/optimize-utils

Utility function library for NOVL Optimize. Provides low-level helpers for file handling, path resolution, batching, logging, and other common tasks used by all optimize submodules.


## What It Does

- Exposes utility functions for file and directory operations, globbing, batching, logging, and more.
- Used internally by all modules for consistent, DRY code.
- Not intended for direct CLI use. Import as a library in submodules or your own tools.

## Usage

Import utilities in your own submodule or custom tool:

```js
import { batchProcess, debugLog, dirname } from '@bynovl/optimize-utils/index.js';

const files = await batchProcess(fileList, batchSize, processFn);
debugLog('Batch processing complete!');
```

See the source for available utilities and their parameters.

## Power your project
We love building and seeing other builds! Go ahead and use `@bynovl/optimize-utils` to build your own static site QA tools, or as a reference for best-practice utility logic for non-commercial use. *For full license terms see the [LICENSE](../../LICENSE) file.*

## Contributing
We don't have time to manage pull requests at the moment but we welcome new ideas and improvements. We do actively use Optimize in our projects so you'll see fresh updates regularly. 

For features you'd like to see or if you spot any bugs, submit an issue. Want to contribute? Yes please! Join us in building cool things sometimes just because, others for a cause and a few for profit to keep the lights on (no this wasn't AI).

Say hello at contributors@bynovl.com!