import { spawn } from 'node:child_process';
import { resolvePackage } from '@bynovl/optimize-utils/resolve-package.js';

/**
 * Launches the Optimize‑Web dashboard.
 * Resolves the UI package at call‑time to ensure the CLI path is available even when the
 * module is imported before the package is installed (e.g., during tests or dynamic loads).
 */
export async function launchWebDashboard({ extraArgs = [] } = {}) {
    const projectRoot = process.cwd();

    // Resolve the UI package (monorepo or installed) each time the function is called.
    let uiCliPath;
    let uiPackageRoot;
    try {
        const result = await resolvePackage('@bynovl/optimize-web');
        uiCliPath = result.cliPath;
        uiPackageRoot = result.packageRoot;
    } catch (e) {
        console.error(e.message);
        process.exit(1);
    }

    const child = spawn('node', [uiCliPath, 'start', ...extraArgs], {
        stdio: 'inherit',
        cwd: projectRoot,
        env: { ...process.env, npm_config_prefix: uiPackageRoot },
        shell: true,
    });

    return new Promise((resolve, reject) => {
        child.on('close', code => (code === 0 ? resolve() : reject(new Error(`Optimize‑Web exited ${code}`))));
        child.on('error', reject);
    });
}
