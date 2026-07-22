/**
 * ProductPrototypeKit - CLI vs MCP Parity Tests
 */

const assert = require('assert');
const path = require('path');
const MenuRepository = require('../../src/domain/menu/MenuRepository');
const ApplicabilityRepository = require('../../src/domain/menu/ApplicabilityRepository');
const MenuService = require('../../src/domain/menu/MenuService');

const red = '\x1b[31m';
const green = '\x1b[32m';
const reset = '\x1b[0m';

function runCliMcpParityTests() {
  console.log('=== Running CLI vs MCP Parity Tests ===\n');

  const baseDir = path.join(__dirname, '..', '..');
  const menuRepo = new MenuRepository();
  const applicabilityRepo = new ApplicabilityRepository();
  const service = new MenuService(menuRepo, applicabilityRepo);

  const testQueries = [
    { region: 'cn', query: '图像', status: 'active' },
    { region: 'overseas', query: 'Picture', status: 'all', target_os: 'google_tv' },
    { region: 'cn', query: '音效', status: 'active' }
  ];

  testQueries.forEach((q, idx) => {
    const resDirect = service.searchMenu(q);
    const resCliWrapper = require('../../scripts/menu-helper').searchMenuCore({
      region: q.region,
      query: q.query,
      node_status: q.status,
      target_os: q.target_os
    });

    assert.strictEqual(resDirect.ok, true);
    assert.strictEqual(resCliWrapper.success, true);

    const idsDirect = resDirect.data.results.map(n => n.node_id);
    const idsCli = resCliWrapper.results.map(n => n.node_id);

    assert.deepStrictEqual(idsDirect, idsCli, `Parity mismatch on query ${idx + 1}`);
  });

  console.log(`${green}✓ CLI vs MCP Parity Tests Passed 100%!${reset}`);
}

if (require.main === module) {
  runCliMcpParityTests();
}

module.exports = { runCliMcpParityTests };
