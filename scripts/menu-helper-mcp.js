#!/usr/bin/env node

/**
 * ProductPrototypeKit - Zero-Dependency MCP Server
 * Exposes menu search, path retrieval, and diff utilities over JSON-RPC stdio.
 */

const fs = require('fs');
const path = require('path');

// Target database paths
const PATHS = {
  cn: path.join(__dirname, '..', 'knowledge', 'menu-tree', 'CN', 'menu-tree.json'),
  overseas: path.join(__dirname, '..', 'knowledge', 'menu-tree', 'Overseas', 'menu-tree.json')
};

// Logger (logs to stderr to prevent pollution of JSON-RPC on stdout)
function log(msg) {
  process.stderr.write(`[MCP Server] ${msg}\n`);
}

function loadDatabase(region) {
  const filePath = PATHS[region.toLowerCase()];
  if (!filePath) {
    throw new Error(`Unknown region '${region}'. Use 'cn' or 'overseas'.`);
  }
  if (!fs.existsSync(filePath)) {
    throw new Error(`Database file not found at: ${filePath}`);
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    throw new Error(`Error parsing JSON database: ${err.message}`);
  }
}

function searchMenu(region, query, platformFilter) {
  const db = loadDatabase(region);
  const nodes = db.nodes || [];
  const lowerQuery = query.toLowerCase();
  
  const results = [];
  for (const node of nodes) {
    if (platformFilter) {
      const lowerPlatform = platformFilter.toLowerCase();
      const matchPlatform = (node.platforms || []).some(p => p.toLowerCase().includes(lowerPlatform));
      if (!matchPlatform) continue;
    }

    let isMatch = false;
    if (node.node_id && node.node_id.toLowerCase().includes(lowerQuery)) isMatch = true;
    if (node.menu_path_text && node.menu_path_text.toLowerCase().includes(lowerQuery)) isMatch = true;
    if (node.node_info) {
      if (node.node_info.name_cn && node.node_info.name_cn.toLowerCase().includes(lowerQuery)) isMatch = true;
      if (node.node_info.name_en && node.node_info.name_en.toLowerCase().includes(lowerQuery)) isMatch = true;
      if (node.node_info.display_name && node.node_info.display_name.toLowerCase().includes(lowerQuery)) isMatch = true;
    }
    if (node.search_keywords && Array.isArray(node.search_keywords)) {
      if (node.search_keywords.some(k => k.toLowerCase().includes(lowerQuery))) isMatch = true;
    }

    if (isMatch) {
      results.push(node);
    }
  }

  let output = `Found ${results.length} matching nodes in region '${region}':\n\n`;
  results.slice(0, 20).forEach((node, idx) => {
    output += `[${idx + 1}] ID: ${node.node_id}\n`;
    output += `    Path: ${node.menu_path_text}\n`;
    output += `    Module: ${node.module} | Level: ${node.node_level}\n`;
    output += `    Platforms: ${(node.platforms || []).join(', ')}\n`;
    if (node.source_records && node.source_records[0] && node.source_records[0].raw_fields && node.source_records[0].raw_fields["备注"]) {
      output += `    Notes: ${node.source_records[0].raw_fields["备注"].replace(/\n/g, ' ')}\n`;
    }
    output += `--------------------------------------------------\n`;
  });

  if (results.length > 20) {
    output += `... and ${results.length - 20} more results. Refine your query.\n`;
  }
  return output;
}

function getMenuPath(region, nodeId) {
  const db = loadDatabase(region);
  const nodes = db.nodes || [];
  
  const nodeMap = new Map();
  nodes.forEach(n => nodeMap.set(n.node_id, n));

  const targetNode = nodeMap.get(nodeId);
  if (!targetNode) {
    throw new Error(`Node with ID '${nodeId}' not found.`);
  }

  const pathParts = [];
  let current = targetNode;
  while (current) {
    const name = current.node_info ? (current.node_info.display_name || current.node_info.name_cn || current.node_info.name_raw) : current.node_id;
    pathParts.unshift(name);
    current = current.parent_id ? nodeMap.get(current.parent_id) : null;
  }

  return `Node ID: ${nodeId}\nBreadcrumb Path: ${pathParts.join(' > ')}\n\nDetailed Info:\n${JSON.stringify(targetNode.node_info, null, 2)}`;
}

function diffMenu(region, parentNodeId, action, targetName) {
  const db = loadDatabase(region);
  const nodes = db.nodes || [];
  
  const nodeMap = new Map();
  nodes.forEach(n => nodeMap.set(n.node_id, n));

  const parentNode = nodeMap.get(parentNodeId);
  if (!parentNode) {
    throw new Error(`Parent node with ID '${parentNodeId}' not found.`);
  }

  const parentPathParts = [];
  let current = parentNode;
  while (current) {
    const name = current.node_info ? (current.node_info.display_name || current.node_info.name_cn) : current.node_id;
    parentPathParts.unshift(name);
    current = current.parent_id ? nodeMap.get(current.parent_id) : null;
  }

  const siblings = nodes.filter(n => n.parent_id === parentNodeId && n.status === 'active');
  const indent = ' '.repeat(parentPathParts.length * 2);

  let output = `Generated Menu Diff for Region: ${region.toUpperCase()}\n`;
  output += `Parent Path: ${parentPathParts.join(' > ')}\n\nDiff:\n`;
  output += `  ${parentPathParts.join(' > ')}\n`;
  
  siblings.slice(0, 3).forEach(sib => {
    const name = sib.node_info ? (sib.node_info.display_name || sib.node_info.name_cn) : sib.node_id;
    output += `${indent}  ${name}\n`;
  });
  
  if (siblings.length > 3) {
    output += `${indent}  ...\n`;
  }

  if (action === 'add') {
    output += `${indent}+ ${targetName} (新功能)\n`;
  } else if (action === 'delete') {
    output += `${indent}- ${targetName} (已移除)\n`;
  } else if (action === 'modify') {
    output += `${indent}* ${targetName} (已修改)\n`;
  }
  return output;
}

// Stdio buffer parser
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
  try {
    const request = JSON.parse(line);
    const { method, params, id } = request;
    
    if (method === 'initialize') {
      sendResponse(id, {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: { name: 'product-prototype-kit-mcp', version: '1.0.0' }
      });
    } else if (method === 'tools/list') {
      sendResponse(id, {
        tools: [
          {
            name: 'search_menu',
            description: 'Search for menu items in CN or Overseas database by keywords',
            inputSchema: {
              type: 'object',
              properties: {
                region: { type: 'string', enum: ['cn', 'overseas'], description: 'Region of the database (cn/overseas)' },
                query: { type: 'string', description: 'Search keyword' },
                platform: { type: 'string', description: 'Optional platform filter name' }
              },
              required: ['region', 'query']
            }
          },
          {
            name: 'get_menu_path',
            description: 'Get the full breadcrumb path of a node by its ID',
            inputSchema: {
              type: 'object',
              properties: {
                region: { type: 'string', enum: ['cn', 'overseas'], description: 'Region of the database (cn/overseas)' },
                nodeId: { type: 'string', description: 'Unique node ID' }
              },
              required: ['region', 'nodeId']
            }
          },
          {
            name: 'diff_menu',
            description: 'Generate a formatted menu change diff output',
            inputSchema: {
              type: 'object',
              properties: {
                region: { type: 'string', enum: ['cn', 'overseas'], description: 'Region of the database (cn/overseas)' },
                parentNodeId: { type: 'string', description: 'ID of the parent menu node' },
                action: { type: 'string', enum: ['add', 'delete', 'modify'], description: 'Action type' },
                targetName: { type: 'string', description: 'Name of the target menu item to change' }
              },
              required: ['region', 'parentNodeId', 'action', 'targetName']
            }
          }
        ]
      });
    } else if (method === 'tools/call') {
      const { name, arguments: args } = params;
      let textResult = '';
      
      try {
        if (name === 'search_menu') {
          textResult = searchMenu(args.region, args.query, args.platform);
        } else if (name === 'get_menu_path') {
          textResult = getMenuPath(args.region, args.nodeId);
        } else if (name === 'diff_menu') {
          textResult = diffMenu(args.region, args.parentNodeId, args.action, args.targetName);
        } else {
          return sendResponse(id, null, { code: -32601, message: `Tool not found: ${name}` });
        }
        sendResponse(id, {
          content: [{ type: 'text', text: textResult }]
        });
      } catch (err) {
        sendResponse(id, null, { code: -32603, message: err.message });
      }
    } else if (method === 'notifications/initialized') {
      // Initialized notification
    } else {
      if (id !== undefined) {
        sendResponse(id, null, { code: -32601, message: `Method not found: ${method}` });
      }
    }
  } catch (err) {
    log(`Error handling request: ${err.message}`);
  }
}
