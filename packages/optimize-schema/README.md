# @novl/optimize-schema

Schema (structured data) validation submodule for NOVL Optimize.  
Checks HTML files for valid, complete, and best-practice JSON-LD schema blocks to ensure rich search results and SEO for static sites.

---

## Quick Start

**CLI:**
Single check
```bash
npx optimize-schema
```
Core CLI with flags (with core package only):
```bash
npx optimize --schema
```
Defined config checks in `optimize.config.js` with Core package:
```js 
{ 
  "enabledChecks": ["--schema"]
}
```
**API:**
```js
import checkSchema from '@novl/optimize-schema';
// config: object, htmlFiles: array of file paths
const results = await checkSchema(config, htmlFiles);
```

---

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

## Customizing & Extending Schema Validation

You can add or customize schema validation logic by editing your `optimize.config.js` or by adding new helpers:

**Config-based validation:**
- Use `schemaDataDefault` to require keys on every schema block (e.g., `@context`, `@type`, `name`).
- Use `schemaDataCustom` for context-specific or nested keys. Use dot notation for nested keys and `:required` for strict presence.
- Example:
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

**Code-based extension:**
- Add new validation helpers in `lib/schema/` following the project conventions.
- Helpers should follow the parameter order: `content, item, relPath, siteDir, file (optional), ...function-specific`.
- *Note: this hasn't been thoroughly tested so if you use this feature and see a bug please let us know*

For more advanced logic, see the [main documentation](../../README.md).

## Developer Notes

- All validation and helper functions follow the strict parameter order:  
  `content, item, relPath, siteDir, file (optional), ...function-specific`
---

## Developer Notes

- All validation and helper functions follow the strict parameter order:  
  `content, item, relPath, siteDir, file (optional), ...function-specific`
- To add new schema checks, create a new helper in `optimize-schema/scripts/new-validation.js` and follow the module code patten and logic.

## Power your project
We love building and seeing other builds! Go ahead and use it your project. You can use `@bynovl/optimize-schema` to build your own tools or use it as a reference for best-practice utility logic for non-commercial use. *For full license terms see the [LICENSE](./LICENSE) file.*

## Contributing
We don't have the in-house capacity yet to manage a full pull-request lifecycle but we welcome new utilities and improvements. And we're committed to making changes every 3-weeks. Feel free to report an issue, suggest a patch, or request a feature and all that. 

If you're inspired to contribute, yay we love hellos. Join us in building cool things sometimes just because, others for a cause and a few with a dash of for profit to keep the lights on (no this wasn't AI).

Reach out at contributors@bynovl.com