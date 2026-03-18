const db = require("../config/db");
const bcrypt = require("bcrypt");
const emailService = require("../utils/emailService");
const validateEmail = require("../utils/validateEmail");
const fs = require("fs");
const path = require("path");

const generateNextSchoolCode = async () => {
  const [rows] = await db.execute("SELECT code FROM schools");
  let maxId = 0;
  
  rows.forEach(row => {
    const match = row.code.match(/\d+/);
    if (match) {
      const num = parseInt(match[0]);
      if (num > maxId) maxId = num;
    }
  });

  const nextId = maxId + 1;
  return `SPE${String(nextId).padStart(4, '0')}`;
};

exports.createSchoolEnquiry = async (req, res) => {
  try {
    const {
      school_name,
      contact_person,
      contact_email,
      contact_phone,
      location,
      message
    } = req.body;

    if (!school_name || !contact_person || !contact_email || !contact_phone) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    if (!validateEmail(contact_email)) {
      return res.status(400).json({ message: "Please provide a valid email address" });
    }

    const [existingSchool] = await db.execute("SELECT id FROM schools WHERE email = ?", [contact_email]);
    if (existingSchool.length > 0) {
      return res.status(400).json({ message: "A school with this email already exists" });
    }

    const [existingEnquiry] = await db.execute("SELECT id FROM school_enquiries WHERE contact_email = ? AND status = 'PENDING'", [contact_email]);
    if (existingEnquiry.length > 0) {
      return res.status(400).json({ message: "An enquiry with this email is already pending approval" });
    }

    const sql = `
      INSERT INTO school_enquiries
      (school_name, contact_person, contact_email, contact_phone, location, message)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    await db.execute(sql, [school_name, contact_person, contact_email, contact_phone, location, message]);

    res.json({ message: "School enquiry submitted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getEnquiries = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 50;
    const [rows] = await db.execute(`SELECT * FROM school_enquiries ORDER BY created_at DESC LIMIT ?`, [limit]);
    res.json({ data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getPlatformStats = async (req, res) => {
  try {
    const [[{ totalSchools }]] = await db.execute("SELECT COUNT(*) as totalSchools FROM schools");
    const [[{ pendingEnquiries }]] = await db.execute("SELECT COUNT(*) as pendingEnquiries FROM school_enquiries WHERE status = 'PENDING'");
    const [[{ activeElections }]] = await db.execute("SELECT COUNT(*) as activeElections FROM elections WHERE status = 'ACTIVE'");
    const [[{ expiringSoon }]] = await db.execute(
      "SELECT COUNT(*) as expiringSoon FROM elections WHERE status = 'ACTIVE' AND end_date <= DATE_ADD(NOW(), INTERVAL 7 DAY)"
    );

    res.json({ totalSchools, pendingEnquiries, activeElections, expiringSoon });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.approveSchool = async (req, res) => {
  try {
    const { enquiry_id, admin_password: custom_password } = req.body;
    const [rows] = await db.execute("SELECT * FROM school_enquiries WHERE id=?", [enquiry_id]);

    if (rows.length === 0) return res.status(404).json({ message: "Enquiry not found" });
    const enquiry = rows[0];

    if (enquiry.status === "APPROVED") return res.status(400).json({ message: "This enquiry is already approved" });

    const school_code = await generateNextSchoolCode();
    const admin_username = school_code;

    const [schoolResult] = await db.execute(
      "INSERT INTO schools (name, contact_person, email, phone, code, location) VALUES (?,?,?,?,?,?)",
      [enquiry.school_name, enquiry.contact_person, enquiry.contact_email, enquiry.contact_phone, school_code, enquiry.location]
    );

    const school_id = schoolResult.insertId;
    const passwordToUse = custom_password || "changeme123";
    const hash = await bcrypt.hash(passwordToUse, 10);

    await db.execute(
      "INSERT INTO users (school_id, username, password_hash, role, must_change_password) VALUES (?,?,?,?,?)",
      [school_id, admin_username, hash, "SCHOOL_ADMIN", 1]
    );

    await db.execute("UPDATE school_enquiries SET status='APPROVED' WHERE id=?", [enquiry_id]);

    emailService.sendSchoolApprovalEmail(enquiry.contact_email, enquiry.school_name, school_code, passwordToUse);

    res.json({ message: "School approved successfully", school_code, admin_username, temp_password: passwordToUse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.createSchool = async (req, res) => {
  try {
    const { name, contact_person, contact_email, contact_phone, location, admin_password } = req.body;

    if (!name || !contact_person || !contact_email || !contact_phone || !admin_password) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    if (!validateEmail(contact_email)) {
      return res.status(400).json({ message: "Please provide a valid email address" });
    }

    const code = await generateNextSchoolCode();
    const [existingCode] = await db.execute("SELECT id FROM schools WHERE code = ?", [code]);
    if (existingCode.length > 0) return res.status(400).json({ message: "School code already exists" });

    const [existingEmail] = await db.execute("SELECT id FROM schools WHERE email = ?", [contact_email]);
    if (existingEmail.length > 0) return res.status(400).json({ message: "This email is already registered to another school" });

    const admin_username = code;
    const [schoolResult] = await db.execute(
      "INSERT INTO schools (name, contact_person, email, phone, code, location) VALUES (?,?,?,?,?,?)",
      [name, contact_person, contact_email, contact_phone, code, location]
    );

    const school_id = schoolResult.insertId;
    const hash = await bcrypt.hash(admin_password, 10);

    await db.execute(
      "INSERT INTO users (school_id, username, password_hash, role, must_change_password) VALUES (?,?,?,?,?)",
      [school_id, admin_username, hash, "SCHOOL_ADMIN", 1]
    );

    emailService.sendSchoolApprovalEmail(contact_email, name, code, admin_password);

    res.json({ message: "School account created successfully", school_id, code, admin_username });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getSuggestedSchoolCode = async (req, res) => {
  try {
    const suggestedCode = await generateNextSchoolCode();
    res.json({ suggestedCode });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getSchools = async (req, res) => {
  try {
    const [rows] = await db.execute(`SELECT * FROM schools ORDER BY created_at DESC`);
    res.json({ data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getSchool = async (req, res) => {
  try {
    const { school_id } = req.params;
    const [rows] = await db.execute(`SELECT * FROM schools WHERE id = ?`, [school_id]);
    if (rows.length === 0) return res.status(404).json({ message: "School not found" });
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateSchool = async (req, res) => {
  try {
    const { school_id } = req.params;
    const { name, location, contact_person, email, phone } = req.body;

    const [existing] = await db.execute(`SELECT id FROM schools WHERE id = ?`, [school_id]);
    if (existing.length === 0) return res.status(404).json({ message: "School not found" });

    let updateFields = [];
    let updateValues = [];

    if (name) { updateFields.push("name = ?"); updateValues.push(name); }
    if (location) { updateFields.push("location = ?"); updateValues.push(location); }
    if (contact_person) { updateFields.push("contact_person = ?"); updateValues.push(contact_person); }
    if (email) { updateFields.push("email = ?"); updateValues.push(email); }
    if (phone) { updateFields.push("phone = ?"); updateValues.push(phone); }

    if (updateFields.length === 0) return res.status(400).json({ message: "No fields to update" });

    updateValues.push(school_id);
    await db.execute(`UPDATE schools SET ${updateFields.join(", ")} WHERE id = ?`, updateValues);

    res.json({ message: "School updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteSchool = async (req, res) => {
  try {
    const { school_id } = req.params;
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      await connection.execute("DELETE FROM election_officer_assignments WHERE election_id IN (SELECT id FROM elections WHERE school_id=?)", [school_id]);
      await connection.execute("DELETE FROM votes WHERE candidate_id IN (SELECT id FROM candidates WHERE school_id=?)", [school_id]);
      await connection.execute("DELETE FROM candidates WHERE school_id=?", [school_id]);
      await connection.execute("DELETE FROM voters WHERE school_id=?", [school_id]);
      await connection.execute("DELETE FROM posts WHERE school_id=?", [school_id]);
      await connection.execute("DELETE FROM voting_machines WHERE school_id=?", [school_id]);
      await connection.execute("DELETE FROM polling_booths WHERE school_id=?", [school_id]);
      await connection.execute("DELETE FROM classes WHERE school_id=?", [school_id]);
      await connection.execute("DELETE FROM sections WHERE school_id=?", [school_id]);
      await connection.execute("DELETE FROM elections WHERE school_id=?", [school_id]);
      await connection.execute("DELETE FROM users WHERE school_id=?", [school_id]);
      const [schoolRows] = await connection.execute("SELECT code FROM schools WHERE id=?", [school_id]);
      const school_code = schoolRows.length > 0 ? schoolRows[0].code : null;

      await connection.execute("DELETE FROM schools WHERE id=?", [school_id]);
      await connection.commit();

      // Delete files after commit
      if (school_code) {
        try {
          // 1. Delete candidates directory (New structure)
          const candDir = path.join(__dirname, "../uploads/candidates", school_code);
          if (fs.existsSync(candDir)) {
            fs.rmSync(candDir, { recursive: true, force: true });
            console.log(`Deleted folder: ${candDir}`);
          }

          // 2. Delete school logo (supports various extensions)
          const logoDir = path.join(__dirname, "../uploads/school-logo");
          if (fs.existsSync(logoDir)) {
            const files = fs.readdirSync(logoDir);
            const school_id_str = `school_${school_id}`;
            
            files.forEach(file => {
              // Matches school_code.ext or school_id.ext
              if (file.startsWith(school_code) || file.startsWith(school_id_str)) {
                fs.unlinkSync(path.join(logoDir, file));
                console.log(`Deleted logo file: ${file}`);
              }
            });
          }
        } catch (fileErr) {
          console.error("Error deleting school files:", fileErr);
        }
      }


      res.json({ message: "School deleted successfully" });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getEnquiry = async (req, res) => {
  try {
    const { enquiry_id } = req.params;
    const [rows] = await db.execute(`SELECT * FROM school_enquiries WHERE id = ?`, [enquiry_id]);
    if (rows.length === 0) return res.status(404).json({ message: "Enquiry not found" });
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.rejectEnquiry = async (req, res) => {
  try {
    const { enquiry_id } = req.params;
    const [existing] = await db.execute(`SELECT status FROM school_enquiries WHERE id = ?`, [enquiry_id]);
    if (existing.length === 0) return res.status(404).json({ message: "Enquiry not found" });
    if (existing[0].status === "APPROVED") return res.status(400).json({ message: "Cannot reject approved enquiry" });

    await db.execute(`UPDATE school_enquiries SET status = 'REJECTED' WHERE id = ?`, [enquiry_id]);
    res.json({ message: "Enquiry rejected successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.resetSchoolPassword = async (req, res) => {
  try {
    const { school_id } = req.params;
    const { new_password } = req.body;
    if (!new_password || new_password.length < 6) return res.status(400).json({ message: "Password too short" });

    const hash = await bcrypt.hash(new_password, 10);
    const [result] = await db.execute("UPDATE users SET password_hash=?, must_change_password=1 WHERE school_id=? AND role='SCHOOL_ADMIN'", [hash, school_id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Admin account not found" });

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.resendSchoolWelcomeEmail = async (req, res) => {
  try {
    const { school_id } = req.params;
    const { reset_password, new_password } = req.body;

    const [rows] = await db.execute("SELECT * FROM schools WHERE id = ?", [school_id]);
    if (rows.length === 0) return res.status(404).json({ message: "School not found" });
    const school = rows[0];

    const [userRows] = await db.execute("SELECT username FROM users WHERE school_id = ? AND role = 'SCHOOL_ADMIN'", [school_id]);
    if (userRows.length === 0) return res.status(404).json({ message: "Admin not found" });

    let passwordToSend = "Existing Secured Password (Reset if forgotten)";

    if (reset_password && new_password) {
      const hash = await bcrypt.hash(new_password, 10);
      await db.execute("UPDATE users SET password_hash=?, must_change_password=1 WHERE school_id=? AND role='SCHOOL_ADMIN'", [hash, school_id]);
      passwordToSend = new_password;
    }

    await emailService.sendSchoolApprovalEmail(school.email, school.name, school.code, passwordToSend);
    res.json({ message: reset_password ? "Password reset and welcome email sent!" : "Welcome email resent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};