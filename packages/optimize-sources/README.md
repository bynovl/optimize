# @bynovl/optimize-sources
Sources validation submodule for NOVL Optimize. Checks HTML files for valid, reachable, and optimized use of external stylesheets and scripts to ensure best practices for static sites.

## Quick Start
### 1. Install package
```bash 
npm install @bynovl/optimize-sources
```

### 2. Configure `optimize.config.js`
Add/update an `optimize.config.js` to your project root. And define required `outDir` setting:

```js 
export default { 
  outDir: "_site", // your build directory
}
```

> Note: you can quickly add the optimize.config.js to your project using the [install-init](../../scripts/install-init) script

### 3. Choose how you want to use it and optimize
**CLI:**
Single check
```bash
npx optimize --sources
```

Multiple flags:
```bash
npx optimize --sources --hierarchy
```
> Note: Multiple flags require the core package (@bynovl/optimize-core).

> Note: For most use cases, use @bynovl/optimize-core to run and combine multiple checks in one command.

**Config:**
If you regularly check the same things update your the `enabledChecks` in your config:

```js 
export default { 
  outDir: "_site", // your build directory, 
  enabledChecks: ["--sources"]
}
```

**API:**
Plug into any custom tool.

```js
import { getConfig } from '@bynovl/optimize-lib/get-config.js';
import checkSources from '@bynovl/optimize-sources/index.js';

const { config, nonIgnoredHtmlFiles } = await getConfig();
const results = await checkSources(config, nonIgnoredHtmlFiles);
```

## What It Does

- **Validates `<link rel="stylesheet"> and <script src>` tags:**  
  Checks for valid and reachable CSS and JS files referenced in HTML.
- **Checks for missing, empty, or broken sources:**  
  Reports missing or empty `href`/`src` attributes and unreachable files.
- **Integrates with the NOVL Optimize CLI:**  
  Can be run standalone or as part of the full site check suite.

### Known Limitations
- **`<link rel="stylesheet">` and `<script src>` only.** `<link rel="preload">`, `<link rel="modulepreload">`, `<link rel="prefetch">` are not checked.
- **SRI integrity attributes not validated.** Subresource Integrity (`integrity`) hashes on `<link>` and `<script>` tags are not checked for correctness.
- **Dynamically injected sources not visible.** Scripts or stylesheets added by JavaScript at runtime are not present in static HTML and will not be detected.

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

## Automate with AI SKILLS
We developed a global SKILL.md to help you summarize, analyze, and fix issues with AI. You can use it in the CLI or directly in the chat window—just choose your model and go!

**How to use:**
- Download or copy the SKILL file from the repo (see link below)
- Add it to your project SKILLS folder `.github/skills` or `.claude/skills`.
- Use it to interpret optimize results, get summaries, and generate fixes automatically

**Get the global SKILL file:**
- [Global SKILL file (optimize)](https://github.com/bynovl/optimize/skills/optimize/SKILL.md)

**Learn more about SKILLS**
- [Agent SKILLS](https://agentskills.io/what-are-skills)


## Make it your own
You can extend the sources check with your own rules and custom validation with `extendChecks` in your `optimize.config.js`. To get started, see [`extend-checks.js`](../../templates/extend-checks.js) and the sample config.

```js
import {
  customSourcesChecks,
  // ...other categories
} from './extend-checks.js';

export default {
  // existing settings
  extendChecks: {
    sources: customSourcesChecks,
    // ...other categories
  }
}
```

## CI/CD Workflows
You can add optimize to any CI/CD workflow. We've made it easy for you do so by adding an [optimize.yml](../../templates/optimize.yml) in the root of the repo. If any module fails, your workflow will return as failed helping you catch issues before you go live.

## Power your own project
You can use `@bynovl/optimize-sources` as a library to build your own tools, workflows, or integrations for non-commercial distribution. For license terms and more information, see the [LICENSE](../../LICENSE) file.

## Contributing
Times are changing and we needed something in-house that can help us work smarter not harder. This project started out as a need to solve some of our own unseen static site and static site generator (SSG) problems and figured it might help some of you too. 

We don't have time to manage pull requests at the moment. Good news, we actively use Optimize in our projects so you'll see updates regularly. At the very least we'll do our best to make updates and push changes tri-weekly.
 
For features you'd like to see or if you spot any bugs jump into the [discussion](https://github.com/bynovl/optimize/discussions).  Want to contribute? Yes please, let's build together and make websites better, faster, accessible and AI-ready without any dependencies other than the ones you choose to use. 

Say hello at contributors@bynovl.com! 