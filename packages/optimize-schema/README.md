# @novl/optimize-schema
Schema (structured data) validation submodule for NOVL Optimize.  
Checks HTML files for valid, complete, and best-practice JSON-LD schema blocks to ensure rich search results and SEO for static sites.

## Quick Start
### 1. Install package
```bash 
npm install @bynovl/optimize-schema
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
npx optimize --schema
```

Multiple flags:
```bash
npx optimize --schema --hierarchy
#  Note: work with core package only. 
```

**Config:**
If you regularly check the same things update your the `enabledChecks` in your config:

```js 
export default = { 
  outDir: "_site", // your build directory, 
  enabledChecks: ["--schema"]
}
```

**API:**
Plug into any custom tool.

```js
import checkSchema from '@bynovl/optimize-schema/index.js';
// config: object, htmlFiles: array of file paths
const results = await checkSchema(config, htmlFiles);
```

## What It Does

- **Validates required schema keys:**  
  Ensures each JSON-LD block includes required keys (e.g., `@context`, `@type`, `name`) and follows your config rules.
- **Checks for missing, empty, or invalid values:**  
  Reports missing or empty required keys, and flags invalid or non-standard values.
- **Flags nested and custom schema issues:**  
  Supports custom and nested key validation via config arrays.
- **Integrates with the NOVL Optimize CLI:**  
  Can be run standalone or as part of the full site check suite.

## Configuration

- Inherit config from the main `default.config.js` or provide a local config `optimize.config.js`.
- Key options:
  - `outDir`: Directory containing built HTML files.
  - `ignore`: Array of glob patterns or paths to exclude.
  - `batchSize`: Number of files to process in parallel.
  - `schemaDataDefault`: Array of keys required in every schema block.
  - `schemaDataCustom`: Array of custom/nested keys to validate (dot notation, `:required` for strict presence).
  - `schemaDataExceptions`: Array of keys to ignore

See the [project README](../../README.md) for full configuraton. 

## Output
Returns an array of result objects per file, with details for each schema issue:
```js
[
  {
    "page": "product.html",
    "schema": [
      {
        "target": "@type",
        "reason": "missing required key",
        "isError": true,
        "isWarning": false,
        "message": "Schema block missing @type key"
      },
      // ...
    ]
  }
]
```

## Make it your own
You can add or customize schema validation logic by editing your `optimize.config.js`:
-`schemaDataDefault`: to require keys on every schema block (e.g., `@context`, `@type`, `name`).
- `schemaDataCustom`: for context-specific or nested keys. Use dot notation for nested keys and `:required` for strict presence.


```js
  export default {
    schemaDataDefault: ['@context', '@type', 'name'],
    schemaDataCustom: [
      'image', // optional: warning if missing/empty
      'offers.price:required',
      'offers.priceCurrency:required',
    ]
  };
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


## CI/CD Workflows
You can add optimize to any CI/CD workflow. We've made it easy for you do so by adding an [optimize.yml.draft](./optimize.yml.draft) in the root of the repo. If any module fails, your workflow will return as failed helping you catch issues before you go live.

## Power your own project
You can use `@novl/optimize` as a library to build your own tools, workflows, or integrations for non-commercial distribution. For license terms and more information, see the [LICENSE](./LICENSE) file.

## Contributing
Times are changing and we needed something in-house that can help us work smarter not harder. This project started out as a need to solve some of our own unseen static site and static site generator (SSG) problems and figured it might help some of you too. 

We don't have time to manage pull requests at the moment. Good news, we actively use Optimize in our projects so you'll see updates regularly. At the very least we'll do our best to make updates and push changes tri-weekly.
 
For features you'd like to see or if you spot any bugs jump into the [discussion](https://github.com/bynovl/optimize/discussions).  Want to contribute? Yes please, let's build together and make websites better, faster, accessible and AI-ready without any dependencies other than the ones you choose to use. 

Say hello at contributors@bynovl.com! 