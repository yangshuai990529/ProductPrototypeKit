/**
 * ProductPrototypeKit - Global Project Validation Script
 * Verifies files, skills, databases, and templates are fully operational.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const workspaceRoot = path.join(__dirname, '..');
const red = '\x1b[31m';
const green = '\x1b[32m';
const yellow = '\x1b[33m';
const reset = '\x1b[0m';

let failed = false;

function assertFile(relPath, requiredType = 'file') {
  const absPath = path.join(workspaceRoot, relPath);
  if (!fs.existsSync(absPath)) {
    console.log(`${red}✗ Missing ${requiredType}: ${relPath}${reset}`);
    failed = true;
    return false;
  }
  
  const stats = fs.statSync(absPath);
  if (requiredType === 'dir' && !stats.isDirectory()) {
    console.log(`${red}✗ Path should be a directory but isn't: ${relPath}${reset}`);
    failed = true;
    return false;
  }
  if (requiredType === 'file' && !stats.isFile()) {
    console.log(`${red}✗ Path should be a file but isn't: ${relPath}${reset}`);
    failed = true;
    return false;
  }
  
  console.log(`${green}✓ Found ${requiredType}: ${relPath}${reset}`);
  return true;
}

console.log(`${yellow}=== Starting Global Project Validation ===${reset}\n`);

// 1. Check Customization Root & Workspace rules
assertFile('.agents', 'dir');
assertFile('.agents/AGENTS.md', 'file');

// 2. Check Custom Skills in Customization Root
const skills = [
  'requirement-intent-classifier',
  'product-context-builder',
  'menu-tree-analyzer',
  'product-design-review',
  'prototype-generator'
];
skills.forEach(skill => {
  assertFile(`.agents/skills/${skill}`, 'dir');
  assertFile(`.agents/skills/${skill}/SKILL.md`, 'file');
});

// 2.1 Check Workbuddy Slash Command Skills
assertFile('.workbuddy', 'dir');
assertFile('.workbuddy/skills', 'dir');
const workbuddySkills = [...skills, 'ppk'];
workbuddySkills.forEach(skill => {
  assertFile(`.workbuddy/skills/${skill}`, 'dir');
  assertFile(`.workbuddy/skills/${skill}/SKILL.md`, 'file');
});

// 3. Check JSON Menu Database
assertFile('knowledge/menu-tree/CN/menu-tree.json', 'file');
assertFile('knowledge/menu-tree/Overseas/menu-tree.json', 'file');

// 4. Check Shared UI Templates
assertFile('templates/tv-theme.css', 'file');
assertFile('templates/focus-manager.js', 'file');
assertFile('templates/react-template', 'dir');
assertFile('templates/react-template/src/app/App.tsx', 'file');
assertFile('templates/react-template-overseas', 'dir');
assertFile('templates/react-template-overseas/src/app/App.tsx', 'file');

// 5. Test CLI Fuzzy search helper script
console.log(`\n${yellow}=== Testing Fuzzy Search CLI Script ===${reset}`);
try {
  const result = execSync('node scripts/menu-helper.js search cn "图像"', { encoding: 'utf8' });
  if (result.includes('Found') && result.includes('china_图像')) {
    console.log(`${green}✓ CLI Fuzzy search helper test passed. Output verified.${reset}`);
  } else {
    throw new Error('Search result output did not contain expected match tags.');
  }
} catch (e) {
  console.log(`${red}✗ CLI Fuzzy search helper test failed: ${e.message}${reset}`);
  failed = true;
}

console.log('\n----------------------------------------');
if (failed) {
  console.log(`${red}✗ Diagnostic completed: Global validation failed. Check above errors.${reset}`);
  process.exit(1);
} else {
  console.log(`${green}✓ Diagnostic completed: All checks passed. ProductPrototypeKit is fully operational!${reset}`);
}
