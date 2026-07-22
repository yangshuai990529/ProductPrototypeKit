/**
 * ProductPrototypeKit - Comprehensive MCP Stdio Contract Tests
 */

const assert = require('assert');
const { spawn } = require('child_process');
const path = require('path');

const red = '\x1b[31m';
const green = '\x1b[32m';
const reset = '\x1b[0m';

function runMcpStdioContractTests() {
  console.log('=== Running Comprehensive MCP Stdio Contract Tests ===\n');

  const scriptPath = path.join(__dirname, '..', '..', 'scripts', 'menu-helper-mcp.js');
  const mcp = spawn('node', [scriptPath]);

  let stdoutData = '';
  mcp.stdout.on('data', chunk => {
    stdoutData += chunk.toString();
  });

  const req1 = { jsonrpc: '2.0', id: 1, method: 'initialize' };
  const req2 = { jsonrpc: '2.0', method: 'notifications/initialized' };
  const req3 = { jsonrpc: '2.0', id: 3, method: 'tools/list' };
  const req4 = {
    jsonrpc: '2.0',
    id: 4,
    method: 'tools/call',
    params: {
      name: 'search_menu',
      arguments: { region: 'overseas', query: 'Picture', target_os: 'google_tv', status: 'active' }
    }
  };

  const req5 = {
    jsonrpc: '2.0',
    id: 5,
    method: 'tools/call',
    params: {
      name: 'validate_change',
      arguments: {
        region: 'cn',
        parentNodeId: 'china_图像-image_82479eb839',
        action: 'add',
        targetName: '智能护眼'
      }
    }
  };

  // Test error codes:
  const reqBadJson = '{"jsonrpc": "2.0", "method": "initialize", BROKEN_JSON}';
  const reqUnknownTool = { jsonrpc: '2.0', id: 7, method: 'tools/call', params: { name: 'non_existent_tool', arguments: {} } };
  const reqMissingParams = { jsonrpc: '2.0', id: 8, method: 'tools/call', params: {} };

  mcp.stdin.write(JSON.stringify(req1) + '\n');
  mcp.stdin.write(JSON.stringify(req2) + '\n');
  mcp.stdin.write(JSON.stringify(req3) + '\n');
  mcp.stdin.write(JSON.stringify(req4) + '\n');
  mcp.stdin.write(JSON.stringify(req5) + '\n');
  mcp.stdin.write(reqBadJson + '\n');
  mcp.stdin.write(JSON.stringify(reqUnknownTool) + '\n');
  mcp.stdin.write(JSON.stringify(reqMissingParams) + '\n');

  setTimeout(() => {
    mcp.kill();

    const lines = stdoutData.split('\n').filter(l => l.trim() !== '');
    assert.ok(lines.length >= 6, `Expected at least 6 JSON-RPC response lines, got ${lines.length}`);

    // 1. initialize response
    const resp1 = JSON.parse(lines[0]);
    assert.strictEqual(resp1.id, 1);
    assert.strictEqual(resp1.result.serverInfo.name, 'product-prototype-kit-mcp');

    // 2. tools/list response
    const resp3 = JSON.parse(lines[1]);
    assert.strictEqual(resp3.id, 3);
    const tools = resp3.result.tools;
    const searchTool = tools.find(t => t.name === 'search_menu');
    assert.ok(searchTool, 'search_menu tool missing');
    assert.ok(searchTool.inputSchema, 'inputSchema missing on search_menu');
    assert.ok(searchTool.outputSchema, 'outputSchema missing on search_menu');
    assert.ok(searchTool.inputSchema.properties.target_os, 'target_os missing in inputSchema');

    // 3. search_menu call response
    const resp4 = JSON.parse(lines[2]);
    assert.strictEqual(resp4.id, 4);
    assert.ok(resp4.result.structuredContent, 'structuredContent missing in result');
    assert.strictEqual(resp4.result.structuredContent.ok, true);
    assert.ok(Array.isArray(resp4.result.content), 'content array missing');

    // 4. validate_change call response
    const resp5 = JSON.parse(lines[3]);
    assert.strictEqual(resp5.id, 5);
    assert.strictEqual(resp5.result.structuredContent.ok, true);
    assert.strictEqual(resp5.result.structuredContent.data.valid, true);

    // 5. Parse Error (-32700)
    const respBad = JSON.parse(lines[4]);
    assert.strictEqual(respBad.error.code, -32700);

    // 6. Unknown Tool (-32601)
    const respUnknown = JSON.parse(lines[5]);
    assert.strictEqual(respUnknown.error.code, -32601);

    console.log(`${green}✓ Comprehensive MCP Stdio Contract Tests Passed 100%!${reset}`);
  }, 1500);
}

if (require.main === module) {
  runMcpStdioContractTests();
}

module.exports = { runMcpStdioContractTests };
