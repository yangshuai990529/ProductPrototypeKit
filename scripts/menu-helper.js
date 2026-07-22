#!/usr/bin/env node

/**
 * ProductPrototypeKit - Menu Tree Helper Utility (CLI Wrapper)
 * 
 * Thin wrapper around shared domain layer (MenuService).
 */

const path = require('path');
const MenuRepository = require('../src/domain/menu/MenuRepository');
const ApplicabilityRepository = require('../src/domain/menu/ApplicabilityRepository');
const MenuService = require('../src/domain/menu/MenuService');

const menuRepo = new MenuRepository();
const applicabilityRepo = new ApplicabilityRepository();
const menuService = new MenuService(menuRepo, applicabilityRepo);

function printHelp() {
  console.log(`
ProductPrototypeKit - Menu Tree Helper Utility

Commands:
  search <cn|overseas> <query> [--platform=<name>] [--target-os=<os>] [--status=<active|all|inactive|reference_only>]
    Search for menu items matching the query.
    Default status: active (only active nodes returned by default).
    Example: node scripts/menu-helper.js search cn 图像
    Example: node scripts/menu-helper.js search overseas Picture --target-os="Google TV"

  get-path <cn|overseas> <node_id>
    Get the full path of a node by its ID.
    Example: node scripts/menu-helper.js get-path cn china_图像-image_82479eb839

  diff <cn|overseas> <parent_node_id> <action:add|delete|modify> <target_name>
    Generate a formatted diff output for documentation.
    Example: node scripts/menu-helper.js diff cn china_图像-image_82479eb839 add "护眼模式 (Eye Comfort)"
`);
}

function formatNodeOutput(node, idx) {
  const nodeId = node.node_id || 'N/A';
  const parentId = node.parent_id !== undefined ? node.parent_id : 'N/A';
  const menuPath = node.menu_path_text || 'N/A';
  const nodeStatus = node.node_status || node.status || 'active';
  const platforms = Array.isArray(node.platforms) && node.platforms.length > 0
    ? node.platforms.join(', ')
    : 'N/A';
  const moduleName = node.module || 'N/A';
  const level = node.node_level !== undefined ? node.node_level : 'N/A';

  let line = `[${idx + 1}] ID: ${nodeId}\n`;
  line += `    Parent ID: ${parentId}\n`;
  line += `    Path: ${menuPath}\n`;
  line += `    Node Status: ${nodeStatus}\n`;
  line += `    Platforms: ${platforms}\n`;
  line += `    Module: ${moduleName} | Level: ${level}\n`;

  if (node.applicability) {
    const appStatus = node.applicability.applicability_status || node.applicability.status;
    line += `    Applicability Status: ${appStatus} | ${node.applicability.message || node.applicability.reason || ''}\n`;
  }

  if (node.source_records && node.source_records[0] && node.source_records[0].raw_fields && node.source_records[0].raw_fields["备注"]) {
    const note = node.source_records[0].raw_fields["备注"].replace(/\n/g, ' ');
    line += `    Notes: ${note}\n`;
  }
  line += `--------------------------------------------------`;
  return line;
}

// Backward-compatible exported functions for existing test runners
function searchMenuCore(options) {
  const res = menuService.searchMenu(options);
  if (!res.ok) {
    return { success: false, error: res.error.message };
  }
  return {
    success: true,
    ...res.data
  };
}

function getMenuPathCore(region, nodeId) {
  const res = menuService.getMenuPath({ region, nodeId });
  if (!res.ok) {
    return { success: false, error: res.error.message };
  }
  return {
    success: true,
    ...res.data
  };
}

function diffMenuCore(region, parentNodeId, action, targetName) {
  const res = menuService.previewMenuChange({ region, parentNodeId, action, targetName });
  if (!res.ok) {
    return { success: false, error: res.error.message };
  }
  return {
    success: true,
    ...res.data
  };
}

function loadDatabase(region) {
  const res = menuRepo.getNodes(region);
  if (!res.ok) {
    throw new Error(res.error.message);
  }
  return { nodes: res.data };
}

function loadApplicabilityOverrides() {
  const res = applicabilityRepo.loadAndValidateOverrides(null, menuRepo);
  return res.ok ? res.data.map : new Map();
}

function runCli() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    printHelp();
    process.exit(1);
  }

  const command = args[0].toLowerCase();

  if (command === 'search') {
    const region = args[1];
    const query = args[2];
    let platformFilter = null;
    let targetOs = null;
    let statusFilter = null;

    args.forEach(arg => {
      if (arg.startsWith('--platform=')) {
        platformFilter = arg.split('=').slice(1).join('=');
      } else if (arg.startsWith('--target-os=')) {
        targetOs = arg.split('=').slice(1).join('=');
      } else if (arg.startsWith('--status=')) {
        statusFilter = arg.split('=').slice(1).join('=');
      }
    });

    const res = menuService.searchMenu({
      region,
      query,
      platform: platformFilter,
      target_os: targetOs,
      node_status: statusFilter
    });

    if (!res.ok) {
      console.error(`Error: ${res.error.message}`);
      process.exit(1);
    }

    const data = res.data;
    if (data.warning) {
      console.warn(`\n${data.warning}\n`);
    }

    if (data.blockedNodes && data.blockedNodes.length > 0) {
      console.warn(`\n[BLOCKED] ${data.blockedNodes.length} nodes were blocked due to conflict applicability status:`);
      data.blockedNodes.forEach(b => console.warn(`  - Node: ${b.node_id} | Reason: ${b.reason}`));
      console.warn('');
    }

    console.log(`Searching for '${query}' in region '${region}' (Node status filter: ${statusFilter || 'active'})...`);
    console.log(`Found ${data.totalMatches} matching nodes.\n`);

    data.results.forEach((node, idx) => {
      console.log(formatNodeOutput(node, idx));
    });

    if (data.totalMatches > data.results.length) {
      console.log(`... and ${data.totalMatches - data.results.length} more results. Refine your query.`);
    }
  } else if (command === 'get-path') {
    const region = args[1];
    const nodeId = args[2];

    const res = menuService.getMenuPath({ region, nodeId });
    if (!res.ok) {
      console.error(`Error: ${res.error.message}`);
      process.exit(1);
    }

    const data = res.data;
    console.log(`Node ID: ${data.nodeId}`);
    console.log(`Parent ID: ${data.parentId}`);
    console.log(`Node Status: ${data.node_status}`);
    console.log(`Platforms: ${data.platforms.join(', ')}`);
    console.log(`Applicability Status: ${data.applicability.applicability_status}`);
    console.log(`Breadcrumb Path: ${data.breadcrumbPath}`);
    console.log(`Detailed Node Info:`, JSON.stringify(data.targetNode.node_info, null, 2));
  } else if (command === 'diff') {
    const region = args[1];
    const parentId = args[2];
    const action = args[3];
    const targetName = args[4];

    const res = menuService.previewMenuChange({ region, parentNodeId: parentId, action, targetName });
    if (!res.ok) {
      console.error(`Error: ${res.error.message}`);
      process.exit(1);
    }

    const data = res.data;
    console.log(`Generated Menu Diff for Region: ${data.region.toUpperCase()}`);
    console.log(`Parent Path: ${data.parentPath}`);
    console.log(`\nDiff:`);
    console.log(`  ${data.parentPath}`);
    
    const indent = ' '.repeat(data.parentPath.split(' > ').length * 2);
    data.siblings.slice(0, 3).forEach(sibName => {
      console.log(`${indent}  ${sibName}`);
    });
    
    if (data.siblings.length > 3) {
      console.log(`${indent}  ...`);
    }

    if (data.action === 'add') {
      console.log(`${indent}+ ${data.targetName} (新功能)`);
    } else if (data.action === 'delete') {
      console.log(`${indent}- ${data.targetName} (已移除)`);
    } else if (data.action === 'modify') {
      console.log(`${indent}* ${data.targetName} (已修改)`);
    }
  } else {
    printHelp();
    process.exit(1);
  }
}

module.exports = {
  loadDatabase,
  loadApplicabilityOverrides,
  formatNodeOutput,
  searchMenuCore,
  getMenuPathCore,
  diffMenuCore,
  menuService,
  menuRepo,
  applicabilityRepo
};

if (require.main === module) {
  runCli();
}
