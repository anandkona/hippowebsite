const fs = require('fs');
const path = require('path');

const uiFiles = [
  'app/admin/blogs/page.tsx',
  'app/admin/partners/page.tsx',
  'app/admin/skills/page.tsx',
  'app/admin/products/page.tsx',
  'app/admin/services/page.tsx',
  'app/admin/seo/page.tsx',
  'app/admin/banners/page.tsx',
];

for (const relPath of uiFiles) {
  const file = path.join(__dirname, relPath);
  if (!fs.existsSync(file)) continue;

  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Add userRole state if not present
  if (!content.includes('userRole')) {
    // find where to inject: after const [loading... or const [isSaving...
    content = content.replace(
      /(const \[[a-zA-Z]+, set[a-zA-Z]+\] = useState.*?;\n)/,
      `$1  const [userRole, setUserRole] = useState("viewer");\n`
    );
    
    // find useEffect to inject role fetch
    if (content.includes('useEffect(() => {')) {
      content = content.replace(
        /useEffect\(\(\) => \{/,
        `useEffect(() => {\n    setUserRole(localStorage.getItem("user_role") || "viewer");`
      );
    } else {
      content = content.replace(
        /(const \[[a-zA-Z]+, set[a-zA-Z]+\] = useState.*?;\n)/,
        `$1\n  useEffect(() => {\n    setUserRole(localStorage.getItem("user_role") || "viewer");\n  }, []);\n`
      );
    }
    changed = true;
  }

  // Make sure useEffect is imported
  if (changed && !content.includes('useEffect')) {
    content = content.replace(/import\s+\{\s*useState\s*\}/, 'import { useState, useEffect }');
  }

  // Find all buttons that do saving or deleting and add disabled if userRole === 'viewer'
  // Using a regex to find all <button> and add disabled
  content = content.replace(/<button\s+([^>]*)onClick=\{[^{}]*(handleSave|handleDelete|handleEdit|handleToggleActive|setShowForm)[^{}]*\}([^>]*)>/g, (match, p1, funcName, p2) => {
    // If it already has disabled, modify it
    if (match.includes('disabled={')) {
      return match.replace(/disabled=\{([^}]+)\}/, "disabled={$1 || userRole === 'viewer'}");
    } else {
      return match.replace(/<button/, `<button disabled={userRole === 'viewer'}`);
    }
  });

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Patched ${file}`);
  }
}
