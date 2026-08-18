---
name: optimize-config
description: AI workflow for generating or updating an Optimize config from a requirements document. Ground every setting in README, templates, sample configs, and implementation details so the result is accurate, supported, and validated.
license: Custom source-available (see LICENSE in package repository)
metadata:
  author: NOVL
  repository: https://github.com/bynovl/optimize
  version: "1.0"
---

# Optimize Config Generation

Use this skill when an AI agent needs to create or update an `optimize.config.js`-style file from a requirements document.

The purpose of this skill is to make config generation accurate, repeatable, and grounded in real project support.

This skill is written for AI execution. Follow it literally.

## Primary Objective

Convert plain-English requirements into a valid config by:

1. reading the requirements fully
2. reading the real project documentation and templates
3. using only supported config keys and value shapes
4. using extension mechanisms for custom rules
5. clearly marking anything that is not directly supported
6. validating all touched files before finishing

## Non-Negotiable Rules

### Rule 1: Do not invent settings

Never create config keys, option names, or value structures unless they are confirmed by at least one of the following:

1. README or official docs
2. config template
3. existing working config in the repository
4. implementation code that reads the setting

If support is not confirmed, do not use the setting.

### Rule 2: Requirements do not override implementation reality

If the requirements ask for something the tool does not support directly, do not pretend the config can do it.

Instead, choose one of these:

1. implement it through a documented extension point
2. leave a short comment in the config noting the limitation
3. mention in the final response that deeper custom logic is still required

### Rule 3: Prefer the smallest accurate config

Do not copy the full template unless the user asked for a full template.

Only include:

- required settings
- requirement-driven settings
- necessary imports for extension hooks
- brief comments where clarity matters

### Rule 4: Separate wiring from logic

If custom behavior is needed:

- keep the config file focused on configuration
- put custom logic in a separate extension file
- import only what is actually used

### Rule 5: Do not overwrite an existing config unless explicitly asked

If an `optimize.config.js` file already exists and the user asked to create a new config, create a new prefixed config file instead of overwriting the existing one.

Preferred naming pattern:

- `optimize-1.config.js`
- `optimize-test.config.js`
- another clear prefixed variant requested by the user

Only update the existing config file when the user explicitly asks to modify or replace it.

## Success Criteria

The result must be:

1. grounded in repository documentation
2. limited to supported settings
3. minimal but complete
4. validated after creation
5. explicit about gaps that need custom code or follow-up

## When to Use

Use this skill when the user asks an AI to:

- create a config from a requirements doc
- generate `optimize.config.js` from written specs
- update an existing config to match requirements
- translate business or audit requirements into tool configuration
- scaffold extension hooks when built-in settings are not enough

## Required AI Workflow

Follow these steps in order.

### Step 1: Read the requirements document first

Extract the following from the requirements:

- required checks
- optional checks
- reporting/export needs
- performance needs such as batching or scoping
- media/schema/link requirements
- any custom business rules
- any examples that imply custom validation

Create an internal mapping with 3 buckets:

1. directly supported by config
2. supported through `extendChecks` or other documented extension points
3. not supported directly

### Step 2: Read the authoritative config sources

Before writing anything, inspect the real sources of truth:

- `README.md`
- `templates/optimize.config.js`
- `templates/extend-checks.js`
- existing `optimize.config.js` file in the repository

Specifically confirm:

- exact key names
- exact value shapes
- whether the option is actually consumed by the code
- whether there are extension points for unsupported requirements

### Step 3: Determine the output format

Confirm all of the following before creating files:

- target filename
- whether an `optimize.config.js` already exists
- module format
- whether imports are needed
- whether the config should stand alone or extend another config
- whether a companion extension file is necessary

If an existing config is present and the user did not explicitly ask to overwrite it, create a new prefixed config file.

### Step 4: Map each requirement deliberately

For each requirement, choose exactly one implementation path:

#### Path A: Direct config support
Use a real config key.

Examples:

- `enabledChecks`
- `batchSize`
- `exportResultsCsv`
- `exportResultsJson`
- `mediaTypes`
- `schemaDataDefault`
- `schemaDataCustom`

#### Path B: Extension support
Use documented extension mechanisms.

Examples:

- `extendChecks`
- custom validation files
- imported helper arrays for check categories

#### Path C: Not directly supported
Do not fake support.

Instead:

- leave a short, precise comment in the config if useful
- mention the gap in the final response

### Step 5: Create the config file

Build the smallest correct config that satisfies the supported requirements.

Do:

- use exact supported property names
- preserve repository style
- add short comments only when they clarify intent or limitations
- keep defaults implicit unless the requirement specifically needs them
- create a new prefixed config filename when an existing config already occupies the default name

Do not:

- dump every template option into the file
- include speculative keys
- include unused imports
- bury important limitations in large comments
- overwrite an existing config unless the user explicitly asked for that

### Step 6: Create extension files only if justified

If a requirement cannot be represented by built-in config alone, create a separate extension file only when the repository clearly supports it.

Examples that often justify a custom extension:

- text length rules
- path-specific rules
- organization-specific content rules

When creating an extension file:

- keep it narrowly scoped
- use project-supported APIs and patterns
- export only the arrays or helpers the config needs
- wire it into the config cleanly

### Step 7: Validate touched files immediately

After creating or editing files:

- check for syntax errors
- confirm imports resolve
- confirm the module format is correct
- revise anything unsupported or broken

Do not finish with unvalidated files.

## AI Interpretation Rules

When interpreting requirements, use these rules:

### Be literal about support

If the README says a key exists but the implementation appears different, prefer the implementation and working examples.

### Distinguish direct support from custom support

If a requirement says “must enforce X” and Optimize only supports it through `extendChecks`, then the correct output is:

1. config wiring
2. extension file

not a fake config property.

### Distinguish page-level rules from cross-page rules

Some requirements sound simple but actually need cross-page analysis.

Examples:

- unique titles across the site
- unique descriptions across the site
- path-specific exceptions across groups of pages

Do not treat these as simple single-value config settings unless the code clearly supports that.

### Prefer concise comments

Comments should explain one of these only:

- why a setting is present
- what a custom rule is doing
- what requirement still needs deeper support

## Optimize-Specific Mapping Guidance

For this repository, these are common requirement mappings:

- audit scope → `enabledChecks`
- large-site handling → `batchSize`
- result export → `exportResultsCsv`, `exportResultsJson`
- markdown reporting → `llm`, `report`
- image-focused media validation → `mediaTypes`
- schema key requirements → `schemaDataDefault`, `schemaDataCustom`
- project-specific validation → `extendChecks` plus a separate custom file

Common examples that usually require custom checks here:

- meta description length constraints
- external link `target` and `rel` enforcement
- path-specific `noindex` rules
- self-referencing canonical checks
- cross-page uniqueness checks

Common examples that map directly to config here:

- output directory
- enabled checks
- batch size
- export output paths
- reporting options
- media types
- schema required keys

## Anti-Patterns

Do not do any of the following:

- generate config from the requirements doc alone
- ignore README or template guidance
- invent keys that sound plausible
- claim a requirement is handled when it is only partially handled
- place complex logic directly inside the config if the repo expects imported extensions
- create extension files without wiring them into the config
- overwrite an existing config when the user asked for a new one
- finish without validating files

## Required Final Output

A correct completion should include:

- the requested config file
- any extension file only if justified by the requirements
- no invented settings
- short comments for unsupported requirements when useful
- validated files

## Required Final Response Pattern

After the files are created and validated, respond briefly with:

1. what file or files were created or updated
2. what major requirements were implemented directly
3. what requirements were implemented through extensions
4. what still needs deeper support, if anything

## Final Checklist

Before finishing, confirm all of the following:

- requirements were read fully
- README/template/sample config were read
- only supported settings were used
- extension hooks were used correctly
- unsupported items were clearly noted
- an existing config was preserved unless overwrite was explicitly requested
- all touched files validate cleanly

