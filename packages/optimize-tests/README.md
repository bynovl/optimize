# @novl/optimize-tests

This package provides a global test and demo environment for NOVL Optimize. It contains sample site HTML and configuration for testing, validating, improving and adding new modules. No site setup is required. The package includes sample HTML and config for immediate testing.

You can use this out of the box or create new scripts and validate against this directory and test all features, including link, media, schema, and meta checks.

## Purpose
- Centralized space for local testing and validation of optimize modules.
- Easy onboarding for contributors to validate changes against sample data.
- Not required by any core package; use directly from the monorepo or copy config as needed.

## Usage

### Standalone Usage

1. Download or clone the `@novl/optimize-tests` package.

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Navigate to the package root:
```bash
cd /optimize-tests/
```

4. Run any of the included test scripts to validate modules:
```bash
npm run test:meta # meta check only 
npm run test:hierarchy # heirarchy check only
npm run test:optimize # run all checks
# ...and more
```

### Existing Project


You can add the test package to an existing project to validate modules against sample data. Update your project’s `outDir` in `optimize.config.js` to point to `node_modules/@bynovl/optimize-tests/site`.

**Import the test config in your project:**
```javascript
import testConfig from 'node_modules/@bynovl/optimize-tests/optimize.config.js';
export default {
  ...testConfig
};
```

**Run all checks:**
```bash
npm run optimize
```

**Run specific checks:**
```bash
npm run optimize -- --meta --hierarchy
npm run optimize -- --links
```

You can add new test cases or sample data to the `site/` or `site-ext/` directory as needed. Note: these may be overwritten during updates.

See the [project README](../../README.md) for full configuration details.


## Power Your Project

We love building and seeing other builds! Use this package in your project to build your own tools or as a reference for best-practice utility logic (for non-commercial use). For full license terms, see the [LICENSE](./LICENSE) file.

## Contributing

We currently don’t have the in-house capacity to manage a full pull-request lifecycle, but we welcome new utilities and improvements. We’re committed to making changes every three weeks. Feel free to report an issue, suggest a patch, or request a feature.

If you’re inspired to contribute, we love hellos! Join us in building cool things—sometimes just because, sometimes for a cause, and sometimes with a dash of profit to keep the lights on (no, this wasn’t AI).

Reach out at contributors@bynovl.com