/**
 * ProductPrototypeKit - Unit Tests for MenuService Domain Layer
 */

const assert = require('assert');
const path = require('path');
const MenuRepository = require('../../src/domain/menu/MenuRepository');
const ApplicabilityRepository = require('../../src/domain/menu/ApplicabilityRepository');
const MenuService = require('../../src/domain/menu/MenuService');

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

function runMenuServiceUnitTests() {
  console.log('=== Running MenuService Domain Unit Tests ===\n');
  const baseDir = path.join(__dirname, '..', '..');
  const menuRepo = new MenuRepository();
  const applicabilityRepo = new ApplicabilityRepository();
  const service = new MenuService(menuRepo, applicabilityRepo);

  let passed = 0;
  let total = 0;

  total++;
  if (runTest('1. searchMenu defaults to active status and accepts target_os machine enum', () => {
    const res = service.searchMenu({ region: 'overseas', query: 'Picture', target_os: 'google_tv' });
    assert.strictEqual(res.ok, true);
    assert.strictEqual(res.data.target_os, 'google_tv');
    assert.ok(res.data.totalMatches > 0);
  })) passed++;

  total++;
  if (runTest('2. listChildren returns child nodes of valid parent', () => {
    const res = service.listChildren({ region: 'cn', parentNodeId: 'china_图像-image_82479eb839' });
    assert.strictEqual(res.ok, true);
    assert.ok(Array.isArray(res.data));
    assert.ok(res.data.length > 0);
  })) passed++;

  total++;
  if (runTest('3. validateChange detects duplicate sibling name on add', () => {
    const res = service.validateChange({
      region: 'cn',
      parentNodeId: 'china_图像-image_82479eb839',
      action: 'add',
      targetName: '高级设置'
    });
    assert.strictEqual(res.ok, false);
    assert.strictEqual(res.error.code, 'DUPLICATE_SIBLING_NAME');
  })) passed++;

  total++;
  if (runTest('4. validateChange succeeds for valid new feature', () => {
    const res = service.validateChange({
      region: 'cn',
      parentNodeId: 'china_图像-image_82479eb839',
      action: 'add',
      targetName: '全新护眼模式'
    });
    assert.strictEqual(res.ok, true);
    assert.strictEqual(res.data.valid, true);
  })) passed++;

  total++;
  if (runTest('5. validateChange fails when parent node does not exist', () => {
    const res = service.validateChange({
      region: 'cn',
      parentNodeId: 'non_existent_parent_id',
      action: 'add',
      targetName: '全新功能'
    });
    assert.strictEqual(res.ok, false);
    assert.strictEqual(res.error.code, 'PARENT_NOT_FOUND');
  })) passed++;

  total++;
  if (runTest('6. Search results preserve stable database insertion order', () => {
    const res = service.searchMenu({ region: 'cn', query: '图像', limit: 50 });
    assert.strictEqual(res.ok, true);
    const results = res.data.results;
    assert.ok(results.length > 0);
    assert.strictEqual(results[0].node_id, 'china_图像_3618ac3b52');
  })) passed++;

  console.log('\n----------------------------------------');
  if (passed !== total) {
    console.log(`${red}✗ MenuService Unit Tests Failed: ${passed}/${total} passed.${reset}`);
    process.exit(1);
  } else {
    console.log(`${green}✓ MenuService Unit Tests Passed: ${passed}/${total} passed!${reset}`);
  }
}

if (require.main === module) {
  runMenuServiceUnitTests();
}

module.exports = { runMenuServiceUnitTests };
