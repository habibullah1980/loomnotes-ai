import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (/\.(tsx|ts|jsx|js)$/.test(file)) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = walk('src');
const allHrefs = new Map();

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const matches = content.matchAll(/href=[\"\'\`](\S+?)[\"\'\`]/g);
  for (const match of matches) {
    const href = match[1];
    if (!allHrefs.has(href)) {
      allHrefs.set(href, []);
    }
    allHrefs.get(href).push(f);
  }
});

console.log('=== ALL DETECTED HREFS IN APP ===');
for (const [href, fileList] of allHrefs.entries()) {
  console.log(`Href: ${href} (found in ${fileList.length} files: ${fileList[0]})`);
}
