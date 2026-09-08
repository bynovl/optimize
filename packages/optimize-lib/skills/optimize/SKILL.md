---
name: optimize
description: Orchestrator skill that routes requests to the focused Optimize fragments (setup, audit, analyze, fix). Provides a single entry-point for end-to-end validation or targeted orchestration of individual skills.
license: Custom source-available (see LICENSE in repository)
metadata:
  author: NOVL
  repository: https://github.com/bynovl/optimize
  version: "0.5"
---

# Skill: Optimize

## Role

You are the knowledge expert and **manager** of the Optimize toolchain. Route requests to the right sibling skill, carry full engine context, and keep the workflow deterministic from setup through verification. The complete loop is: configure → audit → analyze → remediate → re-audit.

## Quick Start (Operator Flow)

1. Ensure dependencies and build output exist.
2. Resolve config, source, and output paths.
3. Run `npx optimize --json --report` (full-site or scoped).
4. Analyze priority and root cause.
5. Plan fixes, apply only on explicit request.
6. Rebuild and re-audit to confirm closure.


## Skill Map (Source of Truth)

| Skill | Owns | Typical user intent |
|------|------|---------------------|
| `optimize-setup` | Config generation and configuration changes | "set up config", "update batchSize", "add custom check" |
| `optimize-audit` | Audit report artifact lifecycle (`audit.md`) | "run audit", "refine report", "fill recommendations" |
| `optimize-analyze` | Insight and prioritization from `results.json` | "summarize failures", "prioritize fixes", "why is this failing" |
| `optimize-fix` | Source-level remediation workflow | "fix audit errors", "apply safe fixes", "remediate meta issues" |

## End-to-End Lifecycle (Sibling Weave)

| Stage | Owning skill | Primary inputs | Primary outputs | Handoff rule |
|------|---------------|----------------|-----------------|--------------|
| 1. Setup baseline | `optimize-setup` | User requirements, existing `optimize.config.js` | Updated `optimize.config.js`, optional `extended-checks.js` | Always complete before first meaningful audit unless config is already valid. |
| 2. Produce evidence | `optimize-audit` | Built site output plus config | `results.json`, `audit.md` | If `results.json` is missing, generate it before analysis or fixes. |
| 3. Prioritize work | `optimize-analyze` | `results.json` | Ranked issues, risk/impact rationale, remediation order | Promote highest-impact systemic issues first (template/global issues before page-local issues). |
| 4. Remediate safely | `optimize-fix` | `results.json`, priorities from analyze | Fix plan or applied safe source edits | Default to plan mode unless user explicitly requests apply mode. |
| 5. Verify closure | `optimize-audit` then optional `optimize-analyze` | Updated source + rebuilt output | Refreshed report and delta in issue counts | Re-run audit after any applied fix batch to confirm no regressions. |

## Preflight: Config and Path Resolution

### Step 1 — Resolve the `outDir` from `optimize.config.js`

Always resolve `optimize.config.js` before audit, analyze, or fix steps. The `outDir` is the most critical setting. All findings reference paths inside it. Never touch files here directly. 
If an `outDir` is not present look for the default recognized build outputs `_site`, `dist`, and `public`.

```bash
# if a config doesn't exist it uses the system defaults and expects minimally an outDir to be present 
cat optimize.config.js
```

```js
// Plain string — resolve relative to project root
export default { outDir: 'dist' }
```

Confirm the resolved path exists before continuing:
```bash
ls <resolved-outDir>
```

### Step 2 — Identify the source directory

Findings always point to **built** HTML, but fixes go in **source** files. After resolving `outDir`, scan for the source root by looking for these common template/partial directories. The src directory is either the project root or the parent of the first matching template directory. If no source directory is found, assume the project is source-equals-output. Knowing the source root is critical for tracing issues back to the correct template or frontmatter file.

| Pattern | Holds |
|---------|-------|
| `_includes/` | Shared partials and snippets |
| `layouts/` | Base page templates |
| `partials/` | Reusable HTML fragments |
| `components/` | Component-based frameworks |
| `snippets/` | Shopify, theme-based setups |
| `views/` | Server-rendered templates |
| `pages/` | Page-level templates |
| `layouts/` | Astro, Nuxt, and other meta layouts |

```bash
ls <resolved-source-dir>
```

Additionally take note of the file extensions used in the source directory. The most common are `.njk`, `.liquid`, `.md`, `.html`, and `.js`. These extensions help determine the correct templating language and should be used when editing source files. 

## Commands and Checks

```bash
# Full-site audit
npx optimize

# File-scoped checks
npx optimize --path about/index.html

# Directory-scoped checks
npx optimize --path about

# Check-family focus
npx optimize --meta --hierarchy
npx optimize --schema
npx optimize --accessibility

# Combined scope/check run
npx optimize --path about/index.html --meta --open-graph
```

Available check families:

| Check flag | Focus |
|------------|-------|
| `--meta` | Title, description, keywords, canonical |
| `--open-graph` | OG tags and social cards |
| `--schema` | JSON-LD structured data |
| `--hierarchy` | Heading structure |
| `--accessibility` | Alt text, ARIA, contrast-related checks |
| `--links` | Internal and external links |
| `--media` | Media optimization and quality signals |
| `--sources` | Resource source/loading checks |

Additional options:

| Option | Purpose |
|--------|---------|
| `--path <path>` | Run checks for a specific built file |
| `--ci` | Non-zero exit when failures exist |
| `--help` | Show command help |
| `--version` | Show version |

**CI/CD Integration**: Use `--ci` to fail the build if any errors are found. Warnings do not cause a non-zero exit code.

```yaml
# .github/workflows/op.yml
name: Validate Site
on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      
      - name: Install dependencies
        run: npm install
      
      - name: Build site
        run: NODE_ENV=production npm run build
      
      - name: Run optimize
        run: npx optimize --ci
```


## Interpreting Results

There are several ways to consume the results. The fastest way is via `npx optimize` which will produce a summary in the console. For more detailed information, check the `results.json` and `audit.md` files. The `results.json` file contains structured data about each finding, while the `audit.md` file provides a human-readable report with recommendations. All results have the same issue anatomy fields to preserve in diagnosis and fix handoffs:

| Field | Meaning |
|-------|---------|
| `PATH` | Built file path relative to `outDir` |
| `Target` | Element or node with the issue |
| `Type` | Issue class such as missing/invalid/empty/duplicate |
| `Reason` | Technical cause |
| `Message` | Actionable fix guidance |
| `isError` | Error severity boolean |
| `isWarning` | Warning severity boolean |


## Keyword-Trigger Model (Routing Rules)

| Trigger words in request | Fragment invoked | Behavior |
|--------------------------|------------------|----------|
| setup / generate / create / scaffold | `optimize-setup` | Generate config/check scaffolding |
| modify / update / change / edit | `optimize-setup` | Modify existing config/check definitions |
| add (setting/check) | `optimize-setup` | Add key or custom check |
| remove / delete / drop | `optimize-setup` | Remove key or custom check |
| list / show / display config | `optimize-setup` | Read and summarize config without writes |
| audit / run audit / generate report | `optimize-audit` | Produce or refresh audit artifacts |
| refine / improve / revise report | `optimize-audit` | Rewrite report deterministically |
| summarize / prioritize / explain / why failing | `optimize-analyze` | Return diagnosis, priorities, and action plan |
| fix / repair / remediate | `optimize-fix` | Plan mode by default |
| apply fixes / execute fixes | `optimize-fix` | Apply mode with safeguards |

### Example request-to-action flows

| Natural-language request | Orchestrator action |
|--------------------------|---------------------|
| Generate a config for my blog | Route to `optimize-setup` generate mode |
| Run audit and give markdown report | Route to `optimize-audit` |
| Summarize top issues and what to fix first | Route to `optimize-analyze` |
| Plan fixes for meta only | Route to `optimize-fix` plan mode |
| Apply the planned fixes | Route to `optimize-fix` apply mode |

### Scope-Aware Routing

Preserve the user's intended scope through all analyze/fix handoffs:

| Scope intent | Routing behavior |
|--------------|------------------|
| Full release gate | Full audit + analyze + optional fix plan |
| Single page iteration | `--path` scoped audit, then focused analyze/fix |
| Section/Dir rollout | `--path` scoped audit, then focused analyze/fix |
| Quality slice (meta/schema/etc.) | Check-family-scoped audit and prioritized remediation |

## Safety & Idempotency
* When applying fixes (triggered by an “apply” intent), the `optimize-fix` fragment creates a backup (or a temporary Git branch) before writing changes.  
* Never apply edits directly in built output files under `outDir`; remediation belongs in source templates/frontmatter unless the project is truly source-equals-output.
* All fragments are deterministic; re‑running the same orchestrator command with the same inputs produces identical outputs.
