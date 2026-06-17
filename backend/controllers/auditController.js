const db = require('../config/db');

/**
 * GET /api/audit
 * Returns paginated audit log entries for the authenticated school admin.
 * Query params: page, limit, action, start_date, end_date
 */
exports.getLogs = async (req, res) => {
  try {
    const school_id = req.user.school_id;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 50);
    const offset = (page - 1) * limit;

    const { action, start_date, end_date } = req.query;

    let conditions = ['school_id = ?'];
    let params = [school_id];

    if (action) {
      conditions.push('action = ?');
      params.push(action);
    }
    if (start_date) {
      conditions.push('created_at >= ?');
      params.push(start_date);
    }
    if (end_date) {
      conditions.push('created_at <= ?');
      params.push(end_date + ' 23:59:59');
    }

    const whereClause = conditions.join(' AND ');

    const [[{ total }]] = await db.execute(
      `SELECT COUNT(*) as total FROM audit_logs WHERE ${whereClause}`,
      params
    );

    const [rows] = await db.execute(
      `SELECT id, user_name, role, action, entity_type, entity_name, details, created_at
       FROM audit_logs
       WHERE ${whereClause}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      logs: rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('getLogs error:', err);
    res.status(500).json({ message: 'Failed to fetch audit logs' });
  }
};

/**
 * GET /api/audit/actions
 * Returns all distinct action types — used to populate filter dropdowns.
 */
exports.getActionTypes = async (req, res) => {
  try {
    const school_id = req.user.school_id;
    const [rows] = await db.execute(
      'SELECT DISTINCT action FROM audit_logs WHERE school_id = ? ORDER BY action ASC',
      [school_id]
    );
    res.json(rows.map(r => r.action));
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch action types' });
  }
};
