/*
Resolve a path relative to a base directory (defaulting to process.cwd()).
If the path is already absolute, it is returned as-is.
*/
import path from 'path';

export function resolvePath(p, baseDir = process.cwd()) {
    if (!p) return p;
    return path.isAbsolute(p) ? p : path.resolve(baseDir, p);
}

export function resolveFilePath(config, file) {
    const resolvedBase = path.resolve(config.outDir);
    const resolvedTemp = path.resolve('_temp');
    const resolvedTarget = path.resolve(file);
    if (
        !(
            resolvedTarget.startsWith(resolvedBase) ||
            resolvedTarget.startsWith(resolvedTemp)
        )
    ) {
        throw new Error(`Unsafe file path detected: ${file}`);
    }
} 