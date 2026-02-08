# @novl/optimize-sources

Sources validation submodule for NOVL Optimize. Checks HTML files for valid, reachable, and optimized use of external stylesheets and scripts to ensure best practices for static sites.

---

## Quick Start

**CLI:**
Single check
```bash
npx optimize-sources
```
Core CLI with flags (with core package only):
```bash
npx optimize --sources
```
Defined config checks in `optimize.config.js` with Core package:
```js 
{ 
  "enabledChecks": ["--sources"]
}
```

**API:**
```js
import checkSources from '@bynovl/optimize-sources/index.js';
// config: object, htmlFiles: array of file paths
const results = await checkSources(config, htmlFiles);
```

---

## What It Does

- **Validates `<link rel="stylesheet"> and <script src>` tags:**  
  Checks for valid and reachable CSS and JS files referenced in HTML.
- **Checks for missing, empty, or broken sources:**  
  Reports missing or empty `href`/`src` attributes and unreachable files.
- **Integrates with the NOVL Optimize CLI:**  
  Can be run standalone or as part of the full site check suite.

## Configuration

- Inherit global configuration or provide a local config `optimize.config.js`.
- Key options:
  - `outDir`: Directory containing built HTML files.
  - `ignore`: Array of glob patterns or paths to exclude.
  - `batchSize`: Number of files to process in parallel.

See the [project README](../../README.md) for more full configuraton. 

## Output

Returns an array of result objects per file, with details for each source issue:
```js
[
  {
    "page": "index.html",
    "sources": [
      {
        "target": "<link rel=\"stylesheet\" href=\"broken.css\">",
        "reason": "unreachable stylesheet",
        "isError": true,
        "isWarning": false,
        "message": "Stylesheet broken.css not found in output directory"
      },
      {
        "target": "<script src=\"missing.js\">",
        "reason": "unreachable script file",
        "isError": true,
        "isWarning": false,
        "message": "Script file missing.js not found in output directory"
      },
      // ...
    ]
  }
]
```
## Developer Notes

- All validation and helper functions follow the strict parameter order:  
  `content, item, relPath, siteDir, file (optional), ...function-specific`
- To add new source checks, create a new helper in `optimize-sources/scripts/new-validation.js` and follow the module code patten and logic. *Note: this hasn't been thoroughly tested so if you use this feature and see a bug please let us know*

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
We love building and seeing other builds! Go ahead and use `@bynovl/optimize-sources` to build your own static site QA tools, or as a reference for best-practice utility logic for non-commercial use. *For full license terms see the [LICENSE](./LICENSE) file.*

## Contributing
We don't have time to manage pull requests at the moment but we welcome new ideas and improvements. We do actively use Optimize in our projects so you'll see fresh updates regularly. 

For features you'd like to see or if you spot any bugs, submit an issue. Want to contribute? Yes please! Join us in building cool things sometimes just because, others for a cause and a few for profit to keep the lights on (no this wasn't AI).

Say hello at contributors@bynovl.com and introduce yourself in the "Introductions" discussion! 