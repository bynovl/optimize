# @novl/optimize-open-graph

Open Graph validation submodule for NOVL Optimize. Checks HTML files for the presence, correctness, and completeness of Open Graph tags to ensure rich previews and best practices for static sites.

---


## Quick Start
### 1. Install package
```bash 
npm install @bynovl/optimize-open-graph
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
npx optimize --open-graph
```

Multiple flags:
```bash
npx optimize --open-graph --hierarchy
#  Note: work with core package only. 
```

**Config:**
If you regularly check the same things update your the `enabledChecks` in your config:

```js 
export default = { 
  outDir: "_site", // your build directory, 
  enabledChecks: ["--open-graph"]
}
```

**API:**
Plug into any custom tool.

```js
import checkOpenGraph from '@bynovl/optimize-open-graph/index.js';
// config: object, htmlFiles: array of file paths
const results = await checkOpenGraph(config, htmlFiles);
```

---

## What It Does

- **Validates required Open Graph tags:**  
  Ensures each HTML file includes `<meta property="og:title">`, `<meta property="og:description">`, `<meta property="og:image">`, `<meta property="og:url">`, and other recommended tags.
- **Also validates Twitter tags:** Ensures each file include  `<meta name="twitter:card"> <meta name="twitter:title"> <meta name="twitter:description"> <meta name="twitter:image">`
- **Checks for missing, duplicate, or empty tags:**  
  Reports missing tags, duplicate tags, and tags with empty values.
- **Flags preview and sharing issues:**  
  Detects non-canonical URLs and nofollow robots text. 
- **Integrates with the NOVL Optimize CLI:**  
  Can be run standalone or as part of the full site check suite.

## Configuration

- Inherit config from the main `default.config.js` or provide a local config `optimize.config.js`.
- Key options:
  - `outDir`: Directory containing built HTML files.
  - `ignore`: Array of glob patterns or paths to exclude.
  - `batchSize`: Number of files to process in parallel.

See the [project README](../../README.md) for more full configuraton. 

## Output

Returns an array of result objects per file, with details for each Open Graph issue:
```js
[
  {
    "page": "index.html",
    "openGraph": [
      {
        "target": "<meta property=\"og:image\">",
        "reason": "missing og:image",
        "isError": true,
        "isWarning": false,
        "message": "Add an og:image for rich previews"
      },
      // ...
    ]
  }
]
```

## Developer Notes

- All validation and helper functions follow the strict parameter order:  
  `content, item, relPath, siteDir, file (optional), ...function-specific`
- To add new open graph checks, create a new helper in `optimize-open-graph/scripts/new-validation.js` and follow the module code patten and logic. *Note: this hasn't been thoroughly tested so if you use this feature and see a bug please let us know*

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
We love building and seeing other builds! Go ahead and use `@bynovl/optimize-open-graph` to build your own static site QA tools, or as a reference for best-practice utility logic for non-commercial use. *For full license terms see the [LICENSE](./LICENSE) file.*

## Contributing
We don't have time to manage pull requests at the moment but we welcome new ideas and improvements. We do actively use Optimize in our projects so you'll see fresh updates regularly. 

For features you'd like to see or if you spot any bugs, submit an issue. Want to contribute? Yes please! Join us in building cool things sometimes just because, others for a cause and a few for profit to keep the lights on (no this wasn't AI).

Say hello at contributors@bynovl.com and introduce yourself in the "Introductions" discussion! 