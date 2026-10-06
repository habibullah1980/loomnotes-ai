import fs from 'fs';
import path from 'path';

function cleanDarkClasses(content) {
  // Replace dark: modifiers safely
  return content.replace(/\s*dark:[^\s"'\`\}]+/g, '');
}

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (/\.(tsx|ts|jsx|js|css)$/.test(file)) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = walk('src');
let totalChanges = 0;

files.forEach(f => {
  const original = fs.readFileSync(f, 'utf8');
  if (/dark:/.test(original)) {
    const cleaned = cleanDarkClasses(original);
    fs.writeFileSync(f, cleaned, 'utf8');
    totalChanges++;
    console.log(`Cleaned dark mode from: ${f}`);
  }
});

console.log(`Successfully cleaned ${totalChanges} files.`);
