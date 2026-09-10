---
name: optimize-analyze
description: Analyze and interpret Website Audit Reports. Use when asked to "summarize the audit", "prioritize fixes", "explain why a page failed", "identify the worst performing areas", or "create an action plan" based on an existing audit.
license: Custom source-available (see LICENSE in package repository)
metadata:
  author: NOVL
  version: "1.1"
---

# Optimize Analyze

The Optimize Analyze skill is a specialized analysis skill that turns raw audit data (`results.json`) into prioritization and recommendation intelligence. The skill analyzes them to provide strategic guidance, prioritization, and clear explanations.

## Role

Review and analyze the `o-results.json`. Use the data to provide accurate recommendations, insight and prioritization. **Never** guess or make up information beyond the provided source of truth `o-results.json` (the definitive machine-readable data).

**Strict Rule**: If an issue is not explicitly listed in these files, it does not exist for the purpose of the current analysis.

* This skill owns analysis and recommendation logic.
* This skill does not own report file lifecycle management.
* `optimize-audit` is responsible for generating and editing the final report file.
* If a `o-results.json` (or file defined in `exportResultsJson`) does not exist, one can be created by running `npx optimize --json`.

## Workflows

### 1. Strategic Prioritization
When asked to prioritize fixes, the Interpreter follows this logic:
* Weighted impact: use category score and issue severity (`isError` vs `isWarning`) to rank categories and pages.
* ROI analysis: identify quick wins (high impact, low effort) vs deep fixes (high effort/systemic work).
* Cluster identification: group findings by likely root-cause patterns.

### 2. Root Cause Diagnosis
When asked why a specific page or category is failing:
* Cross-reference failing targets in `o-results.json` with report context.
* Classify failures as systemic vs isolated based on breadth and repetition.
* Provide actionable diagnosis and likely fix ownership areas.

### 3. Action Plan Generation
When asked for a "plan" or "roadmap":
* Phase 1: Critical (high-severity, broad impact)
* Phase 2: Important (high-value isolated fixes)
* Phase 3: Polish (warnings and low-risk improvements)

### 4. Recommendation payload generation
When asked to populate recommendations:
* Return a deterministic recommendation payload per category.
* Use schema: `Priority | Action | Why | How | Effort | Impact | Evidence`. (Refer to the priority rubric below for guidance on how to assign priority.)
* Keep evidence references tied to `o-results.json` page and target values.

## Operational Guidelines for the AI

To maintain total determinism, the AI must follow these steps for every request:

### Step 1: Data Acquisition
**Always** perform a read operation on the `o-results.json` (or file provided in the `exportResultsJson` configuration). If the file is missing, run `npx optimize --json` to generate them.

### Step 2: Evidence-Based Analysis
When presenting a finding, use this format:
* Finding: [Issue]
* Evidence: [Exact page and target from `o-results.json`]
* Impact: [Severity, breadth, and category score context]
* Recommendation: [Actionable next step]

### Step 3: Verification
Before finalizing the response, the AI must verify:
* Did I invent issues not present in `o-results.json`? If yes, remove them.
* Did I cover the highest-severity and broadest-impact issue clusters? If no, add them.
* Does recommendation priority match severity plus breadth plus effort? If no, fix ordering.

## Priority rubric
* Critical: systemic issue plus error severity plus broad page impact.
* High: error severity with repeated page impact.
* Medium: warning clusters or isolated errors with moderate impact.
* Low: cosmetic, isolated, or low-risk warnings.

## Example Prompts the Interpreter Handles

- *"Based on the current audit, what are the top 3 things I should fix today for the biggest SEO boost?"*
- *"Why is the Media score so low (12/100)? Give me a breakdown of the main culprits."*
- *"Looking at the o-results.json, is the missing meta description a template issue or a frontmatter issue?"*
- *"Create a JIRA-style task list for the accessibility errors found in the audit."*
- *"Which pages are the 'worst offenders' in terms of total weighted impact?"*

## Integration with other Skills

* With `optimize-audit`: provide recommendation payloads and prioritization insights that audit can write into report recommendation sections.
* With `optimize-fix`: prioritize which fixes to apply first based on impact and effort.


## References
- For richer information ground any recommendations and insights with industry standards, compare and use the following references:
  - [Google Lighthouse](https://developers.google.com/web/tools/lighthouse)
  - [Google Search Central](https://developers.google.com/search/docs/essentials)
  - [Web.dev](https://web.dev/)
