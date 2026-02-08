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

## Automate with AI SKILLS

We developed a global SKILL.md to help you summarize, analyze, and fix issues with AI. You can use it in the CLI or directly in Visual Studio Code chat window. Just choose your model and go! 

**How to use:**
- Download or copy the SKILL file from the repo (see link below)
- Add it to your project SKILLS folder `.github/skills` or `.claude/skills`.
- Use it to interpret optimize results, get summaries, and generate fixes automatically

**Get the global SKILL file:**
- [Global SKILL file (optimize)](https://github.com/bynovl/optimize/skills/optimize/SKILL.md)

**Learn more about SKILLS**
- [Agent SKILLS](https://agentskills.io/what-are-skills)


## Power your project
We love building and seeing other builds! Go ahead and use `@bynovl/optimize-utils` to build your own static site QA tools, or as a reference for best-practice utility logic for non-commercial use. *For full license terms see the [LICENSE](./LICENSE) file.*

## Contributing
We don't have time to manage pull requests at the moment but we welcome new ideas and improvements. We do actively use Optimize in our projects so you'll see fresh updates regularly. 

For features you'd like to see or if you spot any bugs, submit an issue. Want to contribute? Yes please! Join us in building cool things sometimes just because, others for a cause and a few for profit to keep the lights on (no this wasn't AI).

Say hello at contributors@bynovl.com and introduce yourself in the "Introductions" discussion! 