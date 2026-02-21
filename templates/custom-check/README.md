# Custom Checks

## How to Add a New Check

Custom checks extend the NOVL Optimize engine by adding your own validation logic. The process is now highly automated:

1. **Copy the Template**
   - Download or copy the files from `templates/custom-check`.
   - Use the [install-examples](../../scripts/install-examples.sh) script for quick setup.

2. **Set Up Your Module**
   - Name your module folder as `optimize-[your-check]`.
   - In `index.js`, export your check function as the default export, named after your check (e.g., `export default function checkPerformance()`).
   - Edit `check-props.js` to set the flag, key, and label for your check.

3. **Automated Discovery**
   - For testing, you must create your custom check as a package, system link it (e.g., using `pnpm link` or `npm link`), and update the core package's `package.json` to include your custom check as a dependency.
   -  Once your package is linked and you run `pnpm install` it will be automatically discovered and registered by Optimize **when included as a dependency**.
   - No manual updates to core files are needed—flags, function mapping, and metadata are handled dynamically once your package is linked and listed as a dependency.

4. **Test and Submit**
   - Link your module in a test project.
   - If you want your check included in core, follow the submission steps below.

> **Note:** Use the [check-props.js](../custom-check/check-props.js) to add global values. You will still need to manually update the function name in index.js.

## Preparing for Inclusion in Core

Think your custom check is something the community would love and adds value to Optimize? Share your project with us and get it included in the core package or verified.

To submit your custom check for inclusion in the core package:

1. **Repository Checklist**
- **Make sure it's public.**
- **Include a clear `README.md` with usage instructions.** [See example](../../packages/optimize-links/README.md)
- **Don't forget to include your own LICENSE.** You can [view our license](../../packages/optimize-core/LICENSE) for reference.

2. **Follow the Module Structure**
- Ensure your custom check follows this structure:

```
optimize-custom-check/
├── bin/
│   └── cli.js
├── default.config.js
├── index.js
├── check-patterns.js
├── check-validation.js
├── check-props.js
└── README.md
└── LICENSE
```

> **Note:** The files you copied have all that you need to get started and start customizing. Modify as needed. Include any plugins such as Lighthouse, Pa11y, and more. You're the architect—decide what works. 👩🏽‍💻

3. **Submit for Review**
- Send us the repository URL and a brief explanation of why your check should be included: [contributors@bynovl.com](mailto:contributors@bynovl.com).
- We will review your submission and involve the community in the voting process.

### Verified Packages

At NOVL, we care about speed—not just for performance, but to ensure tools are accessible regardless of your setup. If your custom check adds significant runtime or largely increases the install size, it may not be included in the core package. However, if it's compatible and adds value, we'll add you to our **verified packages** list. The community can then choose what works for them.

> **Note:** As the package owner, you're responsible for maintaining versioning and ensuring compatibility.

Together, let's optimize the web—leaving no site behind!
