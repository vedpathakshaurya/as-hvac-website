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
  text = parts
    .map((part) => {
      if (part.toLowerCase().startsWith('<script')) return part;
      return part.replace(ampRegex, '&amp;');
    })
    .join('');

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
const scriptText = `document.addEventListener('DOMContentLoaded', function () {
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
});

function sendSMS() {
  const service = document.getElementById('service')?.value || 'Service request';
  const name = document.getElementById('name')?.value.trim();
  const phone = document.getElementById('phone')?.value.trim();
  const address = document.getElementById('address')?.value.trim();
  const message = document.getElementById('message')?.value.trim() || document.getElementById('details')?.value.trim() || '';

  if (!name || !phone || !address) {
    alert('Please fill in your name, phone number, and address.');
    return;
  }

  const smsBody = encodeURIComponent(
    'New HVAC Request:\n' +
    'Service: ' + service + '\\n' +
    'Name: ' + name + '\\n' +
    'Phone: ' + phone + '\\n' +
    'Address: ' + address + '\\n' +
    'Details: ' + message
  );

  window.location.href = 'sms:+19735896304?body=' + smsBody;
}

function calculatePrice() {
  const price = document.getElementById('serviceType')?.value || '0';
  const priceResult = document.getElementById('priceResult');
  if (priceResult) {
    priceResult.textContent = 'Estimated Cost: $' + price;
  }
}
`;
fs.writeFileSync(scriptPath, scriptText, 'utf8');
console.log('updated assets/script.js');
