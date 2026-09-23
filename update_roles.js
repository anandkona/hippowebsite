const fs = require('fs');
const path = require('path');

const contentRoutes = ['blogs', 'partners', 'skills', 'products', 'services'];
const adminRoutes = ['seo', 'banners'];

function updateFile(filePath, checkCode) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Add forbiddenResponse to imports if not there
  if (content.includes('verifyAuth') && !content.includes('forbiddenResponse')) {
    content = content.replace(/verifyAuth,?\s*unauthorizedResponse/, 'verifyAuth, unauthorizedResponse, forbiddenResponse');
  }

  // Add the check to POST
  content = content.replace(
    /const user = await verifyAuth\(request\);\s*if \(!user\) return unauthorizedResponse\(\);/g,
    `const user = await verifyAuth(request);\n  if (!user) return unauthorizedResponse();\n  ${checkCode}`
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${filePath}`);
}

for (const route of contentRoutes) {
  const p = path.join(__dirname, 'app/api/admin', route, 'route.ts');
  if (fs.existsSync(p)) {
    updateFile(p, `if (user.role === 'viewer') return forbiddenResponse();`);
  }
}

for (const route of adminRoutes) {
  const p = path.join(__dirname, 'app/api/admin', route, 'route.ts');
  if (fs.existsSync(p)) {
    updateFile(p, `if (user.role !== 'admin') return forbiddenResponse();`);
  }
}
