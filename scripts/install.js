import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import endpoint from './endpoint.js';
import getScriptTemplate from './script-template.js';
import getInstallerUnix from './installer.js';
import getInstallerWin from './installer-win.js';

const CURRENT_ENDPOINT = endpoint.endpoint;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3040;
const TOKEN_PATH = process.env.TOKEN_PATH || path.join(__dirname, 'secret', 'token.txt');
const LOG_PATH = process.env.LOG_PATH || path.join(__dirname, 'access.log');
const LIVE_URL = process.env.LIVE_URL
const SSL_CERT_PATH = process.env.SSL_CERT_PATH;
const SSL_KEY_PATH = process.env.SSL_KEY_PATH;
const USE_HTTPS = SSL_CERT_PATH && SSL_KEY_PATH;

// ------------------------------------------------------------
// Helper: return the numeric value of the INSTALL query param
// ------------------------------------------------------------
function getInstallMode(searchParams) {
    // Look for a query‑param named “install” (case‑insensitive)
    // and return its value as a string (e.g. "1", "2", …) or undefined.
    for (const [key, value] of searchParams) {
        if (key.toUpperCase() === 'INSTALL') return value;
    }
}
function getParam(searchParams, paramName) {
    // Look for a query‑param named “tokenOnly” (case‑insensitive)
    // and return its value as a string (e.g. "true", "false", …) or undefined.
    for (const [key, value] of searchParams) {
        if (key.toUpperCase() === paramName) return value;
    }
}
// Security headers function
const securityHeaders = {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Referrer-Policy': 'no-referrer',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
};

if (USE_HTTPS) {
    securityHeaders['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload';
}

// Request handler - same for both HTTP and HTTPS
const requestHandler = (req, res) => {
    const urlObj = new URL(req.url, 'http://localhost');
    const requestPath = urlObj.pathname;
    const userAgent = req.headers['user-agent'] || '';
    const isBrowser = /mozilla|chrome|safari|firefox|edge/i.test(userAgent);

    // Get the install mode from query params or environment variable
    const searchParams = urlObj.searchParams;
    const installMode = getParam(searchParams, 'INSTALL');
    const tokenOnly = getParam(searchParams, 'TOKENONLY');

    const useInstallerUnix = installMode === '1';
    const useInstallerWin = installMode === '2';
    const useTokenOnly = tokenOnly === '1' ? true : false;

    // Determine package name based on checkParam (before calling template)
    let packageName = '@bynovl/optimize';
    const checkParam = searchParams.get('check')?.toLowerCase();
    const packageNames = 'accessibility,hierarchy,meta,sources,media,links,schema,open-graph';
    if (checkParam && packageNames.includes(checkParam)) {
        packageName = `@bynovl/optimize-${checkParam}`;
    }

    if (requestPath === CURRENT_ENDPOINT && req.method === 'GET') {
        // Log access (uses server's local timezone)
        const now = new Date();
        const timestamp = now.toLocaleString('en-US', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
        });
        const clientIP = req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const requestType = isBrowser ? 'browser' : 'curl/script';
        const logEntry = `[${timestamp}] Token accessed | Path: ${requestPath} | IP: ${clientIP} | Type: ${requestType} | UA: ${userAgent}\n`;

        console.log(logEntry.trim());
        fs.appendFile(LOG_PATH, logEntry, (err) => {
            if (err) console.error('Failed to write to log file:', err.message);
        });

        fs.readFile(TOKEN_PATH, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, {
                    'Content-Type': 'text/plain',
                    ...securityHeaders
                });
                res.end('Token unavailable');
                return;
            }
            const token = data.trim();
            const npmrcContent = isBrowser ? '# [your-token-will-be-embedded]' : token;

            // Determine which script template to use based on query params
            let script;
            if (useInstallerUnix) {
                script = getInstallerUnix(npmrcContent, packageName, useTokenOnly);
            } else if (useInstallerWin) {
                script = getInstallerWin(npmrcContent, packageName, useTokenOnly);
            }

            const filename = useInstallerUnix ? 'setup-optimize-project.sh' : useInstallerWin ? 'setup-optimize-project.ps1' : 'setup-optimize-token.sh';

            res.writeHead(200, {
                'Content-Type': 'text/plain; charset=utf-8',
                'Content-Disposition': (useInstallerUnix || useInstallerWin)
                    ? `inline; filename="${filename}"`
                    : 'inline; filename="setup-optimize-token.sh"',
                ...securityHeaders
            });

            res.end(script);
        });
    } else {
        res.writeHead(404, {
            'Content-Type': 'text/plain',
            ...securityHeaders
        });
        res.end('Not found');
    }
};

// Create server (HTTPS or HTTP)
let server;
let protocol = 'HTTP';

if (USE_HTTPS) {
    try {
        const options = {
            cert: fs.readFileSync(SSL_CERT_PATH),
            key: fs.readFileSync(SSL_KEY_PATH)
        };
        server = https.createServer(options, requestHandler);
        protocol = 'HTTPS';
    } catch (err) {
        console.error('❌ Error loading SSL certificates:', err.message);
        console.error('Falling back to HTTP...');
        server = http.createServer(requestHandler);
    }
} else {
    server = http.createServer(requestHandler);
}

server.listen(PORT, () => {
    console.log(`✅ Token server running on ${protocol}`);
    console.log(`📍 Current endpoint: ${CURRENT_ENDPOINT}`);
    if (USE_HTTPS) {
        console.log(`🔐 SSL enabled - use https://${LIVE_URL}${CURRENT_ENDPOINT}`);
    } else {
        console.log(`⚠️  Running without SSL. For production, set SSL_CERT_PATH and SSL_KEY_PATH`);
    }
});

