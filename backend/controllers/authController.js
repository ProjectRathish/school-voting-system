const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  try {
    const { school_code, password } = req.body;
    let { username } = req.body;

    if (!school_code || !password) {
      return res.status(400).json({ message: "school_code and password are required" });
    }

    if (!username && school_code.toUpperCase() !== 'SYSTEM') {
      username = school_code;
    }

    if (!username) {
      return res.status(400).json({ message: "username is required for system login" });
    }

    let school_id = null;
    let school_name = "System Platform";
    let school_logo = null;

    if (school_code.toUpperCase() === 'SYSTEM') {
      const [rows] = await db.execute(
        "SELECT * FROM users WHERE username=? AND role='SUPER_ADMIN'",
        [username]
      );
      if (rows.length === 0) return res.status(401).json({ message: "Invalid credentials" });
      var user = rows[0];
    } else {
      const [schools] = await db.execute("SELECT id, name, logo FROM schools WHERE code=?", [school_code]);
      if (schools.length === 0) return res.status(401).json({ message: "Invalid school code" });
      
      school_id = schools[0].id;
      school_name = schools[0].name;
      school_logo = schools[0].logo;

      const [rows] = await db.execute(
        "SELECT * FROM users WHERE username=? AND school_id=?",
        [username, school_id]
      );
      if (rows.length === 0) return res.status(401).json({ message: "Invalid credentials" });
      var user = rows[0];
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        school_id: user.school_id,
        school_code: school_code,
        school_name: school_name,
        school_logo: school_logo,
        must_change_password: user.must_change_password
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      token,
      id: user.id,
      role: user.role,
      school_id: user.school_id,
      school_code: school_code,
      school_name: school_name,
      school_logo: school_logo,
      must_change_password: user.must_change_password
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.boothLogin = async (req, res) => {
  try {
    const { school_code, username, password } = req.body;
    const [schools] = await db.execute("SELECT id, name, logo FROM schools WHERE code=?", [school_code]);
    if (schools.length === 0) return res.status(401).json({ message: "Invalid school code" });
    
    const school_id = schools[0].id;
    const [rows] = await db.execute("SELECT * FROM users WHERE username=? AND school_id=?", [username, school_id]);
    if (rows.length === 0) return res.status(401).json({ message: "Invalid credentials" });
    
    const user = rows[0];
    if (user.role !== 'BOOTH_OFFICER') return res.status(403).json({ message: "Not a booth officer" });

    let assigned_booth_id = user.booth_id;
    
    // Find all elections that are not CLOSED for this school
    const [allElections] = await db.execute(
      `SELECT id, name, status FROM elections 
       WHERE school_id = ? AND status != 'CLOSED'
       ORDER BY (CASE 
         WHEN status = 'ACTIVE' THEN 1 
         WHEN status = 'PAUSED' THEN 2 
         WHEN status = 'READY' THEN 3 
         ELSE 4 END) ASC`,
      [school_id]
    );

    // Check for specific assignments for this officer
    const [assignedRows] = await db.execute(
      "SELECT election_id FROM election_officer_assignments WHERE user_id = ?",
      [user.id]
    );

    let elections = allElections;
    if (assignedRows.length > 0) {
      const assignedIds = assignedRows.map(r => r.election_id);
      elections = allElections.filter(e => assignedIds.includes(e.id));
    }

    let assigned_election_id = elections.length > 0 ? elections[0].id : null;
    let assigned_election_name = elections.length > 0 ? elections[0].name : null;

    // Verify password


    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        school_id: user.school_id,
        school_code: school_code,
        booth_id: assigned_booth_id,
        election_id: assigned_election_id,
        election_name: assigned_election_name,
        available_elections: elections,
        must_change_password: user.must_change_password
      },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    res.json({ 
      token, 
      id: user.id,
      role: user.role, 
      school_id: user.school_id, 
      school_code: school_code, 
      booth_id: assigned_booth_id, 
      election_id: assigned_election_id, 
      election_name: assigned_election_name,
      available_elections: elections,
      must_change_password: user.must_change_password 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user_id = req.user.id;
    const [rows] = await db.execute("SELECT * FROM users WHERE id=?", [user_id]);
    if (rows.length === 0) return res.status(404).json({ message: "User not found" });
    
    const user = rows[0];
    let available_elections = [];
    let assigned_election_id = null;

    if (user.role === 'BOOTH_OFFICER') {
      const [allElections] = await db.execute(
        `SELECT id, name, status FROM elections 
         WHERE school_id = ? AND status != 'CLOSED'
         ORDER BY (CASE 
           WHEN status = 'ACTIVE' THEN 1 
           WHEN status = 'PAUSED' THEN 2 
           WHEN status = 'READY' THEN 3 
           ELSE 4 END) ASC`,
        [user.school_id]
      );

      const [assignedRows] = await db.execute(
        "SELECT election_id FROM election_officer_assignments WHERE user_id = ?",
        [user_id]
      );

      if (assignedRows.length > 0) {
        const assignedIds = assignedRows.map(r => r.election_id);
        available_elections = allElections.filter(e => assignedIds.includes(e.id));
      } else {
        available_elections = allElections;
      }
      
      assigned_election_id = available_elections.length > 0 ? available_elections[0].id : null;
    }

    res.json({
      ...req.user,
      booth_id: user.booth_id,
      available_elections: available_elections,
      election_id: assigned_election_id,
      must_change_password: user.must_change_password
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.createBoothOfficer = async (req, res) => {
  try {
    const { username, password, booth_id } = req.body;
    const school_id = req.user.school_id;
    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      `INSERT INTO users (school_id, username, password_hash, plain_password, role, must_change_password, booth_id)
       VALUES (?, ?, ?, ?, 'BOOTH_OFFICER', 0, ?)`,
      [school_id, username, hash, password, booth_id || null]
    );
    res.status(201).json({ message: "Officer created", id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getBoothOfficers = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT u.id, u.username, u.plain_password, u.created_at, u.booth_id, b.booth_number,
             GROUP_CONCAT(eoa.election_id) as assigned_election_ids
      FROM users u 
      LEFT JOIN polling_booths b ON u.booth_id = b.id 
      LEFT JOIN election_officer_assignments eoa ON u.id = eoa.user_id
      WHERE u.school_id=? AND u.role='BOOTH_OFFICER'
      GROUP BY u.id
    `, [req.user.school_id]);
    res.json({ data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.assignBooth = async (req, res) => {
  try {
    const { id } = req.params;
    const { booth_id } = req.body;
    const school_id = req.user.school_id;

    // Check if already assigned elsewhere
    if (booth_id) {
      const [existing] = await db.execute(
        "SELECT booth_id FROM users WHERE id=? AND school_id=?",
        [id, school_id]
      );
      if (existing.length > 0 && existing[0].booth_id && existing[0].booth_id !== parseInt(booth_id)) {
        return res.status(400).json({ message: "Officer is already assigned to another booth. Please unassign them first." });
      }
    }

    await db.execute(
      "UPDATE users SET booth_id=? WHERE id=? AND school_id=? AND role='BOOTH_OFFICER'",
      [booth_id || null, id, school_id]
    );

    res.json({ message: "Booth assigned successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.setElectionAccess = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { election_ids } = req.body; // Array of IDs
    const school_id = req.user.school_id;

    connection = await db.getConnection();
    await connection.beginTransaction();

    // Verify user and get their booth_id
    const [userRows] = await connection.execute(
      "SELECT booth_id FROM users WHERE id=? AND school_id=? AND role='BOOTH_OFFICER'",
      [id, school_id]
    );

    if (userRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Officer not found" });
    }

    const booth_id = userRows[0].booth_id;

    // Delete existing assignments
    await connection.execute(
      "DELETE FROM election_officer_assignments WHERE user_id=?",
      [id]
    );

    // Insert new ones if provided
    if (election_ids && election_ids.length > 0) {
      if (!booth_id) {
        await connection.rollback();
        return res.status(400).json({ message: "Officer must be assigned to a booth before restricting election access." });
      }
      
      const values = election_ids.map(eid => [eid, booth_id, id]);
      await connection.query(
        "INSERT INTO election_officer_assignments (election_id, booth_id, user_id) VALUES ?",
        [values]
      );
    }

    await connection.commit();
    res.json({ message: "Election access updated successfully" });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error(error);
    res.status(500).json({ message: "Server error" });
  } finally {
    if (connection) connection.release();
  }
};

exports.deleteBoothOfficer = async (req, res) => {
  try {
    await db.execute("DELETE FROM users WHERE id=? AND school_id=? AND role='BOOTH_OFFICER'", [req.params.id, req.user.school_id]);
    res.json({ message: "Deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.resetBoothOfficerPassword = async (req, res) => {
  try {
    const hash = await bcrypt.hash(req.body.new_password, 10);
    await db.execute("UPDATE users SET password_hash=?, plain_password=?, must_change_password=0 WHERE id=? AND school_id=?", [hash, req.body.new_password, req.params.id, req.user.school_id]);
    res.json({ message: "Reset" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateBoothOfficer = async (req, res) => {
  try {
    const { username } = req.body;
    const { id } = req.params;
    const school_id = req.user.school_id;

    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    // Check if username already exists for another user in this school
    const [existing] = await db.execute(
      "SELECT id FROM users WHERE username=? AND school_id=? AND id != ?",
      [username, school_id, id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Username already taken" });
    }

    await db.execute(
      "UPDATE users SET username=? WHERE id=? AND school_id=? AND role='BOOTH_OFFICER'",
      [username, id, school_id]
    );

    res.json({ message: "Officer updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    const user_id = req.user.id;

    if (!current_password || !new_password) return res.status(400).json({ message: "Required fields missing" });
    if (new_password.length < 6) return res.status(400).json({ message: "Password too short" });

    const [rows] = await db.execute("SELECT password_hash FROM users WHERE id=?", [user_id]);
    if (rows.length === 0) return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(current_password, rows[0].password_hash);
    if (!match) return res.status(401).json({ message: "Incorrect current password" });

    const hash = await bcrypt.hash(new_password, 10);
    await db.execute("UPDATE users SET password_hash=?, must_change_password=0 WHERE id=?", [hash, user_id]);

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};