/**
 * ProductPrototypeKit - Global Project Validation Script
 * Verifies files, domain layer, skills, databases, templates, applicability layer, unit tests, and golden evaluations.
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

// 2. Check Workbuddy Slash Command Skills
assertFile('.workbuddy', 'dir');
assertFile('.workbuddy/skills', 'dir');
const skills = [
  'requirement-intent-classifier',
  'product-context-builder',
  'menu-tree-analyzer',
  'product-design-review',
  'prototype-generator',
  'ppk'
];
skills.forEach(skill => {
  assertFile(`.workbuddy/skills/${skill}`, 'dir');
  assertFile(`.workbuddy/skills/${skill}/SKILL.md`, 'file');
});

// 3. Check JSON Menu Database
assertFile('knowledge/menu-tree/CN/menu-tree.json', 'file');
assertFile('knowledge/menu-tree/Overseas/menu-tree.json', 'file');

// 4. Check Overseas Applicability Overlay Files
assertFile('knowledge/applicability', 'dir');
assertFile('knowledge/applicability/schema.json', 'file');
assertFile('knowledge/applicability/overseas-platform-overrides.json', 'file');

// 5. Check Domain Layer Architecture
assertFile('src/domain/menu', 'dir');
assertFile('src/domain/menu/types.js', 'file');
assertFile('src/domain/menu/MenuRepository.js', 'file');
assertFile('src/domain/menu/ApplicabilityRepository.js', 'file');
assertFile('src/domain/menu/MenuService.js', 'file');

// 6. Check Shared UI Templates
assertFile('templates/tv-theme.css', 'file');
assertFile('templates/focus-manager.js', 'file');
assertFile('templates/react-template', 'dir');
assertFile('templates/react-template/src/app/App.tsx', 'file');
assertFile('templates/react-template-overseas', 'dir');
assertFile('templates/react-template-overseas/src/app/App.tsx', 'file');

// 7. Check Test and Eval files
assertFile('tests/run-tests.js', 'file');
assertFile('tests/menu-helper.test.js', 'file');
assertFile('tests/applicability.test.js', 'file');
assertFile('tests/unit/menu-service.test.js', 'file');
assertFile('tests/contract/mcp-stdio.test.js', 'file');
assertFile('tests/parity/cli-mcp-parity.test.js', 'file');
assertFile('tests/data-quality/schema-validation.test.js', 'file');
assertFile('evals/golden-dataset.json', 'file');
assertFile('evals/eval-runner.js', 'file');

// 8. Test CLI Helper Script
console.log(`\n${yellow}=== Testing CLI Helper Script ===${reset}`);
try {
  const result = execSync('node scripts/menu-helper.js search cn "图像"', { encoding: 'utf8' });
  if (result.includes('Found') && result.includes('china_图像')) {
    console.log(`${green}✓ CLI Helper search test passed. Output verified.${reset}`);
  } else {
    throw new Error('Search result output did not contain expected match tags.');
  }
} catch (e) {
  console.log(`${red}✗ CLI Helper search test failed: ${e.message}${reset}`);
  failed = true;
}

// 9. Run Master Unit & Contract Test Suite
console.log(`\n${yellow}=== Running Master Automated Test Suite ===${reset}`);
try {
  const testOutput = execSync('node tests/run-tests.js', { encoding: 'utf8' });
  console.log(testOutput);
  console.log(`${green}✓ Master test suite passed.${reset}`);
} catch (e) {
  console.log(`${red}✗ Master test suite failed:\n${e.stdout || e.message}${reset}`);
  failed = true;
}

// 10. Run Golden Dataset Evaluation
console.log(`\n${yellow}=== Running Golden Dataset Evaluation ===${reset}`);
try {
  const evalOutput = execSync('node evals/eval-runner.js', { encoding: 'utf8' });
  console.log(evalOutput);
  console.log(`${green}✓ Golden dataset evaluation passed.${reset}`);
} catch (e) {
  console.log(`${red}✗ Golden dataset evaluation failed:\n${e.stdout || e.message}${reset}`);
  failed = true;
}

console.log('\n----------------------------------------');
if (failed) {
  console.log(`${red}✗ Diagnostic completed: Global validation failed. Check above errors.${reset}`);
  process.exit(1);
} else {
  console.log(`${green}✓ Diagnostic completed: All checks passed. Phase 2 Architecture Refactoring is 100% operational!${reset}`);
}
