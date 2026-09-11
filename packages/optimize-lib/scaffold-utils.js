// packages/optimize-lib/scaffold-utils.js
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";   // <-- added pathToFileURL
import { defaultConfig } from "./get-config.js";
import util from "util";

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
export function copyTemplate(
    srcRelative,
    destRelative = path.basename(srcRelative),
    targetDir = process.cwd()
) {
    // Resolve the root of the `optimize-lib` package (one level up from this file)
    const libRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)));
    const src = path.join(libRoot, srcRelative);
    const dest = path.resolve(targetDir, destRelative);

    if (!fs.existsSync(src)) {
        console.error(`[optimize] Template not found: ${src}`);
        process.exit(1);
    }

    // --------------------------------------------------------------
    // If the destination already exists, back it up.
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
    // Perform the copy (recursive for directories).
    // --------------------------------------------------------------
    fs.cpSync(src, dest, { recursive: true, force: true });
    console.log(`[NOVL Optimize] Created ${dest}`);
}

/**
 * Writes a fresh `optimize.config.js`.
 */
export async function setupConfig(targetDir = null) {
    const config = await defaultConfig();

    // Resolve the directory where we will write the config.
    const destDir = targetDir ? path.resolve(targetDir) : path.resolve(process.cwd());

    // Ensure the directory exists
    if (!fs.existsSync(destDir)) {
        try {
            fs.mkdirSync(destDir, { recursive: true });
        } catch (e) {
            console.error(`Failed to create output directory "${destDir}":`, e);
            process.exit(1);
        }
    }

    // Path to the config file we will write
    const configPath = path.join(destDir, "optimize.config.js");

    // --------------------------------------------------------------
    // Load the *old* config (if it exists) so we can keep its outDir
    // --------------------------------------------------------------
    let oldOutDir = null;
    if (fs.existsSync(configPath)) {
        try {
            // Dynamically import the existing config as an ES module
            const { default: oldConfig } = await import(
                pathToFileURL(configPath).href
            );
            if (oldConfig && oldConfig.outDir) {
                oldOutDir = oldConfig.outDir;
            }
        } catch (e) {
            // If we fail to import (e.g., syntax error), just ignore – we’ll fall back to defaults
            console.warn(
                "[optimize] Could not read existing optimize.config.js – proceeding with defaults."
            );
        }

        // Back it up before we overwrite it (in the same target directory)
        try {
            const uniqueBackupPath = getUniqueBackupPath(configPath);
            fs.renameSync(configPath, uniqueBackupPath);
        } catch (e) {
            console.error("Failed to backup existing optimize.config.js:", e);
            return;
        }
    }

    // --------------------------------------------------------------
    // Detect whether any of the recognised output folders already exist
    // --------------------------------------------------------------
    const outputFolders = [
        "_site",
        "_opt",
        "dist",
        "out",
        "_build",
        "public",
    ];
    // Look for default output folders **relative to the target directory**,
    // because when the user asks to scaffold into a custom location we want
    // to respect any existing build output there.
    const defaultFound = outputFolders.some((f) => fs.existsSync(path.join(destDir, f)));

    // --------------------------------------------------------------
    // Preserve outDir from the old config *only* when no default folder was found
    // --------------------------------------------------------------
    if (!defaultFound && oldOutDir) {
        // Use the outDir from the previous config (convert to relative if needed)
        config.outDir = oldOutDir;
        if (path.isAbsolute(config.outDir)) {
            // Preserve a relative path *relative to the target directory*,
            // not the original cwd.
            config.outDir = path.relative(destDir, config.outDir);
        }
    } else {
        // Normal handling – make sure a relative path is stored (avoid absolute URLs)
        if (config.outDir && path.isAbsolute(config.outDir)) {
            config.outDir = path.relative(destDir, config.outDir);
        }
    }

    // --------------------------------------------------------------
    // Serialize the final config as a **JS literal** (un‑quoted keys where possible)
    // --------------------------------------------------------------
    const jsLiteral = util.inspect(config, { depth: null, compact: false });
    const fileContent = `export default ${jsLiteral};\n`;

    try {
        fs.writeFileSync(configPath, fileContent, { encoding: "utf8" });
        console.log(
            `[NOVL Optimize] Created new optimize.config.js in ${destDir}`
        );
    } catch (e) {
        console.error("Failed to write optimize.config.js:", e);
    }
}