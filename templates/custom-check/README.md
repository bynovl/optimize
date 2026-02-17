# Custom Checks

## How to Use

Custom checks extend the NOVL Optimize framework by adding your own validation logic. Follow these steps to create and test your custom check:

1. **Download the Template**
   - Navigate to the repository: [https://github.com/username/optimize-core](https://github.com/username/optimize-core)
   - Go to `templates/custom-check` and download the files manually.
   - *Recommended: For quick setup use the [install-examples](../../scripts/install-examples.sh) bash script. It will download the repo and keep only the files of the custom-check in the folder you run the script.*

2. **Set Up Your Custom Check**
   - Once downloaded, create a private repo.
   - Host your custom check on GitHub (e.g., `https://github.com/username/optimize-custom-check`).
   - The repo name should be `optimize-[custom-check]`. Replace `custom-check` with a clear name that explains what it does (e.g., performance, security, web-standards).
   - The name you use will become the name for the flag:
     ```bash
     --performance 
     --security
     --web-standards
     ```
     *Dashes are used for two or more word checks.*

   - It will also be used for your `customCheck` function:
     ```js
     checkPerformance()
     checkSecurity()
     checkWebStandards()
     ```
     *camelCase is used for two or more word functions.*
 
   > **Note:** The naming convention is important so that it plugs into the package without errors. For consistency use the [check-props.js](../custom-check/check-props.js) to add global values. You will still need to manually update the functon name. 

3. **Test Your Custom Check**
   - Link your custom check as a system link in a test project with `optimize-core` installed.
   - Update the following files in your project's `node_modules/@bynovl/optimize-core`:
     - `default.config.js`: Add your custom check's default settings.
     - `index.js`: Register your check under `enabledChecks`.
     - `package.json`: Add your custom check as a dependency.
   - Run `pnpm install` to resolve dependencies.

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
     ├── validate-check.js
     └── README.md
     └── LICENSE
     ```

     > **Note:** The files you copied have all that you need to get started and start customizing. Modify as needed. Include any plugins such as Lighthouse, Pa11y, and more. You're the architect—decide what works. 👩🏽‍💻

3. **Submit for Review**
   - Send us the repository URL and a brief explanation of why your check should be included: [os@bynovl.com](mailto:os@bynovl.com).
   - We will review your submission and involve the community in the voting process.

### Verified Packages

At NOVL, we care about speed—not just for performance, but to ensure tools are accessible regardless of your setup. If your custom check adds significant runtime or largely increases the install size, it may not be included in the core package. However, if it's compatible and adds value, we'll add you to our **verified packages** list. The community can then choose what works for them.

> **Note:** As the package owner, you're responsible for maintaining versioning and ensuring compatibility.

Together, let's optimize the web—leaving no site behind!
