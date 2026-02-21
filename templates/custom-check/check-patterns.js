// =====================================
// Example Check Patterns
// =====================================

// Regex pattern to match
export const customRegex = /your-regex-pattern/gi; // Replace with your actual regex pattern and flags

// Should return true/false or an object with isValid and message 
export function customValidation(value) {
  if (!value || typeof value !== 'string') return false;
  const lower = value.toLowerCase();
  return lower.includes('noindex') || lower.includes('nofollow');
};