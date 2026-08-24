const fs = require('fs');
const path = require('path');
const root = __dirname;
const files = fs.readdirSync(root).filter((file) => file.endsWith('.html'));
const ampRegex = /&(?!([A-Za-z]+|#[0-9]+|#x[0-9A-Fa-f]+);)/g;
for (const file of files) {
  const filePath = path.join(root, file);
  let text = fs.readFileSync(filePath, 'utf8');
  const original = text;

  text = text.replace(/<nav\b([^>]*)>/i, (match, attrs) => {
    if (/aria-label\s*=/.test(attrs)) return match;
    return `<nav${attrs} aria-label="Main navigation">`;
  });

  if (!/\<main\b/i.test(text) && /<\/nav>/i.test(text) && /<footer>/i.test(text)) {
    text = text.replace(/<\/nav>/i, '</nav>\n<main>\n');
    text = text.replace(/<footer>/i, '</main>\n\n<footer>');
  }
  if (/\<main\b/i.test(text) && !/\<\/main\>/i.test(text) && /<footer>/i.test(text)) {
    text = text.replace(/<footer>/i, '</main>\n\n<footer>');
  }

  const parts = text.split(/(<script[\s\S]*?<\/script>)/gi);
  text = parts.map((part) => {
    if (part.toLowerCase().startsWith('<script')) return part;
    return part.replace(ampRegex, '&amp;');
  }).join('');

  text = text.replace(/A &amp; S/g, 'A &amp; S');
  text = text.replace(/A & S/g, 'A &amp; S');

  text = text.replace(/<button([^>]*)onclick=(['"][^>]*>)/gi, (match, attrs, onclick) => {
    if (/\btype\s*=/.test(attrs)) return match;
    return `<button type="button"${attrs}${onclick}`;
  });

  text = text.replace(/<script>[\s\S]*?function\s+sendSMS\([^\)]*\)[\s\S]*?<\/script>\s*/gi, '');
  text = text.replace(/<script>[\s\S]*?function\s+calculatePrice\([^\)]*\)[\s\S]*?<\/script>\s*/gi, '');

  if (text !== original) {
    fs.writeFileSync(filePath, text, 'utf8');
    console.log('patched', file);
  }
}

const scriptPath = path.join(root, 'assets', 'script.js');
const scriptText = "document.addEventListener('DOMContentLoaded', function () {\n" +
  "  const yearEl = document.getElementById('year');\n" +
  "  if (yearEl) {\n" +
  "    yearEl.textContent = new Date().getFullYear();\n" +
  "  }\n" +
  "});\n\n" +
  "function sendSMS() {\n" +
  "  const service = document.getElementById('service')?.value || 'Service request';\n" +
  "  const name = document.getElementById('name')?.value.trim();\n" +
  "  const phone = document.getElementById('phone')?.value.trim();\n" +
  "  const address = document.getElementById('address')?.value.trim();\n" +
  "  const message = document.getElementById('message')?.value.trim() || document.getElementById('details')?.value.trim() || '';\n\n" +
  "  if (!name || !phone || !address) {\n" +
  "    alert('Please fill in your name, phone number, and address.');\n" +
  "    return;\n" +
  "  }\n\n" +
  "  const smsBody = encodeURIComponent(\n" +
  "    'New HVAC Request:\\n' +\n" +
  "    'Service: ' + service + '\\n' +\n" +
  "    'Name: ' + name + '\\n' +\n" +
  "    'Phone: ' + phone + '\\n' +\n" +
  "    'Address: ' + address + '\\n' +\n" +
  "    'Details: ' + message\n" +
  "  );\n\n" +
  "  window.location.href = 'sms:+19735896304?body=' + smsBody;\n" +
  "}\n\n" +
  "function calculatePrice() {\n" +
  "  const price = document.getElementById('serviceType')?.value || '0';\n" +
  "  const priceResult = document.getElementById('priceResult');\n" +
  "  if (priceResult) {\n" +
  "    priceResult.textContent = 'Estimated Cost: $' + price;\n" +
  "  }\n" +
  "}\n";
fs.writeFileSync(scriptPath, scriptText, 'utf8');
console.log('updated assets/script.js');
