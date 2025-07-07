const fs = require('fs');
const path = require('path');

// Files with empty imports to fix
const filesToFix = [
  'src/pages/Settings.js',
  'src/pages/Dashboard.js',
  'src/pages/Login.js',
  'src/pages/Projects.js',
  'src/pages/Deployment.js',
  'src/pages/Users.js',
  'src/pages/Infrastructure.js',
];

function fixEmptyImports(content) {
  // Remove empty import statements
  let newContent = content;

  // Remove empty imports like "import {} from '../utils/';"
  newContent = newContent.replace(
    /import\s*{\s*}\s*from\s*['"][^'"]*['"]\s*;?\s*/g,
    '',
  );

  // Remove incomplete imports like "import from '../utils/';"
  newContent = newContent.replace(
    /import\s+from\s*['"][^'"]*['"]\s*;?\s*/g,
    '',
  );

  // Clean up multiple empty lines
  newContent = newContent.replace(/\n\s*\n\s*\n/g, '\n\n');

  return newContent;
}

// Main execution
console.log('🚀 Fixing empty imports...');

for (const file of filesToFix) {
  const filePath = path.join(process.cwd(), file);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${file}`);
    continue;
  }

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    content = fixEmptyImports(content);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${file}`);
  } catch (error) {
    console.error(`❌ Error fixing ${file}:`, error.message);
  }
}

console.log('🎉 Empty imports fixed!');
