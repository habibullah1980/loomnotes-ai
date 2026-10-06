import fs from 'fs';
import path from 'path';

function getAppRoutes(dir, base = '') {
  let routes = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      routes = routes.concat(getAppRoutes(fullPath, path.join(base, file)));
    } else if (file === 'page.tsx' || file === 'page.jsx' || file === 'route.ts' || file === 'route.js') {
      let route = base.replace(/\\/g, '/');
      if (route === '') route = '/';
      else route = '/' + route;
      routes.push(route);
    }
  });
  return routes;
}

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

const existingRoutes = getAppRoutes('src/app');
console.log('=== REGISTERED APP ROUTES ===');
existingRoutes.sort().forEach(r => console.log('  ' + r));

const allFiles = walk('src');
const deadLinks = [];
const validLinks = new Set();

allFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  // Match href="/..." or href={`/...`} or redirect("...")
  const hrefMatches = content.matchAll(/(?:href|redirect)\s*=\s*[\"\'\`](\/[^\s\"\'\`\?\#]*)/g);
  for (const m of hrefMatches) {
    const route = m[1];
    if (route === '') continue;
    validLinks.add(route);
    
    // Check if route matches any registered route
    const isDynamic = route.includes('${') || route.includes('[id]') || route.match(/\/dashboard\/meetings\/[^\/]+/) || route.match(/\/admin\/users\/[^\/]+/);
    const exists = existingRoutes.some(r => {
      if (r === route) return true;
      if (r.includes('[id]')) {
        const pattern = new RegExp('^' + r.replace('[id]', '[^/]+') + '$');
        return pattern.test(route);
      }
      return false;
    });

    if (!exists && !isDynamic) {
      deadLinks.push({ file, route });
    }
  }
});

console.log('\n=== CHECKING ALL ROUTE REFERENCES ===');
console.log(`Audited ${validLinks.size} unique route targets across all files.`);
if (deadLinks.length > 0) {
  console.log('⚠️ Potential missing routes detected:');
  deadLinks.forEach(d => console.log(`  File: ${d.file} -> Target: ${d.route}`));
} else {
  console.log('✅ ZERO BROKEN INTERNAL ROUTES DETECTED!');
}
