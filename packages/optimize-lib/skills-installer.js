// install-project-skills.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { colors } from '@bynovl/optimize-utils/ansi-colors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ------------------------------------------------------------------
// Where the skills live in the repo
const REPO_SKILLS_ROOT = path.resolve(__dirname, 'skills');
console.log(colors.gray(`Repo skills root: ${REPO_SKILLS_ROOT}`));

// Supported environment folders
const SUPPORTED_ENVS = ['.agents', '.github', '.claude'];

// ------------------------------------------------------------------
// Helper: SHA‑256 hash of a file (cheap idempotency check)
function fileHash(filePath) {
    return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

// Helper: shallow compare two directories (size + hash of each file)
function dirsAreEqual(src, dest) {
    if (!fs.existsSync(dest)) return false;
    const srcEntries = fs.readdirSync(src);
    const destEntries = fs.readdirSync(dest);
    if (srcEntries.length !== destEntries.length) return false;

    for (const entry of srcEntries) {
        const srcStat = fs.statSync(path.join(src, entry));
        const destStat = fs.statSync(path.join(dest, entry));

        if (srcStat.isDirectory() !== destStat.isDirectory()) return false;
        if (!srcStat.isDirectory()) {
            if (srcStat.size !== destStat.size) return false;
            if (fileHash(path.join(src, entry)) !== fileHash(path.join(dest, entry))) return false;
        }
    }
    return true;
}

function copyDirectory(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDirectory(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}
// ------------------------------------------------------------------
// Core installer
export async function installSkills({
    skillNames = [],   // [] → install *all* skills
    dryRun = false,
    force = false,
} = {}) {
    const cwd = process.cwd();

    // -------------------------------------------------------------
    // Detect which env folders exist
    const envPaths = SUPPORTED_ENVS
        .map(env => path.join(cwd, env))
        .filter(p => fs.existsSync(p) && fs.lstatSync(p).isDirectory());

    if (envPaths.length === 0) {
        console.log(colors.yellow('No supported environment folder found – nothing to install.'));
        return;
    }

    // -------------------------------------------------------------
    // List all skill directories under the repo
    const allSkillDirs = fs.readdirSync(REPO_SKILLS_ROOT, { withFileTypes: true })
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name);

    // -------------------------------------------------------------
    // Resolve which skills the user actually wants
    const selectedSkills = skillNames.length === 0
        ? allSkillDirs
        : skillNames.filter(name => {
            if (allSkillDirs.includes(name)) return true;
            console.log(colors.yellow(`Skill "${name}" not found under ${REPO_SKILLS_ROOT}`));
            return false;
        });

    if (selectedSkills.length === 0) {
        console.log(colors.yellow('No matching skills to install.'));
        return;
    }

    // -------------------------------------------------------------
    // Copy loop
    for (const envPath of envPaths) {
        const targetRoot = path.join(envPath, 'skills');
        if (!fs.existsSync(targetRoot) && !dryRun) {
            fs.mkdirSync(targetRoot, { recursive: true });
            console.log(colors.gray(`Created ${targetRoot}`));
        }

        for (const skillName of selectedSkills) {
            const src = path.join(REPO_SKILLS_ROOT, skillName);
            const dest = path.join(targetRoot, skillName);

            const alreadySame = !force && dirsAreEqual(src, dest);
            if (alreadySame) {
                console.log(colors.gray(`${dest} already up‑to‑date`));
                continue;
            }

            if (dryRun) {
                console.log(colors.cyan(`Would copy ${src} → ${dest}`));
                continue;
            }

            copyDirectory(src, dest);
            console.log(colors.green(`Installed ${skillName} → ${dest}`));
        }
    }

    if (dryRun) {
        console.log(colors.cyan('\nDry‑run complete – no files were written.'));
    }
}