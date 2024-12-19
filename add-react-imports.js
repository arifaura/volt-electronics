const fs = require('fs');
const path = require('path');

const directories = [
  './src/pages',
  './src/components',
  './src/context',
  './src/pages/admin'
];

function addReactImport(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('import React') && !content.includes('from \'react\'')) {
    const newContent = `import React from 'react';\n${content}`;
    fs.writeFileSync(filePath, newContent);
    console.log(`Added React import to ${filePath}`);
  }
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.jsx')) {
      addReactImport(filePath);
    }
  });
}

directories.forEach(dir => {
  if (fs.existsSync(dir)) {
    processDirectory(dir);
  }
}); 