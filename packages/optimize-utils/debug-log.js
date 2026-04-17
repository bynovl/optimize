// Print only if not in API mode
export function debug(msg) {
    if (process.env.DEBUG === 'true') console.log('[DEBUG]', msg);
}
// Print only if not in API mode (pass config as second argument)
export function consoleLog(msg, config) { 
    if (process.env.DEBUG === 'true' || !config.apiMode) {
        console.log(msg);
    }
}
export function debugPath(moduleName, filePath) {
    const name = moduleName || 'PATH';
    debug(`[CHECK ${name}]: ${filePath}`);
}