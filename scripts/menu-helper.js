#!/usr/bin/env node

/**
 * ProductPrototypeKit - Menu Tree Helper Utility
 * 
 * Usage:
 *   node scripts/menu-helper.js search <cn|overseas> <query> [--platform=<name>]
 *   node scripts/menu-helper.js get-path <cn|overseas> <node_id>
 *   node scripts/menu-helper.js diff <cn|overseas> <original_node_id> <action:add|delete|modify> <target_name>
 */

const fs = require('fs');
const path = require('path');

// Target paths
const PATHS = {
  cn: path.join(__dirname, '..', 'knowledge', 'menu-tree', 'CN', 'menu-tree.json'),
  overseas: path.join(__dirname, '..', 'knowledge', 'menu-tree', 'Overseas', 'menu-tree.json')
};

function printHelp() {
  console.log(`
ProductPrototypeKit - Menu Tree Helper Utility

Commands:
  search <cn|overseas> <query> [--platform=<name>]
    Search for menu items matching the query.
    Example: node scripts/menu-helper.js search cn 图像

  get-path <cn|overseas> <node_id>
    Get the full path of a node by its ID.
    Example: node scripts/menu-helper.js get-path cn china_图像-image_82479eb839

  diff <cn|overseas> <parent_node_id> <action:add|delete|modify> <target_name>
    Generate a formatted diff output for documentation.
    Example: node scripts/menu-helper.js diff cn china_图像-image_82479eb839 add "护眼模式 (Eye Comfort)"
`);
}

function loadDatabase(region) {
  const filePath = PATHS[region.toLowerCase()];
  if (!filePath) {
    console.error(`Error: Unknown region '${region}'. Use 'cn' or 'overseas'.`);
    process.exit(1);
  }
  if (!fs.existsSync(filePath)) {
    console.error(`Error: Database file not found at: ${filePath}`);
    console.error(`Please make sure you have unzipped and copied the JSON files.`);
    process.exit(1);
  }
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return data;
  } catch (err) {
    console.error(`Error parsing JSON database: ${err.message}`);
    process.exit(1);
  }
}

function handleSearch(region, query, platformFilter) {
  const db = loadDatabase(region);
  const nodes = db.nodes || [];
  const lowerQuery = query.toLowerCase();

  console.log(`Searching for '${query}' in region '${region}'...`);
  
  const results = [];
  for (const node of nodes) {
    // Platform filtering
    if (platformFilter) {
      const lowerPlatform = platformFilter.toLowerCase();
      const matchPlatform = (node.platforms || []).some(p => p.toLowerCase().includes(lowerPlatform));
      if (!matchPlatform) continue;
    }

    let isMatch = false;
    
    // Check fields
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

  console.log(`Found ${results.length} matching nodes.\n`);

  // Show top 20
  const limit = 20;
  const displayResults = results.slice(0, limit);
  
  displayResults.forEach((node, idx) => {
    console.log(`[${idx + 1}] ID: ${node.node_id}`);
    console.log(`    Path: ${node.menu_path_text}`);
    console.log(`    Module: ${node.module} | Level: ${node.node_level}`);
    console.log(`    Platforms: ${(node.platforms || []).join(', ')}`);
    if (node.source_records && node.source_records[0] && node.source_records[0].raw_fields && node.source_records[0].raw_fields["备注"]) {
      console.log(`    Notes: ${node.source_records[0].raw_fields["备注"].replace(/\n/g, ' ')}`);
    }
    console.log(`--------------------------------------------------`);
  });

  if (results.length > limit) {
    console.log(`... and ${results.length - limit} more results. Refine your query.`);
  }
}

function handleGetPath(region, nodeId) {
  const db = loadDatabase(region);
  const nodes = db.nodes || [];
  
  const nodeMap = new Map();
  nodes.forEach(n => nodeMap.set(n.node_id, n));

  const targetNode = nodeMap.get(nodeId);
  if (!targetNode) {
    console.error(`Error: Node with ID '${nodeId}' not found.`);
    process.exit(1);
  }

  // Construct path recursively
  const pathParts = [];
  let current = targetNode;
  while (current) {
    const name = current.node_info ? (current.node_info.display_name || current.node_info.name_cn || current.node_info.name_raw) : current.node_id;
    pathParts.unshift(name);
    if (current.parent_id) {
      current = nodeMap.get(current.parent_id);
    } else {
      current = null;
    }
  }

  console.log(`Node ID: ${nodeId}`);
  console.log(`Breadcrumb Path: ${pathParts.join(' > ')}`);
  console.log(`Detailed Node Info:`, JSON.stringify(targetNode.node_info, null, 2));
}

function handleDiff(region, parentNodeId, action, targetName) {
  const db = loadDatabase(region);
  const nodes = db.nodes || [];
  
  const nodeMap = new Map();
  nodes.forEach(n => nodeMap.set(n.node_id, n));

  const parentNode = nodeMap.get(parentNodeId);
  if (!parentNode) {
    console.error(`Error: Parent node with ID '${parentNodeId}' not found.`);
    process.exit(1);
  }

  // Construct path of parent
  const parentPathParts = [];
  let current = parentNode;
  while (current) {
    const name = current.node_info ? (current.node_info.display_name || current.node_info.name_cn) : current.node_id;
    parentPathParts.unshift(name);
    current = current.parent_id ? nodeMap.get(current.parent_id) : null;
  }

  // Find siblings to print context
  const siblings = nodes.filter(n => n.parent_id === parentNodeId && n.status === 'active');

  console.log(`Generated Menu Diff for Region: ${region.toUpperCase()}`);
  console.log(`Parent Path: ${parentPathParts.join(' > ')}`);
  console.log(`\nDiff:`);
  console.log(`  ${parentPathParts.join(' > ')}`);
  
  const indent = ' '.repeat((parentPathParts.length) * 2);
  
  // Show a few existing children as context
  siblings.slice(0, 3).forEach(sib => {
    const name = sib.node_info ? (sib.node_info.display_name || sib.node_info.name_cn) : sib.node_id;
    console.log(`${indent}  ${name}`);
  });
  
  if (siblings.length > 3) {
    console.log(`${indent}  ...`);
  }

  // Show the diff action
  if (action === 'add') {
    console.log(`${indent}+ ${targetName} (新功能)`);
  } else if (action === 'delete') {
    console.log(`${indent}- ${targetName} (已移除)`);
  } else if (action === 'modify') {
    console.log(`${indent}* ${targetName} (已修改)`);
  }
}

// CLI entrypoint
const args = process.argv.slice(2);
if (args.length < 2) {
  printHelp();
  process.exit(1);
}

const command = args[0].toLowerCase();

if (command === 'search') {
  const region = args[1];
  const query = args[2];
  if (!query) {
    console.error("Error: Missing query string.");
    process.exit(1);
  }
  
  let platformFilter = null;
  args.forEach(arg => {
    if (arg.startsWith('--platform=')) {
      platformFilter = arg.split('=')[1];
    }
  });

  handleSearch(region, query, platformFilter);
} else if (command === 'get-path') {
  const region = args[1];
  const nodeId = args[2];
  if (!nodeId) {
    console.error("Error: Missing node ID.");
    process.exit(1);
  }
  handleGetPath(region, nodeId);
} else if (command === 'diff') {
  const region = args[1];
  const parentId = args[2];
  const action = args[3];
  const targetName = args[4];

  if (!parentId || !action || !targetName) {
    console.error("Error: Missing arguments for diff. Syntax: diff <region> <parent_node_id> <action> <target_name>");
    process.exit(1);
  }

  handleDiff(region, parentId, action, targetName);
} else {
  printHelp();
  process.exit(1);
}
