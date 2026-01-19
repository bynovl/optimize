import fs from 'fs';
const pkg = JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url)));
export async function cliBanner() {
  console.log(`
  █████    ███     ███████     ███     ███   ███      
 ▒██████  ▒███   ███▒▒▒▒▒███  ▒███    ▒███  ▒███       
 ▒███▒███ ▒███  ███      ▒███ ▒███    ▒███  ▒███       
 ▒███▒▒███▒███ ▒███      ▒███ ▒███    ▒███  ▒███       
 ▒███ ▒▒██████ ▒███      ▒███ ▒▒███   ███   ▒███       
 ▒███  ▒▒█████ ▒▒███     ███   ▒▒▒█████▒    ▒███      
 ▒███   ▒▒████  ▒▒▒███████▒      ▒▒███      ▒█████████
 ▒▒▒▒    ▒▒▒▒▒    ▒▒▒▒▒▒▒         ▒▒▒       ▒▒▒▒▒▒▒▒▒▒\n
 .think .do .be // optimize - v${pkg.version}
 https://github.com/bynovl/optimize
 built with ❤\n
`);
}