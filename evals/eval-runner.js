#!/usr/bin/env node

/**
 * ProductPrototypeKit - Golden Evaluation Runner
 * Validates menu retrieval precision and compliance against 20 golden test cases.
 */

const fs = require('fs');
const path = require('path');
const { searchMenuCore } = require('../scripts/menu-helper.js');

const datasetPath = path.join(__dirname, 'golden-dataset.json');
if (!fs.existsSync(datasetPath)) {
  console.error(`Error: Golden dataset not found at ${datasetPath}`);
  process.exit(1);
}

const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));
const testCases = dataset.testCases || [];

const red = '\x1b[31m';
const green = '\x1b[32m';
const yellow = '\x1b[33m';
const reset = '\x1b[0m';

console.log(`${yellow}=== Running Menu Retrieval Golden Evaluations (${testCases.length} cases) ===${reset}\n`);

let passedCount = 0;
let failedCount = 0;

testCases.forEach(tc => {
  const res = searchMenuCore({ region: tc.region, query: tc.query });

  if (!res.success) {
    console.log(`${red}✗ [${tc.id}] Failed: Query execution error: ${res.error}${reset}`);
    failedCount++;
    return;
  }

  if (res.results.length < tc.expectedMinMatches) {
    console.log(`${red}✗ [${tc.id}] Failed: Expected at least ${tc.expectedMinMatches} matches, got ${res.results.length}${reset}`);
    failedCount++;
    return;
  }

  const topMatch = res.results[0];
  if (topMatch.node_id !== tc.topNodeId) {
    console.log(`${red}✗ [${tc.id}] Failed: Top match node_id mismatch. Expected '${tc.topNodeId}', got '${topMatch.node_id}'${reset}`);
    failedCount++;
    return;
  }

  // Verify default status filtering (all returned nodes must be 'active')
  const nonActiveNodes = res.results.filter(n => (n.status || 'active') !== 'active');
  if (nonActiveNodes.length > 0) {
    console.log(`${red}✗ [${tc.id}] Failed: Returned ${nonActiveNodes.length} non-active nodes when default active filter was active.${reset}`);
    failedCount++;
    return;
  }

  // Verify mandatory fields presence on all top results
  let missingField = false;
  res.results.slice(0, 10).forEach(n => {
    if (!n.node_id || n.parent_id === undefined || !n.menu_path_text || !n.status || !Array.isArray(n.platforms)) {
      missingField = true;
    }
  });

  if (missingField) {
    console.log(`${red}✗ [${tc.id}] Failed: Missing one or more mandatory fields (node_id, parent_id, path, status, platforms).${reset}`);
    failedCount++;
    return;
  }

  console.log(`${green}✓ [${tc.id}] Passed (${tc.region.toUpperCase()} - '${tc.query}'): Matches=${res.results.length}, TopID='${topMatch.node_id}'${reset}`);
  passedCount++;
});

console.log('\n----------------------------------------');
if (failedCount > 0) {
  console.log(`${red}✗ Evaluation Completed: ${passedCount}/${testCases.length} passed. ${failedCount} failed.${reset}`);
  process.exit(1);
} else {
  console.log(`${green}✓ Evaluation Completed: All ${passedCount}/${testCases.length} golden test cases passed 100%!${reset}`);
}
