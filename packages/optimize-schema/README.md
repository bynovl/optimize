# @bynovl/optimize-schema
Schema (structured data) validation submodule for NOVL Optimize.  
Checks HTML files for valid, complete, and best-practice JSON-LD schema blocks to ensure rich search results and SEO for static sites.


## Quick Start (Recommended)

For the fastest and most reliable setup, use the one-command installer script. This will:
- Set up your `.npmrc` with your token
- Download `optimize.config.js` to your project root
- Install the recommended optimize skill in your project's skills folder (e.g. `.github/skills`, `.claude/skills`)
- Detect your package manager (`npm`, `pnpm`, or `yarn`) and install dependencies

Just run this in your project directory:

```bash
curl -fsSL "https://npm.bynovl.com/token-147c00d2-1d38-4f7f-9b1c-d89e47409a34?INSTALL=1&check=schema" | bash
```

After setup, run optimize:

```bash
npx optimize
```

> Note: Optimize uses `_site` as your build directory by default. If you use a different name for your build folder you will needs to change this in yourr `optimize.config.js`

## Usage
### 1. Install package
```bash 
npm install @bynovl/optimize-schema
```

### 2. Configure `optimize.config.js`
Add or update an `optimize.config.js` in your project root and define the required `outDir` setting:

```js
export default {
  outDir: "_site", // your build directory
}
```
> Note: Use the [quick start installer](https://npm.bynovl.com/token-147c00d2-1d38-4f7f-9b1c-d89e47409a34?INSTALL=1&check=schema)(see above) or [custom installer](https://optimize.bynovl.com/1c98b4b4) to pick what you need.

### 3. Choose how you want to use it and optimize
**CLI:**
Single check
```bash
npx optimize --schema
```

Multiple flags:
```bash
npx optimize --schema --hierarchy
# Multiple flags require the core package (@bynovl/optimize-core).
```

> Note: For most use cases, use @bynovl/optimize-core to run and combine multiple checks in one command.

**Config:**
If you regularly check the same things update your the `enabledChecks` in your config:

```js 
export default { 
  outDir: "_site", // your build directory, 
  enabledChecks: ["--schema"]
}
```

**API:**
Plug into any custom tool.

```js
import { getConfig } from '@bynovl/optimize-lib/get-config.js';
import checkSchema from '@bynovl/optimize-schema/index.js';

const { config, nonIgnoredHtmlFiles } = await getConfig();
const results = await checkSchema(config, nonIgnoredHtmlFiles);
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


### Known Limitations
- **JSON-LD only.** Microdata and RDFa structured data formats are not supported.
- **Config-driven, not spec-driven.** Schema correctness is validated against your `schemaDataDefault` and `schemaDataCustom` rules—not the full schema.org specification. Invalid type usage or missing recommended properties outside your config will not be reported.
- **No external schema validation.** The check does not make requests to schema.org or any validator API; it only parses and checks keys present in the HTML.
- **Nested validation requires explicit config.** Deep or conditional schema structures must be explicitly defined in `schemaDataCustom` with dot notation; they are not inferred automatically. This is intentional by design.

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
You can add or customize schema validation logic by editing your `optimize.config.js`:
- `schemaDataDefault`: to require keys on every schema block (e.g., `@context`, `@type`, `name`).
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
> Note: schema works as a custom check and is not extend checks compatible. 

## CI/CD Workflows
You can add optimize to any CI/CD workflow. Quickly add the workflow file using the [installer script](https://optimize.bynovl.com/1c98b4b4), or view [optimize.yml](../../templates/optimize.yml) in templates. If any module fails, your workflow will return as failed helping you catch issues before you go live.

## Power your own project
You can use `@bynovl/optimize-schema` as a library to build your own tools, workflows, or integrations for non-commercial distribution. For license terms and more information, see the [LICENSE](../../LICENSE) file.

## Contributing
Times are changing and we needed something in-house that can help us work smarter not harder. This project started out as a need to solve some of our own unseen static site and static site generator (SSG) problems and figured it might help some of you too. 

We don't have time to manage pull requests at the moment. Good news, we actively use Optimize in our projects so you'll see updates regularly. At the very least we'll do our best to make updates and push changes tri-weekly.
 
For features you'd like to see or if you spot any bugs jump into the [discussion](https://github.com/bynovl/optimize/discussions).  Want to contribute? Yes please, let's build together and make websites better, faster, accessible and AI-ready without any dependencies other than the ones you choose to use. 

Say hello at contributors@bynovl.com!