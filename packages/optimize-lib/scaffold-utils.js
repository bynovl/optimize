import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { defaultConfig } from "./get-config.js";
/**
 * Return a unique backup path for a given file or directory.
 * Works the same way as in `scaffold-config.js`.
 */
function getUniqueBackupPath(originalPath) {
    let backupPath = `${originalPath}.bak`;
    if (!fs.existsSync(backupPath)) return backupPath;

    let idx = 1;
    while (fs.existsSync(`${originalPath}.bak_${idx}`)) {
        idx++;
    }
    return `${originalPath}.bak_${idx}`;
}

/**
 * Copy a template from the package into the target directory.
 * If the destination already exists (file or folder) it is first
 * renamed to a unique `.bak` (or `.bak_N`) backup, then the copy
 * proceeds.
 */
export function copyTemplate(srcRelative, destRelative = path.basename(srcRelative), targetDir = process.cwd()) {
    // Resolve the root of the `optimize-lib` package (one level up from this file)
    const libRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)));
    const src = path.join(libRoot, srcRelative);
    const dest = path.resolve(targetDir, destRelative);

    if (!fs.existsSync(src)) {
        console.error(`[optimize] Template not found: ${src}`);
        process.exit(1);
    }

    // --------------------------------------------------------------
    // 1️⃣  If the destination already exists, back it up.
    // --------------------------------------------------------------
    if (fs.existsSync(dest)) {
        const backup = getUniqueBackupPath(dest);
        try {
            fs.renameSync(dest, backup);
        } catch (e) {
            console.error(`Failed to backup existing ${dest}:`, e);
            process.exit(1);
        }
    }

    // --------------------------------------------------------------
    // 2️⃣  Perform the copy (recursive for directories).
    // --------------------------------------------------------------
    fs.cpSync(src, dest, { recursive: true, force: true });
    console.log(`[NOVL Optimize] Created ${dest}`);
}

/**
 * Writes a fresh `optimize.config.js` to the repository root. Existing config is backed up as `optimize.config.js.bak`.
 */
export async function setupConfig() {
    const config = await defaultConfig();
    const rootDir = path.resolve(process.cwd());
    const configPath = path.join(rootDir, "optimize.config.js");
    const backupPath = `${configPath}.bak`;

    // If a config already exists, rename it to a unique .bak (e.g., .bak, .bak_1, .bak_2, …)
    if (fs.existsSync(configPath)) {
        try {
            const uniqueBackupPath = getUniqueBackupPath(configPath);
            fs.renameSync(configPath, uniqueBackupPath);
        } catch (e) {
            console.error("Failed to backup existing optimize.config.js:", e);
            return;
        }
    }

    // Serialize the default configurat`ion as an ES module exporting a default object.
    // Ensure outDir is stored as a relative path (avoid absolute URLs)
    if (config.outDir && path.isAbsolute(config.outDir)) {
        config.outDir = path.relative(process.cwd(), config.outDir);
    }
    const fileContent = `export default ${JSON.stringify(config, null, 2)};\n`;

    try {
        fs.writeFileSync(configPath, fileContent, { encoding: "utf8" });
        console.log("[NOVL Optimize] Created new optimize.config.js with default settings.");
    } catch (e) {
        console.error("Failed to write optimize.config.js:", e);
    }
}
