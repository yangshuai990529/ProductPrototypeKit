/**
 * ProductPrototypeKit - Menu Service
 * Domain service providing menu search, path resolution, diff generation, and change validation.
 */

const {
  ok,
  fail,
  NODE_STATUS,
  ALLOWED_ACTIONS,
  parseTargetOs,
  formatTargetOs
} = require('./types');

class MenuService {
  constructor(menuRepo, applicabilityRepo) {
    this.menuRepo = menuRepo;
    this.applicabilityRepo = applicabilityRepo;
  }

  /**
   * Search menu nodes cleanly across regions with node_status and platform applicability rules.
   */
  searchMenu(options = {}) {
    const { region, query, limit = 20, offset = 0 } = options;
    const rawStatus = options.node_status || options.status || options.statusFilter;
    const rawOsInput = options.target_os || options.platform || options.platformFilter;

    if (!region || typeof region !== 'string') {
      return fail('INVALID_REGION', "Missing or invalid required parameter 'region'. Valid options: 'cn', 'overseas'.");
    }

    if (query === undefined || query === null || typeof query !== 'string' || query.trim() === '') {
      return fail('INVALID_QUERY', "Missing or invalid required parameter 'query'. Query must be a non-empty string.");
    }

    const repoRes = this.menuRepo.getNodes(region);
    if (!repoRes.ok) return repoRes;

    const nodes = repoRes.data;
    const lowerQuery = query.toLowerCase().trim();
    const normalizedRegion = region.toLowerCase().trim();

    // Node Status filtering rules: default to ['active'] only
    let allowedNodeStatuses = ['active'];
    if (rawStatus) {
      if (typeof rawStatus === 'string') {
        const parsed = rawStatus.toLowerCase().split(',').map(s => s.trim());
        if (parsed.includes('all')) {
          allowedNodeStatuses = [...NODE_STATUS];
        } else {
          allowedNodeStatuses = parsed;
        }
      } else if (Array.isArray(rawStatus)) {
        allowedNodeStatuses = rawStatus.map(s => String(s).toLowerCase().trim());
      }
    }

    // Machine Enum OS Parsing
    const targetOsEnum = parseTargetOs(rawOsInput);

    // Load Applicability Overrides if overseas
    let overridesMap = new Map();
    if (normalizedRegion === 'overseas' && this.applicabilityRepo) {
      const appRes = this.applicabilityRepo.loadAndValidateOverrides(null, this.menuRepo);
      if (appRes.ok) {
        overridesMap = appRes.data.map;
      }
    }

    let warningMsg = null;
    let platformUndetermined = false;

    if (normalizedRegion === 'overseas' && rawOsInput && typeof rawOsInput === 'string') {
      if (['google_tv', 'fire_tv'].includes(targetOsEnum) || rawOsInput.toLowerCase().includes('google') || rawOsInput.toLowerCase().includes('fire')) {
        platformUndetermined = true;
        warningMsg = `[WARNING] Overseas dataset limitation: All 1,234 nodes currently list ['Android TV', 'Google TV', 'Fire TV']. Querying specifically for '${formatTargetOs(targetOsEnum) || rawOsInput}' matches all overseas nodes and cannot distinguish feature-level differences between Google TV and Fire TV without overrides.`;
      }
    }

    const matchedNodes = [];
    const blockedNodes = [];
    let excludedCount = 0;

    for (const node of nodes) {
      // 1. Node Status Filter
      const currentNodeStatus = (node.node_status || node.status || 'active').toLowerCase();
      if (!allowedNodeStatuses.includes(currentNodeStatus)) {
        continue;
      }

      // 2. Base Platform Filter
      if (rawOsInput && typeof rawOsInput === 'string' && rawOsInput.trim() !== '') {
        const osFormatted = formatTargetOs(targetOsEnum) || rawOsInput;
        const lowerFilter = osFormatted.toLowerCase().trim();
        const matchPlatform = (node.platforms || []).some(p => {
          const lp = p.toLowerCase().trim();
          return lp.includes(lowerFilter) || (targetOsEnum && lp.replace(/[\s\-_]+/g, '').includes(targetOsEnum.replace(/[\s\-_]+/g, '')));
        });
        if (!matchPlatform) continue;
      }

      // 3. Search Matching
      let isMatch = false;
      if (node.node_id && node.node_id.toLowerCase().includes(lowerQuery)) isMatch = true;
      if (node.menu_path_text && node.menu_path_text.toLowerCase().includes(lowerQuery)) isMatch = true;
      if (node.node_info) {
        if (node.node_info.name_cn && node.node_info.name_cn.toLowerCase().includes(lowerQuery)) isMatch = true;
        if (node.node_info.name_en && node.node_info.name_en.toLowerCase().includes(lowerQuery)) isMatch = true;
        if (node.node_info.display_name && node.node_info.display_name.toLowerCase().includes(lowerQuery)) isMatch = true;
      }
      if (node.search_keywords && Array.isArray(node.search_keywords)) {
        if (node.search_keywords.some(k => typeof k === 'string' && k.toLowerCase().includes(lowerQuery))) isMatch = true;
      }

      if (isMatch) {
        const clonedNode = JSON.parse(JSON.stringify(node));
        clonedNode.node_status = currentNodeStatus;

        // 4. Overlay Applicability Evaluation
        if (normalizedRegion === 'overseas' && targetOsEnum) {
          const override = overridesMap.get(clonedNode.node_id);
          if (override) {
            const appStatus = override.applicability_status || override.status;
            const applicableOsList = override.applicable_os || [];
            const isTargetOs = applicableOsList.includes(targetOsEnum);

            if (appStatus === 'conflict') {
              blockedNodes.push({
                node_id: clonedNode.node_id,
                applicability_status: 'conflict',
                reason: `Conflicting platform applicability data detected for node '${clonedNode.node_id}'. Human confirmation required.`
              });
              continue;
            } else if (appStatus === 'confirmed' && !isTargetOs) {
              excludedCount++;
              continue;
            } else {
              clonedNode.applicability = {
                applicability_status: appStatus,
                applicable: isTargetOs,
                applicable_os: applicableOsList,
                source: override.source,
                owner: override.owner
              };
            }
          } else {
            clonedNode.applicability = {
              applicability_status: 'unknown',
              applicable: false,
              message: `No platform applicability override recorded for this node for OS '${formatTargetOs(targetOsEnum)}'.`
            };
          }
        } else {
          clonedNode.applicability = {
            applicability_status: 'confirmed',
            applicable: true,
            message: 'Region default or un-overridden.'
          };
        }

        matchedNodes.push(clonedNode);
      }
    }

    const effectiveLimit = limit > 0 ? limit : 20;
    const paginatedResults = matchedNodes.slice(offset, offset + effectiveLimit);

    return ok({
      region: normalizedRegion,
      query: lowerQuery,
      target_os: targetOsEnum,
      target_os_display: formatTargetOs(targetOsEnum),
      node_status: allowedNodeStatuses,
      totalMatches: matchedNodes.length,
      limit: effectiveLimit,
      offset,
      platform_undetermined: platformUndetermined,
      warning: warningMsg,
      blockedNodes,
      excludedCount,
      results: paginatedResults
    });
  }

  /**
   * Get node by ID.
   */
  getNode(options = {}) {
    const { region, nodeId } = options;
    const nodeRes = this.menuRepo.getNodeById(region, nodeId);
    if (!nodeRes.ok) return nodeRes;

    const node = JSON.parse(JSON.stringify(nodeRes.data));
    node.node_status = node.node_status || node.status || 'active';

    if (region.toLowerCase().trim() === 'overseas' && this.applicabilityRepo) {
      const appRes = this.applicabilityRepo.loadAndValidateOverrides(null, this.menuRepo);
      if (appRes.ok) {
        const override = appRes.data.map.get(node.node_id);
        if (override) {
          node.applicability = {
            applicability_status: override.applicability_status || override.status,
            applicable_os: override.applicable_os,
            source: override.source,
            owner: override.owner
          };
        } else {
          node.applicability = {
            applicability_status: 'unknown',
            message: 'No platform applicability override recorded for this node.'
          };
        }
      }
    } else {
      node.applicability = { applicability_status: 'confirmed', message: 'Region default.' };
    }

    return ok(node);
  }

  /**
   * Get full breadcrumb path of a node.
   */
  getMenuPath(options = {}) {
    const { region, nodeId } = options;
    const nodeRes = this.getNode({ region, nodeId });
    if (!nodeRes.ok) return nodeRes;

    const targetNode = nodeRes.data;
    const nodesRes = this.menuRepo.getNodes(region);
    const nodes = nodesRes.data || [];
    const nodeMap = new Map(nodes.map(n => [n.node_id, n]));

    const pathParts = [];
    let current = targetNode;
    const visited = new Set();
    while (current) {
      if (visited.has(current.node_id)) break;
      visited.add(current.node_id);

      const name = current.node_info ? (current.node_info.display_name || current.node_info.name_cn || current.node_info.name_raw) : current.node_id;
      pathParts.unshift(name);
      current = current.parent_id ? nodeMap.get(current.parent_id) : null;
    }

    return ok({
      nodeId: targetNode.node_id,
      parentId: targetNode.parent_id !== undefined ? targetNode.parent_id : null,
      node_status: targetNode.node_status,
      platforms: targetNode.platforms || [],
      applicability: targetNode.applicability,
      breadcrumbPath: pathParts.join(' > '),
      targetNode
    });
  }

  /**
   * List direct children of a parent node.
   */
  listChildren(options = {}) {
    const { region, parentNodeId } = options;
    return this.menuRepo.getChildrenOf(region, parentNodeId);
  }

  /**
   * Preview menu change diff (Refactored diff engine).
   */
  previewMenuChange(options = {}) {
    const { region, parentNodeId, action, targetName } = options;

    if (!action || typeof action !== 'string' || !ALLOWED_ACTIONS.includes(action.toLowerCase())) {
      return fail('INVALID_ACTION', `Invalid action '${action}'. Valid options: ${ALLOWED_ACTIONS.join(', ')}.`);
    }

    if (!targetName || typeof targetName !== 'string' || targetName.trim() === '') {
      return fail('INVALID_TARGET_NAME', "Missing or invalid parameter 'targetName'.");
    }

    const parentRes = this.getNode({ region, nodeId: parentNodeId });
    if (!parentRes.ok) return parentRes;

    const parentNode = parentRes.data;
    const siblingsRes = this.listChildren({ region, parentNodeId });
    const siblings = (siblingsRes.data || []).map(s => s.node_info ? (s.node_info.display_name || s.node_info.name_cn) : s.node_id);

    return ok({
      region: region.toLowerCase(),
      parentNodeId,
      parentPath: parentNode.menu_path_text || parentNode.node_id,
      siblings,
      action: action.toLowerCase(),
      targetName: targetName.trim()
    });
  }

  /**
   * Diff menu alias for backward compatibility.
   */
  diffMenu(options = {}) {
    return this.previewMenuChange(options);
  }

  /**
   * Validate a proposed menu change before execution.
   */
  validateChange(options = {}) {
    const { region, parentNodeId, action, targetName } = options;
    const rawOsInput = options.target_os || options.platform;
    const targetOsEnum = parseTargetOs(rawOsInput);

    if (!region || !action || !ALLOWED_ACTIONS.includes(String(action).toLowerCase())) {
      return fail('INVALID_CHANGE_PARAMS', 'Missing or invalid parameters for change validation.');
    }

    // 1. Parent node existence check
    const parentRes = this.menuRepo.getNodeById(region, parentNodeId);
    if (!parentRes.ok) {
      return fail('PARENT_NOT_FOUND', `Parent node '${parentNodeId}' does not exist in region '${region}'.`);
    }

    // 2. Platform Applicability & Conflict/Unknown Check on parent
    if (region.toLowerCase().trim() === 'overseas' && targetOsEnum && this.applicabilityRepo) {
      const appRes = this.applicabilityRepo.loadAndValidateOverrides(null, this.menuRepo);
      if (appRes.ok) {
        const override = appRes.data.map.get(parentNodeId);
        if (override) {
          const appStatus = override.applicability_status || override.status;
          if (appStatus === 'conflict') {
            return fail('APPLICABILITY_CONFLICT_BLOCKED', `Change blocked: Parent node '${parentNodeId}' has conflicting platform applicability data. Human confirmation required.`);
          }
          if (appStatus === 'confirmed') {
            const applicableOs = override.applicable_os || [];
            if (!applicableOs.includes(targetOsEnum)) {
              return fail('APPLICABILITY_EXCLUDED', `Change blocked: Parent node '${parentNodeId}' is marked non-applicable for OS '${formatTargetOs(targetOsEnum)}'.`);
            }
          }
        }
      }
    }

    // 3. Duplicate Sibling Name Check (for add action)
    const normAction = action.toLowerCase();
    const childrenRes = this.menuRepo.getChildrenOf(region, parentNodeId);
    const siblings = childrenRes.data || [];

    if (normAction === 'add') {
      const exists = siblings.some(s => {
        const nameCn = s.node_info ? s.node_info.name_cn : '';
        const nameEn = s.node_info ? s.node_info.name_en : '';
        const dispName = s.node_info ? s.node_info.display_name : '';
        return [nameCn, nameEn, dispName].includes(targetName.trim());
      });

      if (exists) {
        return fail('DUPLICATE_SIBLING_NAME', `Sibling node with name '${targetName}' already exists under parent '${parentNodeId}'.`);
      }
    }

    // 4. Target Existence Check (for modify / delete action)
    if (['modify', 'delete'].includes(normAction)) {
      const exists = siblings.some(s => {
        const nameCn = s.node_info ? s.node_info.name_cn : '';
        const nameEn = s.node_info ? s.node_info.name_en : '';
        const dispName = s.node_info ? s.node_info.display_name : '';
        return s.node_id === targetName || [nameCn, nameEn, dispName].includes(targetName.trim());
      });

      if (!exists) {
        return fail('TARGET_NODE_NOT_FOUND', `Target node '${targetName}' to ${normAction} does not exist under parent '${parentNodeId}'.`);
      }
    }

    return ok({
      valid: true,
      region,
      parentNodeId,
      action: normAction,
      targetName: targetName.trim(),
      target_os: targetOsEnum,
      message: 'Proposed change is valid and safe to execute.'
    });
  }
}

module.exports = MenuService;
