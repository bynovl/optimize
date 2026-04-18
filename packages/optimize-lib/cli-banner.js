import { resolveVersion } from '@bynovl/optimize-utils/resolve-version.js';
export function cliBanner() {   
  const version = resolveVersion();
  console.log(`
  █████    ███     ███████     ███     ███   ███      
 ▒██████  ▒███   ███▒▒▒▒▒███  ▒███    ▒███  ▒███       
 ▒███▒███ ▒███  ███      ▒███ ▒███    ▒███  ▒███       
 ▒███▒▒███▒███ ▒███      ▒███ ▒███    ▒███  ▒███       
 ▒███ ▒▒██████ ▒███      ▒███ ▒▒███   ███   ▒███       
 ▒███  ▒▒█████ ▒▒███     ███   ▒▒▒█████▒    ▒███      
 ▒███   ▒▒████  ▒▒▒███████▒      ▒▒███      ▒█████████
 ▒▒▒▒    ▒▒▒▒▒    ▒▒▒▒▒▒▒         ▒▒▒       ▒▒▒▒▒▒▒▒▒▒\n
 .think .do .be // optimize - v${version}
 https://github.com/bynovl/optimize
 built with ❤\n
`);
}