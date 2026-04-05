# @bynovl/optimize-media
Media validation submodule for NOVL Optimize. Checks HTML files for valid, accessible, and optimized use of images, video, and other media assets to ensure best practices for static sites.

## Quick Start
### 1. Install package
```bash 
npm install @bynovl/optimize-media
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
npx optimize --media
```

Multiple flags:
```bash
npx optimize --media --hierarchy
# Note: Multiple flags require the core package (@bynovl/optimize-core).
```

> Note: For most use cases, you'll want to use [@bynovl/optimize-core](../optimize-core/README.md) to run multiple checks together or as a single CLI entry point.

**Config:**
If you regularly check the same things update your the `enabledChecks` in your config:

```js 
export default {
  outDir: "_site", // your build directory, 
  enabledChecks: ["--media"]
}
```

**API:**
Plug into any custom tool.

```js
import { getConfig } from '@bynovl/optimize-lib/get-config.js';
import checkMedia from '@bynovl/optimize-media/index.js';

const { config, nonIgnoredHtmlFiles } = await getConfig();
const results = await checkMedia(config, nonIgnoredHtmlFiles);
console.log(results);
```

## What It Does

- **Validates media tags and sources:** Checks for valid `<img>` tags. `<video>`, `<audio>` and `<object>` coming soon. Ensures `src` exist and are reachable. 
- **Checks for missing alt text and attributes:** Reports missing `alt` text on images.
- **Integrates with the NOVL Optimize CLI:** Can be run standalone or as part of the full site check suite.

### Known Limitations

- **`<img>` only.** Only `<img>` elements are currently validated. `<video>`, `<audio>`, `<iframe>`, and `<object>` are listed in `mediaTypes` config but are not yet checked—support is planned.
- **No image optimization checks.** File size, dimensions, format (WebP, AVIF), and compression are not evaluated.
- **CSS background images may be partially missed.** Inline styles and style blocks are parsed, but complex or minified CSS patterns in external files may not be fully detected. Data URIS are skipped.

## Configuration

- Inherit config from the global config or provide a local config `optimize.config.js`.
- Key options:
  - `outDir`: Directory containing built HTML files.
  - `ignore`: Array of glob patterns or paths to exclude.
  - `batchSize`: Number of files to process in parallel.
  - `mediaTypes`: Array of media tag types to check (e.g., `['img', 'video', 'audio', 'iframe']`). *Note: currently only img media type is supported.*
  - `inlineStyles`: Check media within inline styles (default true)
  - `styleBlocks`: Check media within style blocks (default true)
  - `cssFiles`: Check CSS files (default true)
  - `htmlFiles`: Check HTML file (default true). Note: when set to false inline styles and style blocks will not be checked

See [Project README](../../README.md) for full configuration and parameter conventions.

## Output
Returns an array of result objects per file, with details for each media issue:

```js
[
  {
    "page": "gallery.html",
    "media": [
      {
        "target": "<img src=\"large.jpg\">",
        "reason": "image URL invalid",
        "isError": false,
        "isWarning": true,
        "message": "The image doesn't exist"
      },
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
You can extend the media check with your own rules and custom validation with `extendChecks` in your `optimize.config.js`. To get started, see [`extend-checks.js`](../../templates/extend-checks.js) and the sample config.

```js
import {
  customMediaChecks,
  // ...other categories
} from './extend-checks.js';

export default {
  // existing settings
  extendChecks: {
    media: customMediaChecks,
    // ...other categories
  }
}
```

## CI/CD Workflows
You can add optimize to any CI/CD workflow. We've made it easy for you do so by adding an [optimize.yml](../../templates/optimize.yml) in the root of the repo. If any module fails, your workflow will return as failed helping you catch issues before you go live.

> For advanced usage, configuration, and API docs, see the main [Optimize README](../../README.md).

## Power your own project
You can use `@bynovl/optimize-media` as a library to build your own tools, workflows, or integrations for non-commercial distribution. For license terms and more information, see the [LICENSE](../../LICENSE) file.

## Contributing
Times are changing and we needed something in-house that can help us work smarter not harder. This project started out as a need to solve some of our own unseen static site and static site generator (SSG) problems and figured it might help some of you too. 

We don't have time to manage pull requests at the moment. Good news, we actively use Optimize in our projects so you'll see updates regularly. At the very least we'll do our best to make updates and push changes tri-weekly.
 
For features you'd like to see or if you spot any bugs jump into the [discussion](https://github.com/bynovl/optimize/discussions).  Want to contribute? Yes please, let's build together and make websites better, faster, accessible and AI-ready without any dependencies other than the ones you choose to use. 

Say hello at contributors@bynovl.com! 