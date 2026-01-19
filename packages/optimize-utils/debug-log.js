export function debug(msg) {
    if (process.env.DEBUG === 'true') console.log('[DEBUG]', msg);
}