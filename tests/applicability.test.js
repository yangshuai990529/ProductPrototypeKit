/**
 * ProductPrototypeKit - Unit Tests for Platform Applicability Overlay Layer
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const ApplicabilityRepository = require('../src/domain/menu/ApplicabilityRepository');
const MenuRepository = require('../src/domain/menu/MenuRepository');

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

function runApplicabilityTests() {
  console.log('=== Running Platform Applicability Overlay Unit Tests ===\n');

  const baseDir = path.join(__dirname, '..');
  const menuRepo = new MenuRepository();

  const tmpDir = path.join(baseDir, 'scratch');
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }

  const schemaPath = path.join(baseDir, 'knowledge', 'applicability', 'schema.json');
  const mockFile = path.join(tmpDir, 'valid_mock_overrides.json');

  // Real overseas node IDs: overseas_picture_69014b70de, overseas_sound_52ade5dabc, overseas_accessibility_966c727834
  fs.writeFileSync(mockFile, JSON.stringify({
    version: '1.0.0',
    overrides: [
      {
        node_id: 'overseas_picture_69014b70de',
        applicable_os: ['google_tv'],
        applicability_status: 'confirmed',
        source: 'spec_v1',
        effective_from: '2026-01-01',
        owner: 'pm_team'
      },
      {
        node_id: 'overseas_sound_52ade5dabc',
        applicable_os: ['fire_tv'],
        applicability_status: 'confirmed',
        source: 'spec_v1',
        effective_from: '2026-01-01',
        owner: 'pm_team'
      },
      {
        node_id: 'overseas_accessibility_966c727834',
        applicable_os: ['google_tv', 'fire_tv'],
        applicability_status: 'conflict',
        source_candidates: ['spec_a', 'spec_b'],
        effective_from: '2026-01-01'
      }
    ]
  }));

  const appRepo = new ApplicabilityRepository({ schemaPath, overridesPath: mockFile });
  const loadRes = appRepo.loadAndValidateOverrides(mockFile, menuRepo);

  let passed = 0;
  let total = 0;

  total++;
  if (runTest('1. loadAndValidateOverrides loads valid mock file cleanly', () => {
    assert.strictEqual(loadRes.ok, true, `Validation errors: ${JSON.stringify(loadRes.error)}`);
    assert.strictEqual(loadRes.data.map.size, 3);
  })) passed++;

  total++;
  if (runTest('2. confirmed & applicable record resolved correctly', () => {
    const item = loadRes.data.map.get('overseas_picture_69014b70de');
    assert.strictEqual(item.applicability_status, 'confirmed');
    assert.deepStrictEqual(item.applicable_os, ['google_tv']);
  })) passed++;

  total++;
  if (runTest('3. conflict record resolved correctly', () => {
    const item = loadRes.data.map.get('overseas_accessibility_966c727834');
    assert.strictEqual(item.applicability_status, 'conflict');
    assert.ok(Array.isArray(item.source_candidates));
  })) passed++;

  console.log('\n----------------------------------------');
  if (passed !== total) {
    console.log(`${red}✗ Applicability Tests Failed: ${passed}/${total} passed.${reset}`);
    process.exit(1);
  } else {
    console.log(`${green}✓ Applicability Tests Passed: ${passed}/${total} passed!${reset}`);
  }
}

if (require.main === module) {
  runApplicabilityTests();
}

module.exports = { runApplicabilityTests };
