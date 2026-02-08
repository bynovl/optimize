# @novl/optimize-tests

This package provides a global test and demo environment for NOVL Optimize. It contains sample site HTML and configuration for testing, validating, improving and adding new modules. No site setup is required. The package includes sample HTML and config for immediate testing.

You can use this out of the box or create new scripts and validate against this directory and test all features, including link, media, schema, and meta checks.

## Purpose
- Centralized space for local testing and validation of optimize modules.
- Easy onboarding to validate package checks against sample data.
- Not required by any core package; use directly from the monorepo and copy config as needed. 

## Usage

Add the `optmize-tests` package to an existing project to validate modules against sample data. You can use an empty directory or include it in an existing project without interference. To do so create or update your project’s `optimize.config.js` in your root directory. Import the `defaultConfig` and `dir` from package:

```javascript
import defaultConfig, { dir } from '@bynovl/optimize-tests/optimize.config.js';
export default {
  outDir: dir,
  ...defaultConfig
};
// You are now ready to start testing
```

**Run all checks:**
```bash
npx optimize
```

**Run specific checks:**
```bash
npx optimize --meta --hierarchy
npx optimize --links
```

**Run directory or file checks:**
```bash
npx optimize --file check-meta/index.html
npx optimize --file check-hierarchy
```

**Combine patterns:**
```bash
npx optimize --file check-meta/index.html --meta --hierarchy
```

**⚠️ Note on Editing Sample Files**

For demonstration or test purposes, you (or automated tools like AI assistants) may directly edit files inside `node_modules/@bynovl/optimize-tests/site/` (for example, to quickly fix or experiment with meta, schema, or accessibility issues). **This is not recommended for production or real projects**—any changes made here will be lost whenever you reinstall, update, or re-link the package, as package managers overwrite the contents of `node_modules`.

If you want to make permanent changes, always copy the relevant files or code to your own project’s source directory and apply fixes there. The sample files in this package are intended for testing and validation only, not for use in production sites.

## Automate with SKILL.md

We developed a global SKILL.md to help you summarize, analyze, and fix issues with AI. You can use it in the CLI or directly in the chat window—just choose your model and go!

**How to use:**
- Download or copy the SKILL file from the repo (see link below)
- Add it to your project SKILLS folder `.github/skills` or `.claude/skills`.
- Use it to interpret optimize results, get summaries, and generate fixes automatically

**Get the global SKILL file:**
- [Global SKILL file (optimize)](https://github.com/bynovl/optimize/skills/optimize/SKILL.md)

## Power Your Project

We love building and seeing other builds! Use this package in your project to build your own tools or as a reference for best-practice utility logic (for non-commercial use). For full license terms, see the [LICENSE](./LICENSE) file.

## Contributing

We currently don’t have the in-house capacity to manage a full pull-request lifecycle, but we welcome new utilities and improvements. We’re committed to making changes every three weeks. Feel free to report an issue, suggest a patch, or request a feature.

If you’re inspired to contribute, we love hellos! Join us in building cool things—sometimes just because, sometimes for a cause, and sometimes with a dash of profit to keep the lights on (no, this wasn’t AI).

Reach out at contributors@bynovl.com