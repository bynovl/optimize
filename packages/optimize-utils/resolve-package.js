// resolve-package.js – utility to locate an installed package (e.g., @bynovl/optimize-web)
// Works both when running from the monorepo source checkout and when the package is installed via npm.
// Returns an object containing the packageRoot and the path to its CLI entry (bin/cli.js).

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';

export async function resolvePackage(packageName) {

  // Monorepo layout: packages/optimize-web, packages/optimize-core, etc.
  const thisDir = path.dirname(fileURLToPath(import.meta.url));
  const repoRoot = path.resolve(thisDir, '..');

  if (repoRoot.includes('/packages')) {
    const name = packageName.replace(/^@bynovl\//, ''); // strip scope
    const monorepoPkgRoot = path.join(repoRoot, name);
    const monorepoCli = path.join(monorepoPkgRoot, 'bin', 'cli.js');

    if (existsSync(monorepoCli)) {
      return { packageRoot: monorepoPkgRoot, cliPath: monorepoCli };
    }
  }

  // Try import.meta.resolve (Node >=20)
  try {
    const pkgUrl = await import.meta.resolve(packageName);
    const pkgPath = fileURLToPath(pkgUrl);
    const pkgRoot = path.dirname(pkgPath);
    const cliPath = path.join(pkgRoot, 'bin', 'cli.js');
    if (existsSync(cliPath)) return { packageRoot: pkgRoot, cliPath };
  } catch (_) {
    // ignore and fall back
  }

  // Fallback to CommonJS resolver (works in all Node versions)
  try {
    const { createRequire } = await import('node:module');
    const require = createRequire(import.meta.url);
    const pkgMain = require.resolve(packageName); // resolves to main entry inside the package
    const pkgRoot = path.dirname(pkgMain);
    const cliPath = path.join(pkgRoot, 'bin', 'cli.js');
    if (existsSync(cliPath)) return { packageRoot: pkgRoot, cliPath };
  } catch (_) {
    // ignore
  }

  // If none succeeded, throw a helpful error
  throw new Error(
    `⚠️  Package ${packageName} is not installed. Install it with "npm i ${packageName}".`
  );
}
