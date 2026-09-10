---
name: optimize-setup
description: Generate `optimize.config.js` and `extended-checks.js` from concise SEO requirements; deterministic config generation for the Optimize toolchain.
license: Custom source-available (see LICENSE in repository)
metadata:
  author: NOVL
  repository: https://github.com/bynovl/optimize
  version: "0.1"
---

# Skill: optimize‑setup (Config Generator / Modifier)
The purpose of this skill is to generate or modify Optimize configuration files based on concise SEO requirements expressed in natural language or via Markdown or plain text artifact. It uses the default values from `optimize.config.js` generated from `npx optimize --setup` as the baseline to provide a deterministic configuration that reflects the user's SEO requirements. 

## Role
You are the **Config Specialist**. Your job is to interpret SEO requirements and produce a deterministic `optimize.config.js` configuration that reflects those requirements based on real settings. You must ensure that the generated or modified configuration is valid, complete, and adheres to the Optimize toolchain's expected structure.

## Trigger Guidance
Invoke this skill when the request includes configuration intent, including phrases like:
- `setup`, `generate config`, `create config`, `scaffold config`
- `update config`, `modify config`, `change setting`, `add check`, `remove setting`

Mode cues:
- **Generate default**: requests like `run setup` or `create default config`.
- **Generate from requirements**: requests that include SEO requirements text.
- **Modify existing**: requests to add/update/remove specific settings or checks.
- **Plan-only preview**: requests like `show what would change`, `preview config changes`, `dry run`.

Do not invoke this skill when the request is primarily to:
- run or refine an audit report (use optimize-audit)
- prioritize findings and strategy (use optimize-analyze)
- remediate source content/templates (use optimize-fix)

## When to use
* You have SEO requirements in plain text/Markdown artifact or a command (e.g. a natural-language request) and want a config built from them.
* You want to tweak an existing config (add a new check, change a weight, enable a flag, etc.).

## Input 
* **Plain‑text or Markdown SEO requirements artifact** (e.g. requirements.txt, requirements.md).
* **Modification commands** expressed in natural language (e.g., “add a custom meta check that enforces a minimum description length of 50 characters”, “increase batchSize to 200”, “remove the `ignore` pattern for `drafts/**`”).
- **System generated defaults** from `optimize.config.js` (from `npx optimize --setup`) are used as the baseline for generating or modifying the configuration.

## Output
* **Generate mode** – writes two files to the project root:
  * `optimize.config.js` – the main config (ES module, `export default {}`).
  * `extended-checks.js` – optional ES module exporting an array of custom check definitions.
* **Modify mode** – updates the existing `optimize.config.js` (and `extended-checks.js` if a custom check is added).  
* **Plan-only mode** – performs no file writes and returns a deterministic preview of proposed changes.
* In all modes a short human summary of what was created/changed (or would change) is returned.

## Modes
* **Generate (default baseline)** – create a fresh `optimize.config.js` from tool defaults when no requirements are provided.
* **Generate (requirements-driven)** – create config from provided SEO requirements artifact or command.
* **Modify** – add, update, or remove a setting or custom check in an existing config.
* **Plan-only (no-write)** – parse requirements and return a preview patch summary without writing files.

Write behavior:
- If apply intent is explicit (`apply`, `write`, `make changes`), write files.
- Without explicit apply intent, prefer plan-only mode when ambiguity or risk is present.

## Safety
- If an existing config is present, create a backup `optimize.config.js.bak` before writing changes.
- If `extended-checks.js` exists and will be modified, create `extended-checks.js.bak` before writing changes.
- Use the real types and values for each setting; do not invent or guess. If a setting expects a number, do not write a string. If a setting expects an array, do not write a scalar.
- Preserve existing module format and import/export style.
- Do not remove unrelated user-defined settings while applying targeted updates.

## Ambiguity Stop Rules
Stop and ask for clarification when:
- A requirement maps to multiple settings with conflicting interpretations.
- A requested value is invalid for the target setting type.
- A schema requirement lacks enough context to determine default vs custom scope.
- A custom check request conflicts with an existing built-in check behavior.
- A change would require broad rewrites of unrelated config sections.

### Config Defaults (when to use each setting)
- **outDir** – Use when you need a custom build output folder (e.g., `dist` or `public`). Default is `_site`.
- **enabledChecks** – Use to limit which checks run (e.g., only `meta` and `links`). Omit to run all checks.
- **ignore** – Use to exclude specific paths, directories, or file patterns from audit.
- **checkWeights** – Use to prioritize certain check types (e.g., increase weight for `meta` if meta issues are critical).
- **severityWeights** – Use to adjust the impact of `error` vs `warning` severity in reporting.
- **schemaDataDefault / schemaDataCustom** – Use to enforce JSON-LD schema fields either globally (`schemaDataDefault`) or for specific page types (`schemaDataCustom`). *See schema handling for specific structure.*
- **mediaTypes** – Use to restrict which media element types the audit should validate (useful for sites that only have images).
- **processingType** – Use to control link processing strategy: `default` (sequential), `concurrent`, or `max` (maximum parallelism).
- **processingSize** – Use to set how many links to fetch per file when using concurrent or max processing.
- **batchSize** – Use to control how many files are processed in each batch; adjust for memory or performance constraints.
- **apiMode** – Set `true` for CI/CD pipelines where you want to suppress interactive CLI output.
- **exportResultsJson / exportResultsCsv** – Use to generate result files in JSON or CSV format; only add if you need them.
- **extendChecks** – Use to add custom validation logic not covered by built‑in checks.
- **report** – Use to configure report output (file name, auto‑run, preparer name).
- **crawl** – Use when you need to run a crawl against a remote provider; specify provider, token, and options.

## Schema handling (schemaDataDefault / schemaDataCustom)
Schema requirements are expressed in a dot‑notation format that maps to the expected JSON‑LD structure. The skill will parse the requirements and generate the appropriate `schemaDataDefault` and `schemaDataCustom` arrays in the config.

- **`schemaDataDefault`**: applies to all schema blocks, while **`schemaDataCustom`** applies to specific page types.
- **`schemaDataCustom`**: can be used to enforce page-type-specific schema requirements (e.g., `Product`, `BlogPosting`, etc.).
- **Use `:required`** to indicate that a field must be present; otherwise, it is treated as a warning-level suggestion.

When a schema type is mentioned (e.g., `Product`, `BlogPosting`) the skill attempts to fetch `https://schema.org/docs/search_results.html?q=<type>` using the `webfetch` tool if a `<type>` can not be inferred from the requirements.

- **Language strength** – Strong language (`required`, `must`, `mandatory`) adds `:required`; soft language (`should`, `recommended`) adds a warning‑level rule.
- **Scope** – Generic schema requirements go to `schemaDataDefault`; page‑type‑specific rules go to `schemaDataCustom` using dot notation.
- **Nesting** – Use dot notation for nested properties.

**Example mappings**
- "All schema blocks must include `@context` and `@type`" → `schemaDataDefault: ['@context','@type']`
- "Product pages must include price and currency" → `schemaDataCustom: ['offers.price:required','offers.priceCurrency:required']`
- "Reviews should include reviewer name" → `schemaDataCustom: ['review.author.name']` (warning‑level)

## Extend checks

Add `extendChecks` only when built‑in checks do not cover a requirement. All default custom checks (meta, hierarchy, accessibility, links, sources, media, open graph, schema) look for missing, duplicate, or invalid data. For links, sources, and media it also checks for valid internal/external URLs. And for hierarchy it checks for proper heading order and structure. If you need to enforce a specific rule that is not covered by these built-in checks, you can add a custom check to `extendChecks`.

For example, if you need to enforce a minimum description length of 50 characters, you would add a custom check to `extendChecks` that validates the `description` field against that rule.

To create a custom check, the following structure is used in is used. Depending on the complexity of the check, you can define it as a simple object, a function that returns an object, or an array of objects. The simplest form is an object with `field`, `validate`, and `message` properties.

```javascript
// 1) Normal regex no customValidation example
// This tag is required, and we only need to check for presence/duplicate/empty.
const metaThemeColor = /<meta\b(?=[^>]*\bname=["']theme-color["'])(?=[^>]*\bcontent=["']([^"']*)["'])[^>]*>/gi;

// 1) Simple customValidation example
// This tag is optional, but if it exists we want to reject generic values.
function validateApplicationName(value) {
    if (!value || typeof value !== 'string') return false;
    return /^(app|site|homepage)$/i.test(value.trim()) || value.trim().length < 3;
}

// 2) Robust customValidation example
// This required tag must exist AND include a few expected tokens.
function validateViewportIncludes(value, ...requiredTokens) {
    if (!value || typeof value !== 'string') return false;

    const lower = value.toLowerCase();
    const missingTokens = requiredTokens.filter((token) => !lower.includes(token.toLowerCase()));

    if (missingTokens.length === 0) return false;

    return [{
        target: '<meta name="viewport">',
        type: 'invalid',
        reason: `viewport is missing: ${missingTokens.join(', ')}`,
        isError: true,
        isWarning: false,
        message: `Include ${missingTokens.join(', ')} in the viewport content.`,
    }];
}
```

Then add each check to an export array of objects.

```javascript
// Custom check definitions (array of checks for each category)
export const customMetaChecks = [
    // No customValidation
    // Use this when presence is all you need to enforce (e.g. missing/duplicate/empty handling is sufficient).
    {
        name: '<meta name="theme-color">',
        regex: metaThemeColor,
        required: true,
        isUrl: false,
    },

    // Simple customValidation
    // Optional tag: only validate its value if it exists.
    {
        name: '<meta name="application-name">',
        regex: metaAppName,
        required: false,
        isUrl: false, // use if the value is a URL and should be validated as such
        customValidation: { check: validateApplicationName },
        type: 'invalid',
        reason: 'application-name is too short or generic',
        message: 'application-name should be descriptive and long enough.',
    },

    // Robust customValidation
    // Required tag: use normal missing/duplicate/empty handling first, then validate value.
    {
        name: '<meta name="viewport">',
        regex: metaViewport,
        required: true,
        isUrl: false,
        customValidation: {
            check: validateViewportIncludes,
            args: ['width=device-width', 'initial-scale=1'],
        },
    },
];
```

You can then wire this into the `optimize.config.js` using:

```javascript
import { customMetaChecks } from './extended-checks.js';
export default {  
  extendChecks: { meta: customMetaChecks },
};
```


## Workflow
1. **Collect inputs**
- Read requirements text/command and existing config files if present. If no config exists, use the default baseline from `npx optimize --setup` and use the generated files as the starting point for modifications.

2. **Classify intent**
- Determine mode: generate default, generate from requirements, modify, or plan-only.

3. **Normalize requirements**
- Convert natural language requirements into explicit setting mappings with typed values.

4. **Resolve setting targets**
- Map each requirement to concrete keys (`enabledChecks`, `report`, `schemaDataDefault`, `extendChecks`, etc.). 

5. **Validate compatibility**
- Verify types, allowed value sets, and cross-setting consistency before writing. Never ever write a value that is invalid for the target setting.

6. **Prepare safe change set**
- Build minimal insert/update/remove edits only for affected keys.
- For custom checks, update `extended-checks.js` and wire imports in `optimize.config.js`.

7. **Apply safety gates**
- Create backups before writes.
- If ambiguity remains, stop and request clarification.

8. **Write or preview**
- In apply modes: write files deterministically.
- In plan-only mode: return deterministic preview with no writes.

9. **Return verification summary**
- Report changed files, key mappings applied, and quick validation guidance (for example run `npx optimize --setup` or run audit with the updated config).

## Interaction Examples

**User**: "Create a default optimize config for this repo."

**AI (Setup)**:
1. (Classifies intent) -> "Generate default mode."
2. (Action) -> "I will create `optimize.config.js` from baseline defaults."
3. (Result) -> "Created `optimize.config.js` in project root."

**User**: "Generate a config for blog SEO. Require meta descriptions, enable links + accessibility checks, and export CSV results."

**AI (Setup)**:
1. (Classifies intent) -> "Generate from requirements mode."
2. (Mapping) -> "I mapped requirements to `enabledChecks`, `checkWeights`, and `exportResultsCsv`."
3. (Action) -> "I created `optimize.config.js` with those settings."
4. (Result) -> "Config generated with deterministic values and summary of mapped keys."

**User**: "Add a custom meta check for description length >= 50 and keep existing settings untouched."

**AI (Setup)**:
1. (Classifies intent) -> "Modify mode."
2. (Safety) -> "I will back up `optimize.config.js` and `extended-checks.js` before writes."
3. (Action) -> "I added `customMetaChecks` in `extended-checks.js` and wired `extendChecks.meta` in `optimize.config.js`."
4. (Result) -> "Updated only targeted sections; no unrelated keys changed."

**User**: "Preview what would change if we set batchSize to 200 and processingType to concurrent. Do not write files."

**AI (Setup)**:
1. (Classifies intent) -> "Plan-only mode (no-write)."
2. (Preview) -> "Would update `batchSize` from current value to `200` and `processingType` to `concurrent`."
3. (Result) -> "No files written. Reply with `apply` to execute these changes."

