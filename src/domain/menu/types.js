/**
 * ProductPrototypeKit - Domain Types & Result Helper
 */

const NODE_STATUS = ['active', 'reference_only', 'inactive'];
const APPLICABILITY_STATUS = ['confirmed', 'inferred', 'unknown', 'conflict'];
const OVERSEAS_OS = ['google_tv', 'fire_tv', 'android_tv_generic'];
const ALLOWED_REGIONS = ['cn', 'overseas'];
const ALLOWED_ACTIONS = ['add', 'delete', 'modify'];

function ok(data) {
  return {
    ok: true,
    data
  };
}

function fail(code, message, details = null) {
  return {
    ok: false,
    error: {
      code,
      message,
      details
    }
  };
}

/**
 * Parse human OS input string into machine enum.
 */
function parseTargetOs(input) {
  if (!input || typeof input !== 'string') return null;
  const s = input.toLowerCase().trim().replace(/[\s\-_]+/g, '');
  if (s.includes('google')) return 'google_tv';
  if (s.includes('fire')) return 'fire_tv';
  if (s.includes('android')) return 'android_tv_generic';
  if (s.includes('china')) return 'china_tv';
  return null;
}

/**
 * Format machine enum into human presentation string.
 */
function formatTargetOs(machineEnum) {
  if (machineEnum === 'google_tv') return 'Google TV';
  if (machineEnum === 'fire_tv') return 'Fire TV';
  if (machineEnum === 'android_tv_generic') return 'Android TV';
  if (machineEnum === 'china_tv') return 'China TV';
  return machineEnum || 'N/A';
}

module.exports = {
  NODE_STATUS,
  APPLICABILITY_STATUS,
  OVERSEAS_OS,
  ALLOWED_REGIONS,
  ALLOWED_ACTIONS,
  ok,
  fail,
  parseTargetOs,
  formatTargetOs
};
