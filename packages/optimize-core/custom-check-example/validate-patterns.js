
export const exampleRegex = /<meta\s+name=["']example["']\s+content=["']([^"']+)["']\s*\/?>/gi;
export const exampleRegex2 = /<meta\s+name=["']example2["']\s+content=["']([^"']+)["']\s*\/?>/gi;

// Should return true/false or an object with isValid and message 
export function customValidationFunction(matches, config, file) {
  // Example custom validation logic
}