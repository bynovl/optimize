# @novl/optimize-tests

This package provides a global test and demo environment for NOVL Optimize. It contains sample site HTML and configuration for testing, validating, improving and adding new modules. No site setup is required. The package includes sample HTML and config for immediate testing.

You can use this out of the box or create new scripts and validate against this directory and test all features, including link, media, schema, and meta checks.

## Purpose
- Centralized space for local testing and validation of optimize modules.
- Easy onboarding for contributors to validate package checks against sample data.
- Not required by any core package; use directly from the monorepo or copy config as needed.

## Usage

Add the `optmize-tests` package to an existing project to validate modules against sample data. You can use an empty directory or include it in an existing project without interference. To do so create or update your project’s `optimize.config.js` in your root directory. Import the `defaultConfig` and `dir`:

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
npx optimize -- --meta --hierarchy
npx optimize -- --links
```

You can add new test cases or sample data to the `site/` or `site-ext/` directory as needed. Note: these may be overwritten during updates.

See the [project README](../../README.md) for full configuration details.


## Power Your Project

We love building and seeing other builds! Use this package in your project to build your own tools or as a reference for best-practice utility logic (for non-commercial use). For full license terms, see the [LICENSE](./LICENSE) file.

## Contributing

We currently don’t have the in-house capacity to manage a full pull-request lifecycle, but we welcome new utilities and improvements. We’re committed to making changes every three weeks. Feel free to report an issue, suggest a patch, or request a feature.

If you’re inspired to contribute, we love hellos! Join us in building cool things—sometimes just because, sometimes for a cause, and sometimes with a dash of profit to keep the lights on (no, this wasn’t AI).

Reach out at contributors@bynovl.com