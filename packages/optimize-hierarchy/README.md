# @novl/optimize-hierarchy

Hierarchy validation submodule for NOVL Optimize. Checks HTML files for correct heading order, logical document structure, and semantic hierarchy to ensure accessibility and best practices for static sites.

## Quick Start

**CLI:**
Single check
```bash
npx optimize-hierarchy
```
Core CLI with flags (with core package only):
```bash
npx optimize --hierarchy
```
Defined config checks in `optimize.config.js` with Core package:
```js 
{ 
  "enabledChecks": ["--hierarchy"]
}
```

**API:**
```js
import checkHierarchy from '@bynovl/optimize-hierarchy/index.js';
// config: object, htmlFiles: array of file paths
const results = await checkHierarchy(config, htmlFiles);
```

## What It Does

- **Validates heading order and nesting:**  
  Ensures headings (`<h1>`–`<h6>`) are used in a logical, sequential order without skipping levels.
- **Checks for missing or duplicate headings:**  
  Reports missing `<h1>`, duplicate headings, and improper heading structure.
- **Flags semantic structure issues:**  
  Detects improper use of sectioning elements, orphaned headings, and non-semantic containers.
- **Integrates with the NOVL Optimize CLI:**  
  Can be run standalone or as part of the full site check suite.

## Configuration

- Inherit config from the global config or provide a local config `optimize.config.js`.
- Key options:
  - `outDir`: Directory containing built HTML files.
  - `ignore`: Array of glob patterns or paths to exclude.
  - `batchSize`: Number of files to process in parallel.

See the [project README](../../README.md) for more full configuraton. 

## Output

Returns an array of result objects per file, with details for each hierarchy issue:
```js
[
  {
    "page": "docs.html",
    "hierarchy": [
      {
        "target": "<h2>",
        "text": "Getting Started",
        "reason": "skipped heading level",
        "isError": true,
        "isWarning": false,
        "message": "Do not skip heading levels (found <h2> after <h4>)"
      },
      // ...
    ]
  }
]
```


## Developer Notes

- All validation and helper functions follow the strict parameter order:  
  `content, item, relPath, siteDir, file (optional), ...function-specific`
- To add new hierarchy checks, create a new helper in `optimize-hierarchy/scripts/new-validation.js` and follow the module code pattern and logic. *Note: this hasn't been thoroughly tested so if you use this feature and see a bug please let us know*

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
We love building and seeing other builds! Go ahead and use `@bynovl/optimize-hierarchy` to build your own static site QA tools, or as a reference for best-practice utility logic for non-commercial use. *For full license terms see the [LICENSE](./LICENSE) file.*

## Contributing
We don't have time to manage pull requests at the moment but we welcome new ideas and improvements. We do actively use Optimize in our projects so you'll see fresh updates regularly. 

For features you'd like to see or if you spot any bugs, submit an issue. Want to contribute? Yes please! Join us in building cool things sometimes just because, others for a cause and a few for profit to keep the lights on (no this wasn't AI).

Say hello at contributors@bynovl.com and introduce yourself in the "Introductions" discussion! 