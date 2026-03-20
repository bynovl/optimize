// ansi-colors.js
export const colors = {
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  white: (text) => `\x1b[97m${text}\x1b[0m`,
  gray: (text) => `\x1b[90m${text}\x1b[0m`,
  brightGreen: (text) => `\x1b[92m${text}\x1b[0m`,
  brightRed: (text) => `\x1b[91m${text}\x1b[0m`,
  boldWhite: (text) => `\x1b[1;97m${text}\x1b[0m`,
  boldGray: (text) => `\x1b[1;90m${text}\x1b[0m`,
  boldGreen: (text) => `\x1b[1;32m${text}\x1b[0m`,
  bgRedWhiteBold: (text) => `\x1b[1;97;41m${text}\x1b[0m`,
};