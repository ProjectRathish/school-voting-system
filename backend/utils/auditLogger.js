const db = require('../config/db');

/**
 * Logs an admin action to the audit_logs table.
 * Safe to call fire-and-forget — errors are swallowed to never block the main request.
 *
 * @param {Object} params
 * @param {number} params.school_id
 * @param {number} params.user_id
 * @param {string} params.user_name
 * @param {string} params.role
 * @param {string} params.action      - e.g. 'CREATE_ELECTION', 'APPROVE_CANDIDATE'
 * @param {string} params.entity_type - e.g. 'Election', 'Candidate', 'Voter'
 * @param {string} params.entity_name - human-readable name of the affected entity
 * @param {Object} [params.details]   - optional extra JSON details
 */
const logAction = async ({ school_id, user_id, user_name, role, action, entity_type, entity_name, details = null }) => {
  try {
    await db.execute(
      `INSERT INTO audit_logs 
        (school_id, user_id, user_name, role, action, entity_type, entity_name, details)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        school_id || null,
        user_id || null,
        user_name || 'Unknown',
        role || 'UNKNOWN',
        action,
        entity_type || null,
        entity_name || null,
        details ? JSON.stringify(details) : null
      ]
    );
  } catch (err) {
    // Never let logging failures crash the main request
    console.error('[AuditLogger] Failed to write audit log:', err.message);
  }
};

module.exports = { logAction };
