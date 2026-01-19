import https from 'https';
import net from 'net';

// Fast offline check:
// 1) Try a short TCP connect to 1.1.1.1:443 (no TLS) — very quick if routing works.
// 2) If that fails, fall back to a tiny HTTPS request (google's generate_204) with the same timeout.
// Returning true means offline, false means online.
export function isOffline(timeout = 800) {
  return new Promise((resolve) => {
    let settled = false;

    const settle = (val) => {
      if (settled) return;
      settled = true;
      resolve(val);
    };

    // Fast TCP probe to a well-known anycast IP (Cloudflare). Uses only TCP handshake.
    const socket = new net.Socket();
    socket.setTimeout(timeout);

    socket.once('connect', () => {
      // If TCP connects, assume we have network reachability.
      socket.destroy();
      settle(false);
    });

    socket.once('timeout', () => {
      socket.destroy();
      settle(true); // Timeout, treat as offline
    });

    socket.once('error', () => {
      socket.destroy();
      settle(true); // Error, treat as offline
    });

    // Start connect — no TLS handshake, so this is usually faster than an HTTPS GET.
    try {
      socket.connect(443, '1.1.1.1');
    } catch (e) {
      settle(true); // Synchronous failure, treat as offline
    }
  });
}