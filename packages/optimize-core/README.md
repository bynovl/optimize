# @novl/optimize

Automate accessibility, Schema, Meta, and other best practice checks for any static website. It's configurable, extensible, and compatible with all static site generators. Use it as a post-build package in your CI/CD workflow or test during development locally while you're building. Use linters to help you while you code and optimize to verify what you built is ready to go live. 

## How It Works (Architecture Overview)

- Each check (meta, accessibility, links, media, etc.) is its own module. 
- Run them all together via the main CLI (`@bynovl/optimize-core` package), use what you need and run a single check(e.g. `@bynovl/optimize-meta`), or target multiple checks using `@bynovl/optimize-core` with flags (e.g. `--meta, --open-graph, --links'`)
- Shared utilities and config logic are located in `@bynovl/optimize-utils` and `@bynovl/optimize-lib` packages which are installed as dependencies with you install a single package or the core.

**Configuration is simple:**
- Each check defines has its own defaults.
- You can override the global and module defaults by adding a `optimize.config.js` in the root of your project
- The config loader merges: global config > module config > user config

## Getting Started

### Install

Install from npm:
```bash
npm install @bynovl/optimize-core
```

### Usage

#### Local
Optimize was designed to run locally in your build environment. Just run optmize as follows and see results:

```bash
npx optimize
```

#### Programatically
You can plug optimize into any project by using the API. You will need to rebuild the checks for your project. The following outlines the minmum required to get started. *You can also use any `optimize-lib` or `optimize-utils` to aide you in your development.*

Import and run a single check.
```js
// Intended for local checks onlys
import { checkMeta } from '@novl/optimize/optimize-core/api.js';
await checkMeta(config, htmlFiles); 
```

Import and run all checks
```js
// Full featured API can be used internally or externally with startUrl support
import { runAllChecks } from '@novl/optimize/optimize-core/api.js';
await runAllChecks(config, htmlFiles, startUrl);
```

So that the right settings are loaded you will also need to import the `getConfig`. Then you're ready to use in your project. 
```js
// In your main script you will also need 
import getConfig from "@novl/optimize-lib/set-config.js" // config
const htmlFiles = ['_site/index.html', '_site/about.html']; // paths to html files
const results = await runAllChecks(config, htmlFiles);
```

> Note: if you want to run multiple checks it's best to use the the runAllChecks and update `enabledChecks` unless you have a specfic use case for individual checks. 

### Common Flags
- `--meta`: Check for required and recommended meta tags only.
- `--open-graph`: Validate Open Graph tags for social sharing only.
- `--schema`: Validate structured data (JSON-LD schema blocks) only.
- `--accessibility`: Run accessibility checks (a11y best practices) only.
- `--hierarchy`: Check HTML heading and content hierarchy only.
- `--media`: Validate images and media assets only.
- `--sources`: Check for valid source asset references only.
- `--links`: Validate internal and external links only.


**Example:**
```bash
npx optimize --meta --accessibility
```
If no flags are provided, all checks will run.

**Note:** When running the CLI via an npm script, you must use `-- --[check]` (e.g., `npm run optimize -- --sources`). The first `--` tells npm to forward arguments to your script. Otherwise, all checks will run by default.

### Configuration

By adding a `optimize.config.js` to your project root, you have granular control of how checks are run. Make sure your package.json has a "type" set to "module" and export your settings as follows:

```js
{
  "outDir": "./_site", // Directory containing your built static site
  // Add other settings as needed
};
```

#### Schema Validation

You can control how schema validation works using two config arrays in your `optimize.config.js`:

- `schemaDataDefault`: Keys listed here are **required on every schema JSON block** found in your HTML. Only add keys that should always be present (e.g., `@context`, `@type`, `name`). For example, if you add `image` to `schemaDataDefault`, every schema block must have an `image` property, or an error will be reported for each block missing it.

- `schemaDataCustom`: Use this to define keys that are only required in specific contexts or nested objects. You can use dot notation for nested keys and add `:required` to enforce strict presence. If a parent object exists, all `:required` child keys must exist and have a value, or an error is reported. If a key is included without `:required`, it is treated as optional—missing or empty values will result in a warning, not an error.

**Example:**
```javascript
{
  // ... other settings
  "schemaDataDefault": ["@context", "@type", "name"],
  "schemaDataCustom": [
    "image", // optional: warning if missing/empty
    "step.name:required", // required: error if missing/empty when step exists
    "step.description:required",
    "step.performTime:required",
    "step.cost:required",
    "step.cost.@type:required",
    "step.cost.currency:required",
  ]
};
```

> *Tip: This approach lets you enforce structured data requirements without writing custom scripts—just update your config!*

#### Batch Size for Large Sites

For large sites, set `batchSize` in your config to control how many files are processed at once to improve performance and memory usage. By default it is set to 50:

```javascript
{
  // ... other settings
  "batchSize": 100, // at your own risk 
};
```

#### Ignore files and directories 
You may not want to validate an entire site. To speed up processing time hide the files and folders you don't want to be validated. 

```javascript
{
  // ... other settings
  "ignore": ["sample.html", "private/", "todos/"]
}
```

#### Choose Media Types 
Right now it's built to check only `<img>`. When the feature is supported you'll be able to enable/disable by adding/removing types from the `mediaTypes` array. 

```javascript
{ 
  // ... other settings
  "mediaTypes": ["img", "video", "iframe", "object"]
}
```

#### Get Data in different formats
Include `exportResultsJson` and/or `exportResultsCsv` with the the path and file name to choose the location of where to export results in your `optimize.config.js`

```javascript
{
  // ... other settings
  "exportResultsJson": "/path/cool-report.json", 
  "exportResultsCsv": "even-cooler.csv"
}
```

#### Define the checks you want to run
Once you've tested the checks you want to run using flags (see Common Flags for options), add them to the confg as enabled checks. 
```javascript
{ 
  // ... other settings
  "enabledChecks": "[--meta, --media, hierarchy]"
}
```

#### API Mode 
If you're using optimize in an external project you'll want to disable CLI display logs. To do so enter API mode. You will also want to understand how to use Optimize programatically. See "Usage - Programmatic".

```javascript
{ 
  // ... other settings
  "apiMode": true // or false
}
```

## CI/CD Workflows

You can add optimize to any CI/CD workflow. We've made it easy for you do so by adding an [optimize.yml.draft](./optimize.yml.draft) in the root of the repo. If any module fails, your workflow will return as failed helping you catch issues before you go live.

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


## Power your own project

You can use `@novl/optimize` as a library to build your own tools, workflows, or integrations for non-commercial distribution. For license terms and more information, see the [LICENSE](./LICENSE) file.

This is an update that should get published to both the private and public branches

## Contributing

Times are changing and we needed something in-house that can help us work smarter not harder. This project started out as a need to solve some of our own unseen static site generator (SSG) problems and figured it might help some of you too. 

We don't have time to manage pull requests at the moment.  However we'll do our best to regularly make updates and push changes tri-weekly. We actively use Optimize in our projects so you'll see updates regularly. 
 
For features you'd like to see or if you spot any bugs, submit an issue.  Want to contribute? Yes please, let's build together and optimize the web one static site at time.

Say hello at contributors@bynovl.com! 