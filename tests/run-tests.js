#!/usr/bin/env node

/**
 * ProductPrototypeKit - Master Test Runner
 * Runs all domain, contract, parity, data quality, and applicability test suites.
 */

const { runAllTests } = require('./menu-helper.test.js');
const { runApplicabilityTests } = require('./applicability.test.js');
const { runMenuServiceUnitTests } = require('./unit/menu-service.test.js');
const { runMcpStdioContractTests } = require('./contract/mcp-stdio.test.js');
const { runCliMcpParityTests } = require('./parity/cli-mcp-parity.test.js');
const { runDataQualityTests } = require('./data-quality/schema-validation.test.js');

async function runMasterSuite() {
  console.log('=== Running ProductPrototypeKit Master Test Suite ===\n');

  runAllTests();
  console.log('\n');

  runApplicabilityTests();
  console.log('\n');

  runMenuServiceUnitTests();
  console.log('\n');

  runCliMcpParityTests();
  console.log('\n');

  runDataQualityTests();
  console.log('\n');

  runMcpStdioContractTests();
}

if (require.main === module) {
  runMasterSuite().catch(err => {
    console.error('Test runner error:', err);
    process.exit(1);
  });
}

module.exports = { runMasterSuite };
