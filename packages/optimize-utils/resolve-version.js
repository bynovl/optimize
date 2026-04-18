// optimize-utils/resolve-version.js
import { createRequire } from 'module';
import { readFileSync } from 'fs';
import { dirname, join, resolve } from 'path';

const require = createRequire(import.meta.url);

export function resolveVersion(argv = [], enabledCheck = []) {
  // Always prioritize the CLI/core version
  try {
    return require('@bynovl/optimize-core/package.json').version;
  } catch {}

  // Walk up from the running CLI file (max 3 levels: bin/ → package/ → scoped-org/)
  try {
    let dir = dirname(resolve(process.argv[1]));
    for (let i = 0; i < 3; i++) {
      try {
        const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
        if (pkg.version && pkg.name && pkg.name.startsWith('@bynovl/optimize')) return pkg.version;
      } catch {}
      const parent = resolve(dir, '..');
      if (parent === dir) break;
      dir = parent;
    }
  } catch {}

  // Fallback to local package.json (should rarely be needed)
  try {
    return require('./package.json').version;
  } catch {}
  return null;
}