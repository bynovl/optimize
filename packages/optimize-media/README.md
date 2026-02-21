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
export default = { 
  outDir: "_site", // your build directory
}
```

> Note: you can quickly add the optimize.config.js to your project using the [install script](../../scripts/install-examples.sh)

### 3. Choose how you want to use it and optimize

**CLI:**
Single check
```bash
npx optimize --media
```

Multiple flags:
```bash
npx optimize --media --hierarchy
#  Note: work with core package only. 
```

**Config:**
If you regularly check the same things update your the `enabledChecks` in your config:

```js 
export default = { 
  outDir: "_site", // your build directory, 
  enabledChecks: ["--media"]
}
```

**API:**
Plug into any custom tool.

```js
import checkMedia from '@bynovl/optimize-media/index.js';
// config: object, htmlFiles: array of file paths
const results = await checkMedia(config, htmlFiles);
```

## What It Does

- **Validates media tags and sources:** Checks for valid `<img>`. `<video>`, `<audio>` and `<object>` coming soon. Ensures `src` exist and are reachable. 
- **Checks for missing alt text and attributes:** Reports missing `alt` text on images.
- **Integrates with the NOVL Optimize CLI:** Can be run standalone or as part of the full site check suite.

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
You can extend the media check with your own rules and custom validation with `extendChecks` in your `optimize.config.js`. To get started, see [`extend-checks.js`](../../templates/extend-checks..js) and the sample config.

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
You can add optimize to any CI/CD workflow. We've made it easy for you do so by adding an [optimize.yml.draft](./optimize.yml.draft) in the root of the repo. If any module fails, your workflow will return as failed helping you catch issues before you go live.

## Power your own project
You can use `@bynovl/optimize` as a library to build your own tools, workflows, or integrations for non-commercial distribution. For license terms and more information, see the [LICENSE](./LICENSE) file.

## Contributing
Times are changing and we needed something in-house that can help us work smarter not harder. This project started out as a need to solve some of our own unseen static site and static site generator (SSG) problems and figured it might help some of you too. 

We don't have time to manage pull requests at the moment. Good news, we actively use Optimize in our projects so you'll see updates regularly. At the very least we'll do our best to make updates and push changes tri-weekly.
 
For features you'd like to see or if you spot any bugs jump into the [discussion](https://github.com/bynovl/optimize/discussions).  Want to contribute? Yes please, let's build together and make websites better, faster, accessible and AI-ready without any dependencies other than the ones you choose to use. 

Say hello at contributors@bynovl.com! 