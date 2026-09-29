import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import { findConfigPath, loadConfig } from './get-config.js';

async function getUserConfigModuleSystem(configPath) {
    const ext = path.extname(configPath);
    if (ext === '.mjs') return 'esm';
    if (ext === '.cjs') return 'cjs';

    // .js is ambiguous — check nearest package.json
    let dir = path.dirname(configPath);
    while (dir !== path.dirname(dir)) {
        const pkgPath = path.join(dir, 'package.json');
        try {
            if (await fs.access(pkgPath)) {
                const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf8'));
                return pkg.type === 'module' ? 'esm' : 'cjs';
            }
        } catch {
            /* ignore parse errors */
        }
        dir = path.dirname(dir);
    }
    return 'esm'; // fallback
}

function updateExistingConfigSource(source, updates) {
    let content = source;

    for (const [key, value] of Object.entries(updates)) {
        const serializedValue = JSON.stringify(value);

        const propertyRegex = new RegExp(
            `^(\\s*['"]?${key}['"]?\\s*:\\s*)(['"\`])[^\\n]*?\\2(\\s*,?)$`,
            'm',
        );

        if (!propertyRegex.test(content)) {
            throw new Error(
                `Cannot safely add missing config property "${key}" without parsing the file`,
            );
        }

        content = content.replace(
            propertyRegex,
            `$1${serializedValue}$3`,
        );
    }

    return content;
}

function buildConfigContent(config, moduleSystem) {
    const startUrl = JSON.stringify(config.startUrl ?? '');
    const outDir = JSON.stringify(config.outDir ?? '');

    return moduleSystem === 'esm'
        ? `export default {\n  startUrl: ${startUrl},\n  outDir: ${outDir}\n};`
        : `module.exports = {\n  startUrl: ${startUrl},\n  outDir: ${outDir}\n};`;
}

export async function updateUserConfig(startUrl, outDir, cwd = process.cwd()) {
    try {
        const existingPath = findConfigPath(cwd);
        const configPath = existingPath || path.resolve(cwd, 'optimize.config.js');

        // Load existing config if not new
        let existingConfig = {}
        if (existingPath) {
            existingConfig = await loadConfig(existingPath);
        }

        const updateContent = {};
        if (startUrl !== undefined) { updateContent.startUrl = startUrl; }
        if (outDir !== undefined) { const absOutDir = path.resolve(cwd, outDir); updateContent.outDir = path.relative(cwd, absOutDir); }
        const mergedConfig = { ...existingConfig, ...updateContent, };

        let content;
        if (!existingPath) {
            const moduleSystem = await getUserConfigModuleSystem(configPath);
            content = buildConfigContent(mergedConfig, moduleSystem);
        } else {
            const originalSource = await fs.readFile(configPath, 'utf8');
            content = updateExistingConfigSource(originalSource, updateContent)
        }
        await fs.writeFile(configPath, content, 'utf8');
    } catch (e) {
        console.warn('[novl optimize] Warning: Could not update config:', e.message);
        return null;
    }
}