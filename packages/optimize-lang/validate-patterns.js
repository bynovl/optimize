export const metaLang = /<meta\s+name=["']language["']\s+content=["']([^"']+)["']\s*\/?>/gi;

// Should return true/false or an object with isValid and message 
export function customValidationFunction(matches, config, file) {
  // Example custom validation logic
}