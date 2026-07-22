/**
 * ProductPrototypeKit - Menu Repository
 * Read-only database accessor for menu tree JSON databases.
 * Supports dependency injection of data paths for test isolation.
 */

const fs = require('fs');
const path = require('path');
const { ALLOWED_REGIONS, ok, fail } = require('./types');

class MenuRepository {
  constructor(customPaths = {}) {
    const defaultBaseDir = path.join(__dirname, '..', '..', '..');
    this.dbPaths = {
      cn: customPaths.cn || path.join(defaultBaseDir, 'knowledge', 'menu-tree', 'CN', 'menu-tree.json'),
      overseas: customPaths.overseas || path.join(defaultBaseDir, 'knowledge', 'menu-tree', 'Overseas', 'menu-tree.json')
    };
    this.cache = new Map();
    this.indexMap = new Map();
  }

  loadRegionData(region) {
    if (!region || typeof region !== 'string') {
      return fail('INVALID_REGION', "Missing or invalid parameter 'region'. Valid regions: 'cn', 'overseas'.");
    }

    const normRegion = region.toLowerCase().trim();
    if (!ALLOWED_REGIONS.includes(normRegion)) {
      return fail('UNKNOWN_REGION', `Unknown region '${region}'. Valid options: ${ALLOWED_REGIONS.join(', ')}.`);
    }

    if (this.cache.has(normRegion)) {
      return ok(this.cache.get(normRegion));
    }

    const filePath = this.dbPaths[normRegion];
    if (!fs.existsSync(filePath)) {
      return fail('FILE_NOT_FOUND', `Database file not found at: ${filePath}`);
    }

    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const nodes = data.nodes || [];

      const nodeMap = new Map();
      nodes.forEach(n => {
        if (n && n.node_id) {
          nodeMap.set(n.node_id, n);
        }
      });

      this.cache.set(normRegion, nodes);
      this.indexMap.set(normRegion, nodeMap);

      return ok(nodes);
    } catch (err) {
      return fail('PARSE_ERROR', `Error parsing JSON database for region '${normRegion}': ${err.message}`);
    }
  }

  getNodes(region) {
    return this.loadRegionData(region);
  }

  getNodeById(region, nodeId) {
    const res = this.loadRegionData(region);
    if (!res.ok) return res;

    if (!nodeId || typeof nodeId !== 'string' || nodeId.trim() === '') {
      return fail('INVALID_NODE_ID', "Missing or invalid parameter 'nodeId'.");
    }

    const normRegion = region.toLowerCase().trim();
    const nodeMap = this.indexMap.get(normRegion);
    const targetNode = nodeMap ? nodeMap.get(nodeId.trim()) : null;

    if (!targetNode) {
      return fail('NODE_NOT_FOUND', `Node with ID '${nodeId}' not found in region '${normRegion}'.`);
    }

    return ok(targetNode);
  }

  getChildrenOf(region, parentNodeId) {
    const res = this.loadRegionData(region);
    if (!res.ok) return res;

    const nodes = res.data;
    const normParentId = parentNodeId === null || parentNodeId === undefined ? null : String(parentNodeId).trim();
    const children = nodes.filter(n => n.parent_id === normParentId);

    return ok(children);
  }
}

module.exports = MenuRepository;
