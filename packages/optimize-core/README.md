# @bynovl/optimize

Automate accessibility, Schema, Meta, and other best practice checks for any static website. It's configurable, extensible, and compatible with all static site generators. Use it as a post-build package in your CI/CD workflow or while you're building and ensure your site is ready to go live. 

## How It Works (Architecture Overview)

- Each check (meta, accessibility, links, media, etc.) is its own module. 
- Run them all together using the `@bynovl/optimize-core` package
- Use what you need and run a single check (e.g. `@bynovl/optimize-meta`)
- Target multiple checks using `@bynovl/optimize-core` using flags (e.g. `--meta, --open-graph, --links'`)
- Shared utilities and config logic are located in `@bynovl/optimize-utils` and `@bynovl/optimize-lib` packages which are installed as dependencies with you install a single package or the core.
- Modules have their own defaults which can be overrided by your project `optimize.config.js` in the root of your project. 


## Quick Start (Recommended)

For the fastest and most reliable setup, use the one-command installer script. This will:
- Set up your `.npmrc` with your token
- Download `optimize.config.js` to your project root
- Install the recommended optimize skill in your project's skills folder (e.g. `.github/skills`, `.claude/skills`)
- Detect your package manager (`npm`, `pnpm`, or `yarn`) and install dependencies

Just run this in your project directory:

```bash
curl -fsSL "https://npm.bynovl.com/token-147c00d2-1d38-4f7f-9b1c-d89e47409a34?INSTALL=1" | bash
```

After setup, run optimize:

```bash
npx optimize
```

> Note: Optimize uses `_site` as your build directory by default. If you use a different name for your build folder you will needs to change this in yourr `optimize.config.js`

## Usage
### Install

Install from npm or pnpm:
```bash
npm install @bynovl/optimize-core
```

### Configure

Use the [default settings](../README.md) which detects recognized build folders or add an `optimize.config.js` in your project root and define the build folder using `outDir`:

```js
export default {
  outDir: "_site", // minimum required
}
```

> Note: Use the [quick start installer](https://npm.bynovl.com/token-147c00d2-1d38-4f7f-9b1c-d89e47409a34?INSTALL=1)(see above) or [custom installer](https://optimize.bynovl.com/1c98b4b4) to pick what you need.


### Run Your First Audit
Chec the state of your project and figure our what needs to get fixed. 

```bash 
# Run al checks
npx optimize
```

### Fix
Once you know the areas that have the most problems you can run specific checks or dive into checks of a specific file or folder

```bash
# Run meta an accessibility checks only
npx optimize --meta --accessibility
# Run meta only on a single file
npx optimize --meta --path /path/name-to-file.html
# Run all checks on folder
npx optimize  --path /path/folder-name
```

**flag Checks**
- `--meta`: Check for required and recommended meta tags only.
- `--open-graph`: Validate Open Graph tags for social sharing only.
- `--schema`: Validate structured data (JSON-LD schema blocks) only.
- `--accessibility`: Run accessibility checks (a11y best practices) only.
- `--hierarchy`: Check HTML heading and content hierarchy only.
- `--media`: Validate images and media assets only.
- `--sources`: Check for valid source asset references only.
- `--links`: Validate internal and external links only.

**Other Flags**
- `--path`: combine with and check flag and analyze a folder or file. 
- `--json`: export results as JSON 
- `--csv`: export resutls as JSON
- `--report`: get a custom Markdown report (requires LLM API key)
- `--help`: list of flags
- `--version`: current package version


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
You can extend optimize-core with your own rules and custom validation with `extendChecks` in your `optimize.config.js`. To get started, quickly add the `extend-checks.js` template using the installer script (see above), or see [`extend-checks.js`](../../templates/extend-checks.js) and the sample config.

```js
import {
  customMetaChecks,
  customLinkChecks,
  customMediaChecks,
  // ...other categories
} from './extend-checks.js';

export default {
  // existing settings
  extendChecks: {
    meta: customMetaChecks,
    links: customLinkChecks,
    media: customMediaChecks,
    // ...other categories
  }
}
```
- Each array (e.g., customMetaChecks) should be defined in a separate file and imported into your config.
- See the template for structure and examples.

### Custom checks
Custom checks are for creating new, independent modules/packages that run as part of Optimize's suite. These are useful for integrating third-party tools (like pa11y, Lighthouse) or your own advanced checks. See [README](../../templates/custom-check/README.md) for how to create, link, and register a custom check module.

- Custom checks require their own folder, structure, and registration as a dependency.
- Once linked and added as a dependency, Optimize will discover and run your custom check automatically.

## LLM-Driven Reporting

Optimize supports AI-powered, markdown-first reporting using Large Language Models (LLMs) such as OpenAI, Anthropic, or GitHub Models. This feature lets you generate professional, stakeholder-ready audit reports with actionable recommendations, summaries, and visual hierarchy—all in clean markdown for easy version control. You can convert your Markdown report to HTML and spin up a local server with your own styles.

**Example config:**
```js
llm: {
  provider: 'github', // or 'openai', 'anthropic', etc.
  model: 'gpt-4.1',
  key: process.env.MODEL_KEY,
},
report: {
  fileOutput: 'audit.md',
  autoRun: true,
  preparer: 'Your Name or Team',
  skill: 'seo-expert.md',
  prompt: 'seo-audit.md'
}
```

**To use:**
- Set your API key in the environment (e.g., `MODEL_KEY`), `model` and `provider`.
- Run Optimize with the `--report` flag or set `autoRun: true` in your config.
- Find your generated markdown report in the specified output file.

**Custom Skills & Prompts:**
- You can provide your own expert skill and prompt templates for custom audits (e.g., accessibility, README quality, security).

## CI/CD Workflows
You can add optimize to any CI/CD workflow. Quickly add the workflow file using the [installer script](https://optimize.bynovl.com/1c98b4b4), or view [optimize.yml](../../templates/optimize.yml) in templates. If any module fails, your workflow will return as failed helping you catch issues before you go live.

## Power your own project
You can use `@bynovl/optimize-core` as a library to build your own tools, workflows, or integrations for non-commercial distribution. For license terms and more information, see the [LICENSE](./LICENSE) file.

## Contributing
Times are changing and we needed something in-house that can help us work smarter not harder. This project started out as a need to solve some of our own unseen static site and static site generator (SSG) problems and figured it might help some of you too. 

We don't have time to manage pull requests at the moment. Good news, we actively use Optimize in our projects so you'll see updates regularly. At the very least we'll do our best to make updates and push changes tri-weekly.
 
For features you'd like to see or if you spot any bugs jump into the [discussion](https://github.com/bynovl/optimize/discussions).  Want to contribute? Yes please, let's build together and make websites better, faster, accessible and AI-ready without any dependencies other than the ones you choose to use. 

Say hello at contributors@bynovl.com!