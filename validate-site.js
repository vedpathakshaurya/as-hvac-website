const fs = require('fs');
const path = require('path');
const root = process.cwd();
const files = fs.readdirSync(root).filter((f) => f.endsWith('.html'));
let any = false;
for (const file of files) {
  const text = fs.readFileSync(path.join(root, file), 'utf8');
  const issues = [];
  if (!/<nav\b/i.test(text)) issues.push('missing <nav>');
  if (!/aria-label=["']Main navigation["']/i.test(text)) issues.push('missing nav aria-label');
  if (!/<main\b/i.test(text)) issues.push('missing <main>');
  if (!/<\/main>/i.test(text)) issues.push('missing </main>');
  if (/<button[^>]*type="button"[^>]*"[\w\s]*onclick=/i.test(text)) issues.push('malformed button syntax');
  if (/onclick="sendSMS"/i.test(text) && !/function\s+sendSMS\(/i.test(text) && !/assets\/script\.js/.test(text)) issues.push('sendSMS onclick with no shared JS loaded');
  if (/onclick="calculatePrice"/i.test(text) && !/function\s+calculatePrice\(/i.test(text) && !/assets\/script\.js/.test(text)) issues.push('calculatePrice onclick with no shared JS loaded');
  if (/\s&\s/.test(text)) issues.push('possible unescaped &');
  if (/\b<video\b/i.test(text) && !/controls/i.test(text)) issues.push('video missing controls');
  if (issues.length) {
    any = true;
    console.log(`${file}: ${issues.join('; ')}`);
    const lines = text.split(/\r?\n/);
    lines.forEach((line, index) => {
      if (line.match(/onclick=|type="button"|<main|<nav|aria-label|\s&\s|<script|sendSMS|calculatePrice/)) {
        console.log(` ${index+1}: ${line.trim()}`);
      }
    });
    console.log('---');
  }
}
if (!any) console.log('no issues found');
