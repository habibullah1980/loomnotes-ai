import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) results = results.concat(walk(fullPath));
    else if (/\.(tsx|ts|jsx|js)$/.test(file)) results.push(fullPath);
  });
  return results;
}

walk('src').forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const buttonTags = content.matchAll(/<button([\s\S]*?)>/g);
  for (const b of buttonTags) {
    const attrs = b[1];
    const hasClick = attrs.includes('onClick=');
    const hasForm = attrs.includes('type="submit"') || attrs.includes("type='submit'");
    if (!hasClick && !hasForm && !attrs.includes('action=') && !attrs.includes('asChild') && !attrs.includes('title=') && !attrs.includes('aria-label') && !attrs.includes('type="button"')) {
      console.log('File:', file, 'Tag:', b[0]);
    }
  }
});
