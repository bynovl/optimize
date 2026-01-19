// Function to filter out specific HTML sections from content
// Accepts 'head', 'body', or 'html' as name parameter.

export function filterByHtmlSection(content, name) {
  const tag = name.toLowerCase();
  if (!tag || (tag !== 'body' && tag !== 'head' && tag !== 'html')) {
    return content;
  }
  // Extract specified section
  const pattern = `<${tag}[\\s\\S]*?<\\/${tag}>`;

  const regex = new RegExp(pattern, 'gi');
  const match = content.match(regex);
  return match ? match[0] : '';
}

