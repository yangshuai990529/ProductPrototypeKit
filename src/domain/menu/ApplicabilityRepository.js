/**
 * ProductPrototypeKit - Applicability Repository
 * Manages platform applicability overrides using Ajv 2020 Draft schema validation
 * and enforces 6 data quality checks.
 */

const fs = require('fs');
const path = require('path');
const Ajv2020 = require('ajv/dist/2020');
const addFormats = require('ajv-formats');
const { OVERSEAS_OS, ok, fail } = require('./types');

class ApplicabilityRepository {
  constructor(customPaths = {}) {
    const defaultBaseDir = path.join(__dirname, '..', '..', '..');
    this.schemaPath = customPaths.schemaPath || path.join(defaultBaseDir, 'knowledge', 'applicability', 'schema.json');
    this.overridesPath = customPaths.overridesPath || path.join(defaultBaseDir, 'knowledge', 'applicability', 'overseas-platform-overrides.json');

    // Initialize Ajv 2020 Validator
    this.ajv = new Ajv2020({ allErrors: true, strict: false });
    addFormats(this.ajv);
    this.validateFn = null;
  }

  getValidator() {
    if (this.validateFn) return this.validateFn;
    if (fs.existsSync(this.schemaPath)) {
      try {
        const schemaJson = JSON.parse(fs.readFileSync(this.schemaPath, 'utf8'));
        this.validateFn = this.ajv.compile(schemaJson);
      } catch (err) {
        throw new Error(`Failed to compile Ajv 2020 schema from '${this.schemaPath}': ${err.message}`);
      }
    }
    return this.validateFn;
  }

  /**
   * Load and validate applicability overrides.
   */
  loadAndValidateOverrides(customFilePath = null, menuRepo = null) {
    const targetFile = customFilePath || this.overridesPath;
    if (!fs.existsSync(targetFile)) {
      return ok({ overrides: [], map: new Map(), errors: [] });
    }

    let parsedData;
    try {
      parsedData = JSON.parse(fs.readFileSync(targetFile, 'utf8'));
    } catch (err) {
      return fail('SCHEMA_PARSE_ERROR', `Failed to parse JSON file '${targetFile}': ${err.message}`);
    }

    const errors = [];

    // 1. Ajv 2020 Draft Schema Validation
    try {
      const validate = this.getValidator();
      if (validate) {
        const valid = validate(parsedData);
        if (!valid) {
          validate.errors.forEach(e => {
            errors.push(`[Ajv 2020 Schema Error] ${e.instancePath} ${e.message}`);
          });
        }
      }
    } catch (err) {
      errors.push(`Schema validation compilation error: ${err.message}`);
    }

    const list = parsedData.overrides || [];
    const overridesMap = new Map();
    const seenNodeIds = new Set();

    list.forEach((item, index) => {
      const idxStr = `Override [${index}]`;

      // 2. Check duplicate node_id (Single record per node_id constraint)
      if (!item.node_id || typeof item.node_id !== 'string') {
        errors.push(`${idxStr}: Missing or invalid 'node_id'.`);
        return;
      }

      if (seenNodeIds.has(item.node_id)) {
        errors.push(`${idxStr}: Duplicate node_id '${item.node_id}' found in overrides. Each node_id must have exactly one record.`);
      }
      seenNodeIds.add(item.node_id);

      // 3. Check if node_id exists in Overseas MenuRepository
      if (menuRepo) {
        const nodeRes = menuRepo.getNodeById('overseas', item.node_id);
        if (!nodeRes.ok) {
          errors.push(`${idxStr}: Override references non-existent overseas menu node '${item.node_id}'.`);
        }
      }

      // 4. Check applicable_os machine enums
      if (!Array.isArray(item.applicable_os) || item.applicable_os.length === 0) {
        errors.push(`${idxStr}: 'applicable_os' must be a non-empty array for node '${item.node_id}'.`);
      } else {
        item.applicable_os.forEach(os => {
          if (!OVERSEAS_OS.includes(os)) {
            errors.push(`${idxStr}: Invalid applicable_os '${os}' for node '${item.node_id}'. Allowed machine enums: ${OVERSEAS_OS.join(', ')}.`);
          }
        });
      }

      // 5. Check effective_to >= effective_from
      if (item.effective_from && item.effective_to) {
        const fromDate = new Date(item.effective_from);
        const toDate = new Date(item.effective_to);
        if (!isNaN(fromDate.getTime()) && !isNaN(toDate.getTime())) {
          if (toDate < fromDate) {
            errors.push(`${idxStr}: 'effective_to' (${item.effective_to}) is earlier than 'effective_from' (${item.effective_from}) for node '${item.node_id}'.`);
          }
        }
      }

      // 6. Enforce source and owner for applicability_status === "confirmed"
      const appStatus = item.applicability_status || item.status;
      if (appStatus === 'confirmed') {
        if (!item.source || typeof item.source !== 'string' || item.source.trim() === '') {
          errors.push(`${idxStr}: 'confirmed' status record missing required field 'source' for node '${item.node_id}'.`);
        }
        if (!item.owner || typeof item.owner !== 'string' || item.owner.trim() === '') {
          errors.push(`${idxStr}: 'confirmed' status record missing required field 'owner' for node '${item.node_id}'.`);
        }
      }

      overridesMap.set(item.node_id, {
        ...item,
        applicability_status: appStatus || 'unknown'
      });
    });

    if (errors.length > 0) {
      return fail('DATA_QUALITY_ERROR', 'Platform applicability overrides validation failed.', errors);
    }

    return ok({
      version: parsedData.version || '1.0.0',
      overrides: list,
      map: overridesMap,
      errors: []
    });
  }
}

module.exports = ApplicabilityRepository;
