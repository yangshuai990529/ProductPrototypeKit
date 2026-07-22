#!/usr/bin/env node

/**
 * ProductPrototypeKit - Zero-Dependency MCP Server (v2.0)
 * Exposes menu domain services over JSON-RPC stdio with structuredContent & outputSchema.
 */

const path = require('path');
const MenuRepository = require('../src/domain/menu/MenuRepository');
const ApplicabilityRepository = require('../src/domain/menu/ApplicabilityRepository');
const MenuService = require('../src/domain/menu/MenuService');

const menuRepo = new MenuRepository();
const applicabilityRepo = new ApplicabilityRepository();
const menuService = new MenuService(menuRepo, applicabilityRepo);

function log(msg) {
  process.stderr.write(`[MCP Server] ${msg}\n`);
}

function formatSummaryText(toolName, result) {
  if (!result.ok) {
    return `[ERROR ${result.error.code}] ${result.error.message}`;
  }

  const data = result.data;
  if (toolName === 'search_menu') {
    let text = `Found ${data.totalMatches} matching nodes in region '${data.region}' (Node status filter: ${data.node_status}):\n\n`;
    data.results.forEach((n, idx) => {
      const appStatus = n.applicability ? n.applicability.applicability_status : 'unknown';
      text += `[${idx + 1}] ID: ${n.node_id}\n    Parent ID: ${n.parent_id}\n    Path: ${n.menu_path_text}\n    Node Status: ${n.node_status}\n    Applicability Status: ${appStatus}\n    Platforms: ${(n.platforms || []).join(', ')}\n--------------------------------------------------\n`;
    });
    return text;
  }

  if (toolName === 'get_menu_path') {
    return `Node ID: ${data.nodeId}\nParent ID: ${data.parentId}\nNode Status: ${data.node_status}\nPlatforms: ${data.platforms.join(', ')}\nBreadcrumb Path: ${data.breadcrumbPath}`;
  }

  if (toolName === 'preview_menu_change' || toolName === 'diff_menu') {
    return `Generated Menu Diff for Region: ${data.region.toUpperCase()}\nParent Path: ${data.parentPath}\nAction: ${data.action} -> ${data.targetName}`;
  }

  if (toolName === 'validate_change') {
    return `Validation Result: ${data.valid ? 'VALID' : 'INVALID'} - ${data.message}`;
  }

  return JSON.stringify(data, null, 2);
}

function sendResponse(id, result, error) {
  const response = { jsonrpc: '2.0', id };
  if (error) {
    response.error = error;
  } else {
    response.result = result;
  }
  process.stdout.write(JSON.stringify(response) + '\n');
}

function handleRequest(line) {
  let request;
  try {
    request = JSON.parse(line);
  } catch (err) {
    // JSON-RPC -32700 Parse error
    return sendResponse(null, null, { code: -32700, message: `Parse error: Invalid JSON payload. (${err.message})` });
  }

  const { method, params, id } = request || {};

  if (method === 'initialize') {
    sendResponse(id, {
      protocolVersion: '2024-11-05',
      capabilities: { tools: {} },
      serverInfo: { name: 'product-prototype-kit-mcp', version: '2.0.0' }
    });
  } else if (method === 'notifications/initialized') {
    // Notification, no response required
  } else if (method === 'tools/list') {
    sendResponse(id, {
      tools: [
        {
          name: 'search_menu',
          description: 'Search for menu items in CN or Overseas database by keywords',
          inputSchema: {
            type: 'object',
            properties: {
              region: { type: 'string', enum: ['cn', 'overseas'], description: 'Region of database (cn/overseas)' },
              query: { type: 'string', description: 'Search keyword' },
              target_os: { type: 'string', description: 'Target OS (google_tv, fire_tv, android_tv_generic, china_tv)' },
              platform: { type: 'string', description: 'Alias for target_os' },
              node_status: { type: 'string', description: 'Node status filter (\'active\' [default], \'all\', \'inactive\', \'reference_only\')' },
              status: { type: 'string', description: 'Alias for node_status' },
              limit: { type: 'number', description: 'Maximum results to return (default 20)' },
              offset: { type: 'number', description: 'Pagination offset (default 0)' }
            },
            required: ['region', 'query']
          },
          outputSchema: {
            type: 'object',
            properties: {
              ok: { type: 'boolean' },
              data: { type: 'object' },
              error: { type: 'object' }
            }
          }
        },
        {
          name: 'get_menu_path',
          description: 'Get the full breadcrumb path of a node by its ID',
          inputSchema: {
            type: 'object',
            properties: {
              region: { type: 'string', enum: ['cn', 'overseas'] },
              nodeId: { type: 'string' }
            },
            required: ['region', 'nodeId']
          },
          outputSchema: {
            type: 'object',
            properties: {
              ok: { type: 'boolean' },
              data: { type: 'object' },
              error: { type: 'object' }
            }
          }
        },
        {
          name: 'preview_menu_change',
          description: 'Preview menu change diff output for documentation',
          inputSchema: {
            type: 'object',
            properties: {
              region: { type: 'string', enum: ['cn', 'overseas'] },
              parentNodeId: { type: 'string' },
              action: { type: 'string', enum: ['add', 'delete', 'modify'] },
              targetName: { type: 'string' }
            },
            required: ['region', 'parentNodeId', 'action', 'targetName']
          },
          outputSchema: {
            type: 'object',
            properties: {
              ok: { type: 'boolean' },
              data: { type: 'object' },
              error: { type: 'object' }
            }
          }
        },
        {
          name: 'diff_menu',
          description: 'Alias for preview_menu_change (backward compatibility)',
          inputSchema: {
            type: 'object',
            properties: {
              region: { type: 'string', enum: ['cn', 'overseas'] },
              parentNodeId: { type: 'string' },
              action: { type: 'string', enum: ['add', 'delete', 'modify'] },
              targetName: { type: 'string' }
            },
            required: ['region', 'parentNodeId', 'action', 'targetName']
          },
          outputSchema: {
            type: 'object',
            properties: {
              ok: { type: 'boolean' },
              data: { type: 'object' },
              error: { type: 'object' }
            }
          }
        },
        {
          name: 'list_children',
          description: 'List direct children of a parent menu node',
          inputSchema: {
            type: 'object',
            properties: {
              region: { type: 'string', enum: ['cn', 'overseas'] },
              parentNodeId: { type: 'string' }
            },
            required: ['region', 'parentNodeId']
          },
          outputSchema: {
            type: 'object',
            properties: {
              ok: { type: 'boolean' },
              data: { type: 'array' }
            }
          }
        },
        {
          name: 'get_node',
          description: 'Fetch node details by ID',
          inputSchema: {
            type: 'object',
            properties: {
              region: { type: 'string', enum: ['cn', 'overseas'] },
              nodeId: { type: 'string' }
            },
            required: ['region', 'nodeId']
          },
          outputSchema: {
            type: 'object',
            properties: {
              ok: { type: 'boolean' },
              data: { type: 'object' }
            }
          }
        },
        {
          name: 'validate_change',
          description: 'Validate a proposed menu modification for safety and platform applicability',
          inputSchema: {
            type: 'object',
            properties: {
              region: { type: 'string', enum: ['cn', 'overseas'] },
              parentNodeId: { type: 'string' },
              action: { type: 'string', enum: ['add', 'delete', 'modify'] },
              targetName: { type: 'string' },
              target_os: { type: 'string' }
            },
            required: ['region', 'parentNodeId', 'action', 'targetName']
          },
          outputSchema: {
            type: 'object',
            properties: {
              ok: { type: 'boolean' },
              data: { type: 'object' }
            }
          }
        }
      ]
    });
  } else if (method === 'tools/call') {
    const { name, arguments: toolArgs } = params || {};
    const safeArgs = toolArgs || {};

    if (!name || typeof name !== 'string') {
      return sendResponse(id, null, { code: -32602, message: 'Invalid params: Missing tool name.' });
    }

    let domainRes;
    if (name === 'search_menu') {
      domainRes = menuService.searchMenu({
        region: safeArgs.region,
        query: safeArgs.query,
        target_os: safeArgs.target_os || safeArgs.platform,
        node_status: safeArgs.node_status || safeArgs.status,
        limit: safeArgs.limit,
        offset: safeArgs.offset
      });
    } else if (name === 'get_menu_path') {
      domainRes = menuService.getMenuPath({ region: safeArgs.region, nodeId: safeArgs.nodeId });
    } else if (name === 'preview_menu_change' || name === 'diff_menu') {
      domainRes = menuService.previewMenuChange({
        region: safeArgs.region,
        parentNodeId: safeArgs.parentNodeId,
        action: safeArgs.action,
        targetName: safeArgs.targetName
      });
    } else if (name === 'list_children') {
      domainRes = menuService.listChildren({ region: safeArgs.region, parentNodeId: safeArgs.parentNodeId });
    } else if (name === 'get_node') {
      domainRes = menuService.getNode({ region: safeArgs.region, nodeId: safeArgs.nodeId });
    } else if (name === 'validate_change') {
      domainRes = menuService.validateChange({
        region: safeArgs.region,
        parentNodeId: safeArgs.parentNodeId,
        action: safeArgs.action,
        targetName: safeArgs.targetName,
        target_os: safeArgs.target_os || safeArgs.platform
      });
    } else {
      return sendResponse(id, null, { code: -32601, message: `Tool not found: ${name}` });
    }

    const summaryText = formatSummaryText(name, domainRes);

    sendResponse(id, {
      structuredContent: domainRes,
      content: [
        {
          type: 'text',
          text: summaryText
        }
      ]
    });
  } else {
    if (id !== undefined) {
      sendResponse(id, null, { code: -32601, message: `Method not found: ${method}` });
    }
  }
}

let buffer = '';
process.stdin.on('data', chunk => {
  buffer += chunk.toString();
  let lineEndIndex;
  while ((lineEndIndex = buffer.indexOf('\n')) !== -1) {
    const line = buffer.slice(0, lineEndIndex).trim();
    buffer = buffer.slice(lineEndIndex + 1);
    if (line) {
      handleRequest(line);
    }
  }
});
