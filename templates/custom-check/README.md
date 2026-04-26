# Custom Checks

## How to Add a New Check

Custom checks extend the NOVL Optimize engine by adding your own validation logic. The process is now highly automated:

1. **Copy the Template**
   - Download or copy the files from `templates/custom-check`.
   - Use the [install-init](../../scripts/install-init) script for quick setup.

2. **Set Up Your Module**
   - Name your module using the `optimize` prefix (e.g. optimize-performance). You also want to update your `package.json` to use the same name.

      ```json 
      "name": "@yourusername/optimize-performance"
      "bin": { 
         "optimize-performance": "bin/cli.js"
      }
      ```

   - In the `index.js`, export your main check function as the default export and name it after your check (e.g., `export default async function checkPerformance(...) { ... }`). *Note: use camelCase for function names.* 
   - In `bin/cli.js`, import your check function using the same name (e.g., `import checkPerformance from '../index.js';`) and update all references to match. *This ensures your check is properly registered and executed by the orchestrator.*
   - Customize all files in scripts based on your intended validation. *See comments for instruction*

3. **Prepare Test Environment with System Link**
   - The package already ships with `pnpm-workspace.yaml` that treats the custom check as single package monorepo for ease of management. 
   - It also has the dependencies needed to run your check `optimize-lib` and `optimize-utils`
   - Run `pnpm install` and then `pnpm link --global` in the root of your custom check project. This sets you up to test the package as a standalone within the project root and externally in another project where Optimize is installed. 
   - To test locally run `pnpm optimize-test` script to make sure it works standalone. It validates your check against the `optimize-tests` package.
   - To test externally you can system link it in the project you want run it in `pnpm link @yourhandle/optimize-performance`. 
   - Experiment with different configuration settings using the `optimize.config.js`

   > **Beta Notice**: During the beta period, you must have an `.npmrc` file with your token at the root of your project. The **same token** is required to both install and update the Optimize package. Ensure your `.npmrc` is present and your token is available for both actions.

4. **Automated Discovery**
   - In your test project, add the system link by running `pnpm link @your/package-name`.
   - Once your package is linked and run `pnpm install`, it will be automatically discovered and registered by Optimize.
   - No manual updates to core files are needed—flags, function mapping, and metadata are handled dynamically once your package is linked and listed as a dependency and has the prefix `optimize-` and expected folder structure. 

5. **Test and Submit**
   - Make sure it works well in the environment. Fix any issues related to your check in your check project and test post as a standalone package AND as part of the Optimize suite. 
   - If you want your check included in core, follow the submission steps below.

> **Troubleshooting:** If you need to update or reinstall packages in your test project, package.json may overwrite or remove your custom check dependency. Always check and re-add your custom check as a dependency after such updates.

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
├── scripts/
│   └── check-patterns.js
│   └── check-validation.js
│   └── check-props.js
├── default.config.js
├── index.js
├── pacakge.json
└── README.md
└── LICENSE
```

> **Note:** The files you copied have all that you need to get started and start customizing. Modify as needed.

3. **Submit for Review**
- Send us the repository URL and a brief explanation of why your check should be included: [contributors@bynovl.com](mailto:contributors@bynovl.com).
- We will review your submission and involve the community in the process.

### Verified Packages

At NOVL, we care about speed—not just for performance, but to ensure tools are accessible regardless of your setup. If your custom check adds significant runtime or largely increases the install size, it may not be included in the core package. However, if it's compatible and adds value, we'll add it to the **verified packages** list. The community can then choose what works for them.

> **Note:** As the package owner, you're responsible for maintaining versioning and ensuring compatibility
. You're the architect—decide what works. 👩🏽‍💻

Together, let's optimize the web—leaving no site behind!