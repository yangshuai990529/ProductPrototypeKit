/**
 * ProductPrototypeKit - Data Quality & Ajv 2020 Schema Validation Unit Tests
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const MenuRepository = require('../../src/domain/menu/MenuRepository');
const ApplicabilityRepository = require('../../src/domain/menu/ApplicabilityRepository');

const red = '\x1b[31m';
const green = '\x1b[32m';
const reset = '\x1b[0m';

function runDataQualityTests() {
  console.log('=== Running Data Quality & Ajv 2020 Schema Validation Tests ===\n');

  const baseDir = path.join(__dirname, '..', '..');
  const menuRepo = new MenuRepository();

  const tmpDir = path.join(baseDir, 'scratch');
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }

  const schemaPath = path.join(baseDir, 'knowledge', 'applicability', 'schema.json');

  // Helper constructor for temp override testing
  const createTempRepo = (overridesFilePath) => new ApplicabilityRepository({
    schemaPath,
    overridesPath: overridesFilePath
  });

  // 1. Duplicate node_id check (Single record constraint)
  const file1 = path.join(tmpDir, 'dup_node.json');
  fs.writeFileSync(file1, JSON.stringify({
    version: '1.0.0',
    overrides: [
      { node_id: 'overseas_picture_69014b70de', applicable_os: ['google_tv'], applicability_status: 'confirmed', source: 'spec_v1', effective_from: '2026-01-01', owner: 'pm' },
      { node_id: 'overseas_picture_69014b70de', applicable_os: ['fire_tv'], applicability_status: 'confirmed', source: 'spec_v1', effective_from: '2026-01-01', owner: 'pm' }
    ]
  }));
  const res1 = createTempRepo(file1).loadAndValidateOverrides(file1, menuRepo);
  assert.strictEqual(res1.ok, false);
  assert.ok(res1.error.details.some(e => e.includes('Duplicate node_id')));

  // 2. Non-existent overseas menu node check
  const file2 = path.join(tmpDir, 'non_existent_node.json');
  fs.writeFileSync(file2, JSON.stringify({
    version: '1.0.0',
    overrides: [
      { node_id: 'non_existent_node_xyz', applicable_os: ['google_tv'], applicability_status: 'confirmed', source: 'spec_v1', effective_from: '2026-01-01', owner: 'pm' }
    ]
  }));
  const res2 = createTempRepo(file2).loadAndValidateOverrides(file2, menuRepo);
  assert.strictEqual(res2.ok, false);
  assert.ok(res2.error.details.some(e => e.includes('non-existent overseas menu node')));

  // 3. Invalid applicable_os machine enum check
  const file3 = path.join(tmpDir, 'invalid_os.json');
  fs.writeFileSync(file3, JSON.stringify({
    version: '1.0.0',
    overrides: [
      { node_id: 'overseas_picture_69014b70de', applicable_os: ['China TV'], applicability_status: 'confirmed', source: 'spec_v1', effective_from: '2026-01-01', owner: 'pm' }
    ]
  }));
  const res3 = createTempRepo(file3).loadAndValidateOverrides(file3, menuRepo);
  assert.strictEqual(res3.ok, false);
  assert.ok(res3.error.details.some(e => e.includes('Invalid applicable_os') || e.includes('must be equal to one of the allowed values')));

  // 4. effective_to earlier than effective_from check
  const file4 = path.join(tmpDir, 'invalid_dates.json');
  fs.writeFileSync(file4, JSON.stringify({
    version: '1.0.0',
    overrides: [
      { node_id: 'overseas_picture_69014b70de', applicable_os: ['google_tv'], applicability_status: 'confirmed', source: 'spec_v1', effective_from: '2026-06-01', effective_to: '2026-01-01', owner: 'pm' }
    ]
  }));
  const res4 = createTempRepo(file4).loadAndValidateOverrides(file4, menuRepo);
  assert.strictEqual(res4.ok, false);
  assert.ok(res4.error.details.some(e => e.includes('earlier than')));

  // 5. Confirmed missing source or owner check (Ajv 2020 Schema If/Then rule)
  const file5 = path.join(tmpDir, 'missing_owner.json');
  fs.writeFileSync(file5, JSON.stringify({
    version: '1.0.0',
    overrides: [
      { node_id: 'overseas_picture_69014b70de', applicable_os: ['google_tv'], applicability_status: 'confirmed', effective_from: '2026-01-01' }
    ]
  }));
  const res5 = createTempRepo(file5).loadAndValidateOverrides(file5, menuRepo);
  assert.strictEqual(res5.ok, false);
  assert.ok(res5.error.details.some(e => e.includes('must have required property') || e.includes('missing required field')));

  // 6. Prohibit additional unknown properties (additionalProperties: false)
  const file6 = path.join(tmpDir, 'extra_property.json');
  fs.writeFileSync(file6, JSON.stringify({
    version: '1.0.0',
    extra_field: 'forbidden',
    overrides: []
  }));
  const res6 = createTempRepo(file6).loadAndValidateOverrides(file6, menuRepo);
  assert.strictEqual(res6.ok, false);
  assert.ok(res6.error.details.some(e => e.includes('must NOT have additional properties')));

  console.log(`${green}✓ Ajv 2020 Schema & Data Quality Tests Passed (All 6 anomaly types caught)!${reset}`);
}

if (require.main === module) {
  runDataQualityTests();
}

module.exports = { runDataQualityTests };
