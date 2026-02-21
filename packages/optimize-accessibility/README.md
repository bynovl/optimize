# @novl/optimize-accessibility

Accessibility validation submodule for NOVL Optimize. Checks HTML files for accessibility best practices, ARIA usage, and common issues to ensure static sites are usable by everyone.

## Quick Start
### 1. Install package
```bash 
npm install @bynovl/optimize-accessibility
```

### 2. Configure `optimize.config.js`
Add/update an `optimize.config.js` in your project root. And define required `outDir` setting:

```js 
export default = { 
  outDir: "_site", // your build directory
}
```

> Note: you can quickly add the `optimize.config.js` to your project using the [install script](../../scripts/install-examples.sh)

### 3. Choose how you want to use it and optimize
**CLI:**
Single check
```bash
npx optimize --accessibility
```

Multiple flags:
```bash
npx optimize --accessibility --hierarchy
#  Note: work with core package only. 
```

**Config:**
If you regularly check the same things update your the `enabledChecks` in your config:

```js 
export default = { 
  outDir: "_site", // your build directory, 
  enabledChecks: ["--accessibility"]
}
```

**API:**
Plug into any custom tool.

```js
import { checkFns }  from '@bynovl/optimize-accessibility/index.js';
// config: object, htmlFiles: array of file paths
const results = await checkFn.checkAccessibility(config, htmlFiles);
```

## What It Does

- **Validates accessibility attributes and structure:**  
  Ensures presence and correctness of ARIA attributes, alt text, and form labels.
- **Checks for missing, duplicate, or empty attributes:**  
  Reports missing `alt` text, unlabeled form fields, and other aria attributess
- **Integrates with the NOVL Optimize CLI:**  
  Can be run standalone or as part of the full site check suite.

## Configuration

- Inherit config from the main `default.config.js` or provide a local config `optimize.config.js`.
- Key options:
  - `outDir`: Directory containing built HTML files.
  - `ignore`: Array of glob patterns or paths to exclude.
  - `batchSize`: Number of files to process in parallel.

See the [project README](../../README.md) for full configuration and parameter conventions.

## Output

Returns an array of result objects per file, with details for each accessibility issue:
```js
[
  {
    "page": "index.html",
    "accessibility": [
      { "target": "<img>", "reason": "missing alt attribute", ... },
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
You can extend the accessibility check with your own rules and custom validation with `extendChecks` in your `optimize.config.js`. To get started, see [`extend-checks.js`](../../templates/extend-checks..js) and the sample config.

```js
import {
  customAccessibiltyChecks,
  // ...other categories
} from './extend-checks.js';

export default {
  // existing settings
  extendChecks: {
    accessibility: customAccessibilityChecks,
    // ...other categories
  }
}
```

## CI/CD Workflows
You can add optimize to any CI/CD workflow. We've made it easy for you do so by adding an [optimize.yml.draft](./optimize.yml.draft) in the root of the repo. If any module fails, your workflow will return as failed helping you catch issues before you go live.

## Power your own project
You can use `@novl/optimize` as a library to build your own tools, workflows, or integrations for non-commercial distribution. For license terms and more information, see the [LICENSE](./LICENSE) file.

## Contributing
Times are changing and we needed something in-house that can help us work smarter not harder. This project started out as a need to solve some of our own unseen static site and static site generator (SSG) problems and figured it might help some of you too. 

We don't have time to manage pull requests at the moment. Good news, we actively use Optimize in our projects so you'll see updates regularly. At the very least we'll do our best to make updates and push changes tri-weekly.
 
For features you'd like to see or if you spot any bugs jump into the [discussion](https://github.com/bynovl/optimize/discussions).  Want to contribute? Yes please, let's build together and make websites better, faster, accessible and AI-ready without any dependencies other than the ones you choose to use. 

Say hello at contributors@bynovl.com! 