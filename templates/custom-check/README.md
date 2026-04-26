# Custom Checks

Custom checks extend the NOVL Optimize engine by adding your own validation logic. The process is highly automated:

## Setup
### 1. Copy the Template
- Download or copy the files from `templates/custom-check`.
- Use the [install-init](../../scripts/install-init) script for quick setup.

### 2. Set Up Your Module
- Name your module using the `optimize` prefix (e.g. optimize-performance). Update your `package.json` to use the same name.

    ```json
    "name": "@yourusername/optimize-performance"
    "bin": {
      "optimize-performance": "bin/cli.js"
    }
    ```

- In `index.js`, export your main check function as the default export and name it after your check (e.g., `export default async function checkPerformance(...) { ... }`). *Use camelCase for function names.*
- In `bin/cli.js`, import your check function using the same name (e.g., `import checkPerformance from '../index.js';`) and update all references to match. *This ensures your check is properly registered and executed by the orchestrator.*
- Customize all files in scripts based on your intended validation. *See comments for instruction.*

## Testing
### Local Standalone Testing
- Run and validate your check within its own package root.
- The package already ships with `pnpm-workspace.yaml` for monorepo management and includes dependencies (`optimize-lib`, `optimize-utils`).
- Run `pnpm install` and then `pnpm link --global` in the root of your custom check project.
- To test locally, run the `pnpm optimize` or `npm optimize` script. This validates your check against the `optimize-tests` package.

### System Link Testing in Another Project
- Link your package into another project and test as a dependency.
- In your custom check root, run `pnpm link`.
- In your test project, run `pnpm link @your/package-name` and then `pnpm install`.
- Your package will be automatically discovered and registered by Optimize. No manual updates to core files are needed—flags, function mapping, and metadata are handled dynamically as long as your package is linked and follows the expected structure.

### Publish as Private or Public Package
- If it works locally, you can publish it as a private or public package and test accordingly.

## Submitting to Core

Think your custom check is something the community would love and adds value to Optimize? Share your project with us and get it included in the core package or verified. Before you do make sure it works well in your environment. Fix any issues related to your check in your check project and test as a standalone AND as part of the Optimize suite locally and remotely.

### Checklist
- **Create a public repository with your package**
- **Include a clear `README.md` with usage instructions.** [See example](../../packages/optimize-links/README.md)
- **Don't forget to include your own LICENSE.** You can [view our license](../../packages/optimize-core/LICENSE) for reference.
- **Follow the Module Structure:**

    ```
    optimize-custom-check/
    ├── bin/
    │   └── cli.js
    ├── scripts/
    │   └── check-patterns.js
    │   └── check-validation.js
    │   └── check-props.js
    ├── default.config.js
    ├── index.js
    ├── package.json
    └── README.md
    └── LICENSE
    ```

    > **Note:** The files you copied have all you need to get started. Modify as needed.

### Submit for Review
- Send us the repository URL and a brief explanation of why your check should be included: [contributors@bynovl.com](mailto:contributors@bynovl.com).
- We will review your submission and involve the community in the process.

## Verified Packages

At NOVL, we care about speed—not just for performance, but to ensure tools are accessible regardless of your setup. If your custom check adds significant runtime or largely increases the install size, it may not be included in the core package. However, if it's compatible and adds value, we'll add it to the **verified packages** list. The community can then choose what works for them.

> **Note:** As the package owner, you're responsible for maintaining versioning and ensuring compatibility. You're the architect—decide what works best for your use case. 👩🏽‍💻

Together, let's optimize the web—leaving no site behind!