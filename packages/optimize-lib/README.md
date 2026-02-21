# @novl/optimize-lib

Shared logic and helper library for NOVL Optimize. Provides core functions, validation routines, CLI utilities, and result formatting used by all optimize submodules.

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

## Power your project
We love building and seeing other builds! Go ahead and use `@bynovl/optimize-lib` to build your own static site QA tools, or as a reference for best-practice utility logic for non-commercial use. *For full license terms see the [LICENSE](./LICENSE) file.*

## Contributing
We don't have time to manage pull requests at the moment but we welcome new ideas and improvements. We do actively use Optimize in our projects so you'll see fresh updates regularly. 

For features you'd like to see or if you spot any bugs, submit an issue. Want to contribute? Yes please! Join us in building cool things sometimes just because, others for a cause and a few for profit to keep the lights on (no this wasn't AI).

Say hello at contributors@bynovl.com!