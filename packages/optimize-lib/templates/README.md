# Templates
Copy any template to your local workspace and start building using the [install-init](../scripts/install-init) script.

You can choose to install any of the following at run time: 
- **optimize.config.js**: configuration file
- **optimize.yml**: CI/CD workflow
- **extend-checks.js**: extensions file 
- **custom-check**: folder with all files needed for check

## Use cases

### optimize.config.js
Quickly spin up settings for your project. This file lets you configure which checks to run, extend or override default validation, and set project-specific options. Flexible and easy to customize.

### optimize.yml
Your base workflow file for CI/CD. Use this to automate optimize checks in your build pipeline, catch issues before deployment, and integrate with GitHub Actions or other CI tools.

### extend-checks.js
Add power and flexibility to existing checks! This file acts as a **mini rule engine** that integrates with optimize core functionality:

**What you can do:**
- Require or optionally check for any tag, attribute, or pattern
- Use simple regex or advanced logic (even cross-checking different HTML sections)
- Return custom error/warning objects for precise reporting
- Pass any context or arguments needed for validation

**Recommended patterns:**
- **No custom validation**: use this when normal matching is enough and you just want standard missing, duplicate, or empty handling.
- **Simple custom validation**: use a small validator when a matched value only needs a quick true/false check.
- **Robust custom validation**: use an object with `check`, `args`, `type`, `reason`, and `message` when you want reusable metadata and more advanced validation.
- **Direct content validation (`regex: null`)**: use this when the validator should receive filtered content directly and do its own parsing instead of relying on regex match values.

**Mental model:**
- Let the regex determine whether a tag is present.
- Let the core flow handle generic checks like missing, duplicate, and empty.
- Use `customValidation` for value-specific logic once a tag has been matched.
- Use `regex: null` when you want to bypass regex matching and validate the filtered content directly.

You can enforce any content, SEO, accessibility, or business rule you need—all from your config, with no core code changes required.

### custom-checks
Custom checks let you build advanced, project-specific validation modules, combine multiple checks, or create reusable plugins for your team. Perfect for complex workflows or specialized requirements.

**What you can do:**
- Validate any HTML, meta, schema, accessibility, or business rule you need
- Chain multiple checks together for complex logic
- Build reusable modules for your team or community
- Integrate with the core engine or run standalone
- **Disable all core checks and run only your own custom checks on top of the optimize engine**

For full details on architecture, setup, and best practices, see the [custom-check README](./custom-check/README.md).

See the file for robust examples and documentation on how to use this pattern.


