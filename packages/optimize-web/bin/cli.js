#!/usr/bin/env node
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { createServer } from 'ws-exp/server/start.js';
import { getConfig } from 'ws-exp/server/lib/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..');   // packages/optimize-web

// ------------------------------------------------------------------
// Resolve the path to the locally‑installed anydash binary
// ------------------------------------------------------------------
let anydashBin = path.join(packageRoot, 'node_modules', '.bin', 'anydash');

// On Windows the binary is a .cmd file
if (process.platform === 'win32') anydashBin += '.cmd';

// If for some reason the binary isn’t there (e.g. deps not installed)
// fall back to npx – this will only happen in a dev environment where
// the workspace isn’t fully linked.
if (!existsSync(anydashBin)) {
    console.warn('⚠️  Local anydash binary not found – falling back to npx (may hit registry).');
    anydashBin = 'anydash';
}

// ------------------------------------------------------------------
// Spawn the dashboard
// ------------------------------------------------------------------
const child = spawn(anydashBin, ['start'], {
    stdio: 'inherit',   // pipe dashboard logs straight to the console
    cwd: packageRoot,   // make ws‑exp load packages/optimize-web/any.config.js
    shell: true         // ensures .cmd works on Windows
});

child.on('close', code => {
    // Propagate the exit status so `npm run optimize-web` reflects success/failure
    process.exit(code);
});