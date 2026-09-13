import { spawn } from 'node:child_process';
import { resolvePackage } from '@bynovl/optimize-utils/resolve-package.js';
import fs from 'fs';
import path from 'path';

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

export async function setupDash() {
    const projectRoot = process.cwd();
    const resultsPath = path.join(projectRoot, '.novl', 'results.json');

    if (fs.existsSync(resultsPath)) {
        return;
    }
    console.log('[NOVL Optimize]: Setting up dashboard data …');
    const coreCliPath = path.resolve(__dirname, '../optimize-core/bin/cli.js');

    // Spawn a child process that runs the core CLI with the JSON flag.
    // We keep the same cwd so the child picks up the user’s `optimize.config.js`.
    const child = spawn(
        'node',
        [coreCliPath, '--json', '.novl/results.json'],
        {
            stdio: 'inherit',               // forward its stdout/stderr to the console
            cwd: projectRoot,
            shell: true,                    // works on Windows as well
            env: {                          // <<< set API mode
                ...process.env,
                DISABLE_BANNER: 'true',
            }
        }
    );

    const successMessage = '[NOVL Optimize]: ✅  Dashboard setup completed successfully.';
    await handleUncaughtErrors(child, successMessage);
}

export async function deployDash(extraArgs = []) {
    // execute the deployMain function from optimize-web/lib/deploy.js
    // by spawning a child process that runs the deploy.js script with the extraArgs
    const projectRoot = process.cwd();
    const result = await resolvePackage('@bynovl/optimize-web');
    const deployScriptPath = path.join(result.packageRoot, 'bin', 'deploy.js');

    const child = spawn(
        'node',
        [deployScriptPath, ...extraArgs],
        {
            stdio: 'inherit',               // forward its stdout/stderr to the console
            cwd: projectRoot,
            shell: true,                    // works on Windows as well
        }
    );

    const successMessage = '[NOVL Optimize]: ✅  Deployment completed successfully.';
    await handleUncaughtErrors(child, successMessage);
}

export async function launchDash({ extraArgs = [] } = {}) {
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

async function handleUncaughtErrors(child, successMessage) {
    // Wait for the child to finish.  If it exits with a non‑zero code we abort.
    await new Promise((resolve, reject) => {
        child.on('close', code => {
            if (code === 0) {
                console.log(successMessage ? successMessage : '[NOVL Optimize]: ✅  Operation completed successfully.');
                resolve();
            } else {
                reject(new Error(`Optimize web deploy exited with code ${code}`));
            }
        });
        child.on('error', err => {
            console.error('[Optimize‑Web] Child process error:', err);
            reject(err);
        });
    });
}

