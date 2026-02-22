import fs from 'fs';
import path from 'path';
import { debug } from '@bynovl/optimize-utils/debug-log.js';

// Recursively find all check-props.js files under a root directory
function findAllCheckPropsFiles(rootDir) {
  let results = [];
  if (!fs.existsSync(rootDir)) return results;
  // Resolve symlinks to get real path
  const realRootDir = fs.realpathSync(rootDir);
  const list = fs.readdirSync(realRootDir, { withFileTypes: true });
  for (const entry of list) {
    const fullPath = path.join(realRootDir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(findAllCheckPropsFiles(fullPath));
    } else if (entry.isFile() && entry.name === 'check-props.js') {
      results.push(fullPath);
    }
  }
  return results;
}

// Derive package root from check-props.js path (assumes <pkg>/scripts/check-props.js)
export function getPackageRoot(checkPropsPath) {
  const scriptsDir = path.dirname(checkPropsPath);
  if (path.basename(scriptsDir) === 'scripts') {
    return path.dirname(scriptsDir);
  }
  return null;
}

// Search node_modules and packages/ walking up from a starting directory
export function searchFromDir(startDir, seen, checkPropsFiles) {
  let currentDir = startDir;
  while (true) {
    // Search node_modules
    const nodeModulesDir = path.join(currentDir, 'node_modules');
    if (fs.existsSync(nodeModulesDir)) {
      const realPath = fs.realpathSync(nodeModulesDir);
      if (!seen.has(realPath)) {
        const found = findAllCheckPropsFiles(nodeModulesDir);
        debug(`[getCheckModules] Searched: ${nodeModulesDir} => Found ${found.length} check-props.js`);
        // Add found files but dedupe by package name, preferring project 'packages/' when present
        const projectPackages = path.resolve(process.cwd(), 'packages');
        for (const fp of found) {
          const pkgRoot = getPackageRoot(fp);
          if (!pkgRoot) continue;
          let realPkgRoot;
          try { realPkgRoot = fs.realpathSync(pkgRoot); } catch (e) { realPkgRoot = path.resolve(pkgRoot); }
          const name = path.basename(realPkgRoot);
          // check if we already have this package name in checkPropsFiles
          const existingIndex = checkPropsFiles.findIndex(ep => {
            const er = getPackageRoot(ep);
            if (!er) return false;
            try { return path.basename(fs.realpathSync(er)) === name; } catch (e) { return path.basename(er) === name; }
          });
          if (existingIndex === -1) {
            checkPropsFiles.push(fp);
          } else {
            // prefer project packages over installed ones
            const existingEp = checkPropsFiles[existingIndex];
            const existingRoot = getPackageRoot(existingEp);
            let realExistingRoot;
            try { realExistingRoot = fs.realpathSync(existingRoot); } catch (e) { realExistingRoot = path.resolve(existingRoot); }
            const newIsProject = realPkgRoot.startsWith(projectPackages);
            const existingIsProject = realExistingRoot.startsWith(projectPackages);
            if (newIsProject && !existingIsProject) {
              debug(`[resolve-packages] Replacing package ${name} with project package: ${realPkgRoot}`);
              checkPropsFiles[existingIndex] = fp;
            } else {
              debug(`[resolve-packages] Skipping duplicate package ${name}: ${realPkgRoot}`);
            }
          }
        }
        seen.add(realPath);
      }
    }
    // Search packages/ (monorepo)
    const packagesDir = path.join(currentDir, 'packages');
    if (fs.existsSync(packagesDir)) {
      const realPath = fs.realpathSync(packagesDir);
      if (!seen.has(realPath)) {
        const found = findAllCheckPropsFiles(packagesDir);
        debug(`[getCheckModules] Searched: ${packagesDir} => Found ${found.length} check-props.js`);
        for (const fp of found) {
          const pkgRoot = getPackageRoot(fp);
          if (!pkgRoot) continue;
          let realPkgRoot;
          try { realPkgRoot = fs.realpathSync(pkgRoot); } catch (e) { realPkgRoot = path.resolve(pkgRoot); }
          const name = path.basename(realPkgRoot);
          const existingIndex = checkPropsFiles.findIndex(ep => {
            const er = getPackageRoot(ep);
            if (!er) return false;
            try { return path.basename(fs.realpathSync(er)) === name; } catch (e) { return path.basename(er) === name; }
          });
          if (existingIndex === -1) {
            checkPropsFiles.push(fp);
          } else {
            // prefer packages/ found here (project packages) — replace existing
            debug(`[resolve-packages] Replacing package ${name} with packages/ entry: ${realPkgRoot}`);
            checkPropsFiles[existingIndex] = fp;
          }
        }
        seen.add(realPath);
      }
    }
    const parent = path.dirname(currentDir);
    if (parent === currentDir) break;
    currentDir = parent;
  }
}