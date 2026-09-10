// ===================================================================
// This file defines the properties of your custom check, which are
// used by the CLI and orchestrator to register and run the check.
// ===================================================================
// check-props.js exports the metadata used by the CLI and
// orchestrator to register your custom check. It describes:
//   * `label` – human‑readable name shown in reports
//   * `key`   – machine key used for results and summaries
//   * `flag`  – CLI switch that enables this check (e.g. --lang)
// -------------------------------------------------------------------

export const checkProps = {
  label: 'Language',
  key: 'lang',
  flag: '--lang' // unique CLI flag activating this check
}

// ------------------------------------------------------------------
// After copying this template, make the following edits:
// 1. In `index.js`, rename the default export function to
//    match your key (e.g. key="metaLanguage" ⇒ function checkMetaLanguage()).
// 2. In `bin/cli.js`, import that function by the same nam and update
//    instances where it's used.
// ------------------------------------------------------------------