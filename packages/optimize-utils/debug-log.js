export function debug(msg) {
    if (process.env.DEBUG === 'true') console.log('[DEBUG]', msg);
}
export function debugPath(moduleName, filePath) {
    const name = moduleName || 'PATH';
    debug(`[CHECK ${name}]: ${filePath}`);
}