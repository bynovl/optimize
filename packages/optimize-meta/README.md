# @novl/optimize-meta

Meta tag validation submodule for NOVL Optimize. Checks HTML files for the presence, uniqueness, and completeness of essential meta tags to ensure SEO and best practices for static sites.

## Quick Start

**CLI:**
Single check
```bash
npx optimize-meta
```
Core CLI with flags (with core package only):
```bash
npx optimize --meta
```
Defined config checks in `optimize.config.js` with Core package:
```js 
{ 
  "enabledChecks": ["--meta"]
}
```

**API:**
```js
import checkMeta from '@novl/optimize-meta/index.js';
// config: object, htmlFiles: array of file paths
const results = await checkMeta(config, htmlFiles);
```

## What It Does

- **Validates required meta tags:**  
  Ensures each HTML file includes `<title>`, `<meta name="description">`, `<meta name="keywords">`, `<link rel="canonical">`, and `<meta name="robots">` as appropriate.
- **Checks for missing, duplicate, or empty tags:**  
  Reports missing tags, duplicate tags, and tags with empty values.
- **Flags SEO blockers:**  
  Detects `noindex`/`nofollow` in robots meta tags.
- **Integrates with the NOVL Optimize CLI:**  
  Can be run standalone or as part of the full site check suite.

## Configuration

- Inherit config from the main `default.config.js` or provide a local config `optimize.config.js`.
- Key options:
  - `outDir`: Directory containing built HTML files.
  - `ignore`: Array of glob patterns or paths to exclude.
  - `batchSize`: Number of files to process in parallel.

See the [project README](../../README.md) for full configuraton. 

## Output

Returns an array of result objects per file, with details for each meta tag issue:
```js
[
  {
    "page": "index.html",
    "meta": [
      {
        "target": "<meta name=\"description\">",
        "reason": "missing description",
        "isError": true,
        "isWarning": false,
        "message": "Add a meta description for SEO"
      },
      // ...
    ]
  }
]
```

## Developer Notes

- All validation and helper functions follow the strict parameter order:  
  `content, item, relPath, siteDir, file (optional), ...function-specific`
- To add new hierarchy checks, create a new helper in `optimize-meta/scripts/new-validation.js` and follow the module code pattern and logic. *Note: this hasn't been thoroughly tested so if you use this feature and see a bug please let us know*

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
We love building and seeing other builds! Go ahead and use `@bynovl/optimize-meta` to build your own static site QA tools, or as a reference for best-practice utility logic for non-commercial use. *For full license terms see the [LICENSE](./LICENSE) file.*

## Contributing
We don't have time to manage pull requests at the moment but we welcome new ideas and improvements. We do actively use Optimize in our projects so you'll see fresh updates regularly. 

For features you'd like to see or if you spot any bugs, submit an issue. Want to contribute? Yes please! Join us in building cool things sometimes just because, others for a cause and a few for profit to keep the lights on (no this wasn't AI).

Say hello at contributors@bynovl.com and introduce yourself in the "Introductions" discussion! 