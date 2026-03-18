const db = require("../config/db");
const path = require("path");
const validateEmail = require("../utils/validateEmail");

exports.updateLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No logo file uploaded" });
    }

    const school_id = req.user.school_id;
    const logo_path = "/uploads/school-logo/" + req.file.filename;

    await db.execute(
      "UPDATE schools SET logo = ? WHERE id = ?",
      [logo_path, school_id]
    );

    res.json({
      message: "School logo updated successfully",
      logo: logo_path
    });
  } catch (error) {
    console.error("Error updating school logo:", error);
    res.status(500).json({ message: "Server error updating logo" });
  }
};

exports.getSchoolInfo = async (req, res) => {
  try {
    const school_id = req.user.school_id;
    const [rows] = await db.execute(
      "SELECT id, name, code, logo, location, phone, email, address, contact_person FROM schools WHERE id = ?",
      [school_id]
    );



    if (rows.length === 0) {
      return res.status(404).json({ message: "School not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching school info:", error);
    res.status(500).json({ message: "Server error fetching school info" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const school_id = req.user.school_id;
    const { location, phone, email, address, contact_person } = req.body;

    if (email && !validateEmail(email)) {
      return res.status(400).json({ message: "Please provide a valid email address" });
    }

    await db.execute(
      "UPDATE schools SET location = ?, phone = ?, email = ?, address = ?, contact_person = ? WHERE id = ?",
      [location, phone, email, address, contact_person, school_id]
    );

    res.json({ message: "School profile updated successfully" });
  } catch (error) {
    console.error("Error updating school profile:", error);
    res.status(500).json({ message: "Server error updating profile" });
  }
};
