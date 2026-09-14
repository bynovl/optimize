// resolve-package.js – utility to locate an installed package (e.g., @bynovl/optimize-web)
// Works both when running from the monorepo source checkout and when the package is installed via npm.
// Returns an object containing the packageRoot and the path to its CLI entry (bin/cli.js).
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';

function getCliPath(packageRoot) {
  const cliPath = path.join(packageRoot, 'bin', 'cli.js');
  return existsSync(cliPath) ? cliPath : null;
}

export async function resolvePackage(packageName) {

  // Monorepo layout: packages/optimize-web, packages/optimize-core, etc.
  const thisDir = path.dirname(fileURLToPath(import.meta.url));
  const repoRoot = path.resolve(thisDir, '..');

  if (repoRoot.includes('/packages')) {
    const name = packageName.replace(/^@bynovl\//, ''); // strip scope
    const monorepoPkgRoot = path.join(repoRoot, name);
    const monorepoCli = getCliPath(monorepoPkgRoot);

    if (monorepoCli) {
      return { packageRoot: monorepoPkgRoot, cliPath: monorepoCli };
    }
  }

  // Try import.meta.resolve (Node >=20)
  try {
    const pkgUrl = await import.meta.resolve(`${packageName}/package.json`);
    const pkgRoot = path.dirname(fileURLToPath(pkgUrl));
    const cliPath = getCliPath(pkgRoot);
    if (cliPath) return { packageRoot: pkgRoot, cliPath };
  } catch (_) {
    // ignore and fall back
  }

  // Fallback to CommonJS resolver (works in all Node versions)
  try {
    const require = createRequire(import.meta.url);
    const pkgJsonPath = require.resolve(`${packageName}/package.json`);
    const pkgRoot = path.dirname(pkgJsonPath);
    const cliPath = getCliPath(pkgRoot);
    if (cliPath) return { packageRoot: pkgRoot, cliPath };
  } catch (_) {
    // ignore
  }

  // If none succeeded, throw a helpful error
  throw new Error(
    `⚠️  Package ${packageName} is not installed. Install it with "npm i ${packageName}".`
  );
}
