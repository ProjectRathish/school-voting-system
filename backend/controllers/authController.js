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

    const [assignments] = await db.execute(
      `SELECT a.booth_id, a.election_id, e.name as election_name
       FROM election_officer_assignments a
       JOIN elections e ON a.election_id = e.id
       WHERE a.user_id = ? AND e.status IN ('ACTIVE', 'PAUSED')
       LIMIT 1`,
      [user.id]
    );

    let assigned_booth_id = assignments.length > 0 ? assignments[0].booth_id : user.booth_id;
    if (!assigned_booth_id) return res.status(403).json({ message: "No active assignment" });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        school_id: user.school_id,
        school_code: school_code,
        booth_id: assigned_booth_id,
        must_change_password: user.must_change_password
      },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    res.json({ token, role: user.role, school_id: user.school_id, school_code: school_code, booth_id: assigned_booth_id, must_change_password: user.must_change_password });
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
      `INSERT INTO users (school_id, username, password_hash, role, must_change_password, booth_id)
       VALUES (?, ?, ?, 'BOOTH_OFFICER', 1, ?)`,
      [school_id, username, hash, booth_id || null]
    );
    res.status(201).json({ message: "Officer created", id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getBoothOfficers = async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT id, username, created_at, booth_id FROM users WHERE school_id=? AND role='BOOTH_OFFICER'", [req.user.school_id]);
    res.json({ data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
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
    await db.execute("UPDATE users SET password_hash=?, must_change_password=1 WHERE id=? AND school_id=?", [hash, req.params.id, req.user.school_id]);
    res.json({ message: "Reset" });
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