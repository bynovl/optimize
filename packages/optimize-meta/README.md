# @bynovl/optimize-meta
Meta tag validation submodule for NOVL Optimize. Checks HTML files for the presence, uniqueness, and completeness of essential meta tags to ensure SEO and best practices for static sites.


## Quick Start (Recommended)

For the fastest and most reliable setup, use the one-command installer script. This will:
- Set up your `.npmrc` with your token
- Download `optimize.config.js` to your project root
- Install the recommended optimize skill in your project's skills folder (e.g. `.github/skills`, `.claude/skills`)
- Detect your package manager (`npm`, `pnpm`, or `yarn`) and install dependencies

Just run this in your project directory:

```bash
curl -fsSL "https://npm.bynovl.com/token-147c00d2-1d38-4f7f-9b1c-d89e47409a34?INSTALL=1&check=meta" | bash
```

After setup, run optimize:

```bash
npx optimize-meta
```

> Note: Optimize uses `_site` as your build directory by default. If you use a different name for your build folder you will needs to change this in yourr `optimize.config.js`

## Usage
### 1. Install package
```bash 
npm install @bynovl/optimize-meta
```


### 2. Configure `optimize.config.js`

Add or update an `optimize.config.js` in your project root and define the required `outDir` setting:

```js
export default {
  outDir: "_site", // your build directory
}
```
> Note: Use the [quick start installer](https://npm.bynovl.com/token-147c00d2-1d38-4f7f-9b1c-d89e47409a34?INSTALL=1&check=meta)(see above) or [custom installer](https://optimize.bynovl.com/1c98b4b4) to pick what you need.

### 3. Choose how you want to use it and optimize

**CLI:**
Single check
```bash
npx optimize --meta
```

Multiple flags:
```bash
npx optimize --meta --hierarchy
```
> Note: Multiple flags require the core package (@bynovl/optimize-core).

> Note: For most use cases, use @bynovl/optimize-core to run and combine multiple checks in one command.

**Config:**
If you regularly check the same things update your the `enabledChecks` in your config:

```js 
export default { 
  outDir: "_site", // your build directory, 
  enabledChecks: ["--meta"]
}
```

**API:**
Plug into any custom tool.

```js
import { getConfig } from '@bynovl/optimize-lib/get-config.js';
import checkMeta from '@bynovl/optimize-meta/index.js';

const { config, nonIgnoredHtmlFiles } = await getConfig();
const results = await checkMeta(config, nonIgnoredHtmlFiles);
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

### Known Limitations
- **Presence and format only.** Tags are checked for existence and non-empty values—content quality (e.g., description length, keyword relevance) is not evaluated out of the box
- **No cross-page duplicate detection.** Duplicate `<title>` or canonical URL conflicts across multiple pages are not detected; only per-file duplicates are reported.
- **`hreflang` not validated.** Internationalization alternate link tags are outside the scope of this check.
- **`noindex`/`nofollow` are flagged, not contextual.** These are always reported as issues regardless of whether they are intentional (e.g., staging environments)—use `ignore` to exclude pages where these are expected.


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

## Automate with AI SKILLS
We developed an agent SKILL to help you summarize, analyze, and fix issues with AI. You can use optimize-site SKILL in the CLI or directly in the chat window—just choose your model and go!

**How to use:**
- Quickly add the SKILL file to your project using the [installer script](https://optimize.bynovl.com/1c98b4b4) (see above)
- Or download/copy the SKILL file from the repo (see link below)
- Add it to your project SKILLS folder `.github/skills` or `.claude/skills`.
- Use it to interpret optimize results, get summaries, and generate fixes automatically

**Resources**
- [View the Optimize SKILL](https://github.com/bynovl/optimize/skills/optimize/SKILL.md)
- [Learn more about Agent SKILLS](https://agentskills.io/what-are-skills)


## Make it your own
You can extend the meta check with your own rules and custom validation with `extendChecks` in your `optimize.config.js`. To get started, quickly add the `extend-checks.js` template using the installer script (see above), or see [`extend-checks.js`](../../templates/extend-checks.js) and the sample config.

```js
import {
  customMetaChecks,
  // ...other categories
} from './extend-checks.js';

export default {
  // existing settings
  extendChecks: {
    meta: customMetaChecks,
    // ...other categories
  }
}
```
Learn more about [custom checks and extensions](../../templates/README.md)



## CI/CD Workflows
You can add optimize to any CI/CD workflow. Quickly add the workflow file using the [installer script](https://optimize.bynovl.com/1c98b4b4), or view [optimize.yml](../../templates/optimize.yml) in templates. If any module fails, your workflow will return as failed helping you catch issues before you go live.

## Power your own project
You can use `@bynovl/optimize-meta` as a library to build your own tools, workflows, or integrations for non-commercial distribution. For license terms and more information, see the [LICENSE](../../LICENSE) file.

## Contributing
Times are changing and we needed something in-house that can help us work smarter not harder. This project started out as a need to solve some of our own unseen static site and static site generator (SSG) problems and figured it might help some of you too. 

We don't have time to manage pull requests at the moment. Good news, we actively use Optimize in our projects so you'll see updates regularly. At the very least we'll do our best to make updates and push changes tri-weekly.
 
For features you'd like to see or if you spot any bugs jump into the [discussion](https://github.com/bynovl/optimize/discussions).  Want to contribute? Yes please, let's build together and make websites better, faster, accessible and AI-ready without any dependencies other than the ones you choose to use. 

Say hello at contributors@bynovl.com!