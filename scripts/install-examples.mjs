#!/usr/bin/env node
/**
 * Cross-platform installer for optimize templates, skills, and workflow files
 * Usage: node install-examples.cjs
 */
import fs from 'fs';
import os from 'os';
import path from 'path';
import readline from 'readline';
import { spawnSync } from 'child_process';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise(resolve => rl.question(question, answer => resolve(answer)));
}

const c = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  cyan:   '\x1b[36m',
  green:  '\x1b[32m',
  yellow: '\x1b[33m',
  red:    '\x1b[31m',
};
const bold   = s => `${c.bold}${s}${c.reset}`;
const cyan   = s => `${c.cyan}${s}${c.reset}`;
const green  = s => `${c.green}${s}${c.reset}`;
const yellow = s => `${c.yellow}${s}${c.reset}`;
const red    = s => `${c.red}${s}${c.reset}`;

function checkCmd(cmd) {
  const which = process.platform === 'win32' ? 'where' : 'which';
  return spawnSync(which, [cmd], { stdio: 'ignore' }).status === 0;
}

function copyRecursiveSync(src, dest, noOverwrite = false) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursiveSync(path.join(src, entry), path.join(dest, entry), noOverwrite);
    }
  } else {
    if (noOverwrite && fs.existsSync(dest)) {
      return; // skip existing files
    }
    fs.copyFileSync(src, dest);
  }
}

(async () => {
  console.log(bold("\n⚙  NOVL Optimize — Installer"));
  console.log("Install templates, checks, skills, or CI/CD workflow files from the GitHub repository.");
  console.log();
  const cont = await ask("Do you want to continue? (y/n) ");
  if (!/^y$/i.test(cont.trim())) {
    console.log(yellow("\n✖  Installation cancelled."));
    rl.close();
    process.exit(1);
  }

  // Check for git
  if (!checkCmd('git')) {
    console.error(red("\n✖  Error: 'git' is required but not found in PATH."));
    rl.close();
    process.exit(1);
  }

  // Home directory
  const HOME_DIR = os.homedir();

  console.log(bold("\nWhat would you like to install?"));
  console.log(`  ${cyan('1')} - config file`);
  console.log(`  ${cyan('2')} - custom check`);
  console.log(`  ${cyan('3')} - extend check examples`);
  console.log(`  ${cyan('4')} - optimize.yml ${c.yellow}(CI/CD workflow)${c.reset}`);
  console.log(`  ${cyan('5')} - optimize-site skill`);
  console.log(`  ${cyan('6')} - all templates`);
  console.log();
  const choice = (await ask("Enter your choice (1-6): ")).trim();

  let folderPath;
  if (choice === '1') folderPath = 'templates/optimize.config.js';
  else if (choice === '2') folderPath = 'templates/custom-check';
  else if (choice === '3') folderPath = 'templates/extend-checks.js';
  else if (choice === '4') folderPath = 'templates/optimize.yml';
  else if (choice === '5') folderPath = 'skills/optimize-site';
  else if (choice === '6') folderPath = 'templates';
  else {
    console.log(red("✖  Invalid choice. Please enter a number from 1 to 6."));
    rl.close();
    process.exit(1);
  }

  let targetDir = '.';
  if (choice === '5') {
    console.log();
    console.log(bold("Where do you want to install the optimize-site skill?"));
    console.log(`  ${cyan('1')} - .github/skills  (local, GitHub Copilot/Actions)`);
    console.log(`  ${cyan('2')} - .claude/skills   (local, Anthropic/Claude)`);
    console.log(`  ${cyan('3')} - ~/.agent/skills  (global, user home)`);
    console.log(`  ${cyan('4')} - Custom directory`);
    console.log();
    const skillDest = await ask("Enter 1, 2, 3, or 4: ");
    if (skillDest === '1') targetDir = '.github/skills';
    else if (skillDest === '2') targetDir = '.claude/skills';
    else if (skillDest === '3') targetDir = path.join(HOME_DIR, '.agents', 'skills');
    else if (skillDest === '4') {
      targetDir = (await ask("Enter custom directory path: ")).trim() || 'skills';
    } else {
      console.log(red("✖  Invalid choice. Exiting."));
      rl.close();
      process.exit(1);
    }
  } else if (choice === '4') {
    targetDir = (await ask("Please enter where you want to copy optimize.yml (default is .github/workflows): ")).trim() || '.github/workflows';
  } else if (!['6'].includes(choice)) {
    targetDir = (await ask("Please enter where you want to copy the example (default is current directory): ")).trim() || '.';
  }



  // Use existing temp dir if provided (e.g. from install-init), otherwise clone
  let tmpDir = process.env.OPTIMIZE_TMPDIR;
  let ownsTmpDir = false;
  if (!tmpDir || !fs.existsSync(tmpDir)) {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'optimize-examples-'));
    ownsTmpDir = true;
    process.on('exit', () => { try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {} });
    // Clone repo
    console.log();
    const repoUrl = 'https://github.com/bynovl/optimize.git';
    console.log(cyan('↓  Fetching from repository...'));
    const clone = spawnSync('git', ['clone', repoUrl, tmpDir], { stdio: 'inherit' });
    if (clone.status !== 0) {
      console.error(red('\n✖  Error: Failed to clone repository.'));
      rl.close();
      process.exit(1);
    }
    console.log();
  }

  // Ensure target directory exists
  fs.mkdirSync(targetDir, { recursive: true });

  // Resolve source path in temp dir
  const srcPath = path.join(tmpDir, folderPath);

  // Validate source exists and is non-empty
  let srcNonEmpty = false;
  if (fs.existsSync(srcPath)) {
    const stat = fs.statSync(srcPath);
    if (stat.isDirectory()) {
      srcNonEmpty = fs.readdirSync(srcPath).length > 0;
    } else {
      srcNonEmpty = true;
    }
  }

  if (!srcNonEmpty) {
    console.error(red(`\n✖  Error: Source not found or empty in cloned repo: ${folderPath}`));
    console.error(red(`   Expected path: ${srcPath}`));
    rl.close();
    process.exit(1);
  }

  console.log();
  // Copy logic with success check
  let copied = false;
  if (choice === '6' || (fs.statSync(srcPath).isDirectory() && choice !== '5')) {
    copyRecursiveSync(srcPath, targetDir);
    copied = true;
  } else if (choice === '5') {
    // Install the skill directory itself into targetDir as a named subdirectory
    // Uses noOverwrite=true so existing files in the destination are never replaced
    const skillDestDir = path.join(targetDir, path.basename(srcPath));
    console.log(`${bold('→  Installing skill to:')} ${skillDestDir}`);
    if (fs.existsSync(skillDestDir)) {
      console.log(yellow(`ℹ  ${skillDestDir} already exists — only new files will be added.`));
    }
    console.log();
    const confirm = await ask(`Confirm install to ${skillDestDir}? (y/n) `);
    if (!/^y$/i.test(confirm.trim())) {
      console.log(yellow('✖  Aborted by user.'));
      rl.close();
      process.exit(1);
    }
    copyRecursiveSync(srcPath, skillDestDir, true);
    copied = true;
  } else if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, path.join(targetDir, path.basename(srcPath)));
    copied = true;
  }

  if (copied) {
    if (choice === '5') {
      console.log(green(`\n✔  Skill installed to ${path.resolve(path.join(targetDir, 'optimize-site'))}.`));
    } else if (choice === '4') {
      console.log(green(`\n✔  Workflow file copied to ${path.resolve(targetDir)}.`));
    } else if (choice === '6') {
      console.log(green(`\n✔  All templates copied to ${path.resolve(targetDir)}.`));
    } else {
      console.log(green(`\n✔  Copied to ${path.resolve(targetDir)}.`));
    }
  } else {
    console.log(yellow('\n⚠  Nothing was copied. The source may be empty or missing.'));
  }
  rl.close();
})();
