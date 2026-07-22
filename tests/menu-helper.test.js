/**
 * ProductPrototypeKit - Unit Tests for Menu Helper & MCP Engine
 */

const assert = require('assert');
const {
  searchMenuCore,
  getMenuPathCore,
  diffMenuCore,
  formatNodeOutput
} = require('../scripts/menu-helper.js');

const red = '\x1b[31m';
const green = '\x1b[32m';
const reset = '\x1b[0m';

function runTest(name, fn) {
  try {
    fn();
    console.log(`${green}✓ Passed: ${name}${reset}`);
    return true;
  } catch (err) {
    console.log(`${red}✗ Failed: ${name}\n  Error: ${err.message}${reset}`);
    return false;
  }
}

let passed = 0;
let total = 0;

function runAllTests() {
  console.log('=== Running ProductPrototypeKit Unit Tests ===\n');

  total++;
  if (runTest('1. Default search returns ONLY active nodes', () => {
    const res = searchMenuCore({ region: 'overseas', query: 'Picture' });
    assert.strictEqual(res.success, true);
    assert.ok(res.results.length > 0);
    const nonActive = res.results.filter(n => (n.node_status || n.status || 'active') !== 'active');
    assert.strictEqual(nonActive.length, 0, 'Found non-active nodes in default search');
  })) passed++;

  total++;
  if (runTest('2. Status parameter allows querying reference_only and inactive nodes', () => {
    const resActive = searchMenuCore({ region: 'overseas', query: 'Picture', statusFilter: 'active' });
    const resAll = searchMenuCore({ region: 'overseas', query: 'Picture', statusFilter: 'all' });
    assert.strictEqual(resActive.success, true);
    assert.strictEqual(resAll.success, true);
    assert.ok(resAll.results.length >= resActive.results.length, 'Status all should include active and non-active nodes');
    
    const hasRefOnly = resAll.results.some(n => (n.node_status || n.status) === 'reference_only');
    assert.strictEqual(hasRefOnly, true, 'Status all query should return reference_only nodes');
  })) passed++;

  total++;
  if (runTest('3. Node output format contains mandatory fields', () => {
    const res = searchMenuCore({ region: 'cn', query: '图像' });
    assert.strictEqual(res.success, true);
    const node = res.results[0];

    assert.ok(node.node_id, 'node_id missing');
    assert.notStrictEqual(node.parent_id, undefined, 'parent_id missing');
    assert.ok(node.menu_path_text, 'menu_path_text missing');
    assert.ok(node.node_status || node.status, 'status missing');
    assert.ok(Array.isArray(node.platforms), 'platforms array missing');

    const textOutput = formatNodeOutput(node, 0);
    assert.ok(textOutput.includes('ID: ' + node.node_id));
    assert.ok(textOutput.includes('Parent ID: '));
    assert.ok(textOutput.includes('Path: '));
    assert.ok(textOutput.includes('Node Status: '));
    assert.ok(textOutput.includes('Platforms: '));
  })) passed++;

  total++;
  if (runTest('4. Invalid or missing parameters do NOT throw JS engine exceptions', () => {
    const res1 = searchMenuCore({ region: 'cn' });
    assert.strictEqual(res1.success, false);
    assert.ok(res1.error.includes('query'));

    const res2 = searchMenuCore({ region: 'invalid_region', query: 'test' });
    assert.strictEqual(res2.success, false);
    assert.ok(res2.error.includes('region'));

    const res3 = getMenuPathCore('cn', null);
    assert.strictEqual(res3.success, false);
    assert.ok(res3.error.includes('nodeId'));

    const res4 = diffMenuCore('cn', 'china_图像_3618ac3b52', 'invalid_action', 'Target');
    assert.strictEqual(res4.success, false);
    assert.ok(res4.error.includes('action'));
  })) passed++;

  total++;
  if (runTest('5. Overseas platform distinction triggers explicit warning and block notice', () => {
    const resGoogle = searchMenuCore({ region: 'overseas', query: 'Picture', platformFilter: 'Google TV' });
    assert.strictEqual(resGoogle.success, true);
    assert.ok(resGoogle.warning, 'Warning missing for Overseas Google TV platform query');
    assert.ok(resGoogle.warning.includes('Overseas dataset limitation'), 'Warning content incorrect');

    const resFire = searchMenuCore({ region: 'overseas', query: 'Picture', platformFilter: 'Fire TV' });
    assert.strictEqual(resFire.success, true);
    assert.ok(resFire.warning, 'Warning missing for Overseas Fire TV platform query');
  })) passed++;

  total++;
  if (runTest('6. getMenuPathCore constructs correct breadcrumb path', () => {
    const res = getMenuPathCore('cn', 'china_图像_3618ac3b52');
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.nodeId, 'china_图像_3618ac3b52');
    assert.ok(res.breadcrumbPath.includes('图像'));
  })) passed++;

  total++;
  if (runTest('7. diffMenuCore calculates diff correctly for valid parent', () => {
    const res = diffMenuCore('cn', 'china_图像_3618ac3b52', 'add', '新功能选项');
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.action, 'add');
    assert.strictEqual(res.targetName, '新功能选项');
  })) passed++;

  console.log('\n----------------------------------------');
  if (passed !== total) {
    console.log(`${red}✗ Test Suite Failed: ${passed}/${total} passed.${reset}`);
    process.exit(1);
  } else {
    console.log(`${green}✓ Test Suite Passed: ${passed}/${total} unit tests passed!${reset}`);
  }
}

if (require.main === module) {
  runAllTests();
}

module.exports = { runAllTests };
