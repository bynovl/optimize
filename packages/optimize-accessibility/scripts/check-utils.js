// Utility function to determine if an HTML element should be skipped for accessibility checks
export function shouldSkipElement(html) {
  return (
    /display\s*:\s*none/i.test(html) ||
    /visibility\s*:\s*hidden/i.test(html) ||
    /<[^>]+hidden(\s|>|=)/i.test(html) ||
    /<input[^>]*type\s*=\s*['"]hidden['"]/i.test(html) ||
    /aria-hidden\s*=\s*['"]true['"]/i.test(html) ||
    /role\s*=\s*['"](presentation|none)['"]/i.test(html) ||
    /tabindex\s*=\s*['"]-1['"]/i.test(html) ||
    /inert(\s|>|=)/i.test(html)
  );
}