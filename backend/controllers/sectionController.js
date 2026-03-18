const db = require("../config/db");


exports.createSection = async (req, res) => {

  try {

    const { election_id, name } = req.body;

    const school_id = req.user.school_id;

    if (!election_id || !name) {
      return res.status(400).json({
        message: "election_id and name required"
      });
    }

    // verify election belongs to this school
    const [election] = await db.execute(
      `SELECT id FROM elections
       WHERE id = ? AND school_id = ?`,
      [election_id, school_id]
    );

    if (election.length === 0) {
      return res.status(403).json({
        message: "Invalid election for this school"
      });
    }

    const [existingName] = await db.execute(
      `SELECT id FROM sections WHERE name = ? AND election_id = ? AND school_id = ?`,
      [name, election_id, school_id]
    );

    if (existingName.length > 0) {
      return res.status(400).json({ message: "A section with this name already exists in this election" });
    }

    const [result] = await db.execute(
      `INSERT INTO sections
       (school_id, election_id, name)
       VALUES (?,?,?)`,
      [school_id, election_id, name]
    );

    res.json({
      message: "Section created successfully",
      section_id: result.insertId
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error"
    });

  }

};
exports.getSections = async (req, res) => {

  try {

    const { election_id } = req.query;
    const school_id = req.user.school_id;

    if (!election_id) {
      return res.status(400).json({
        message: "election_id required"
      });
    }

    const [rows] = await db.execute(
      `SELECT id, name, created_at
       FROM sections
       WHERE school_id = ?
       AND election_id = ?
       ORDER BY name`,
      [school_id, election_id]
    );

    res.json(rows);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error"
    });

  }

};

exports.getSection = async (req, res) => {

  try {

    const { section_id } = req.params;
    const school_id = req.user.school_id;

    const [rows] = await db.execute(
      `SELECT id, name, election_id, created_at
       FROM sections
       WHERE id = ?
       AND school_id = ?`,
      [section_id, school_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Section not found"
      });
    }

    res.json(rows[0]);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error"
    });

  }

};

exports.updateSection = async (req, res) => {

  try {

    const { section_id } = req.params;
    const { name } = req.body;
    const school_id = req.user.school_id;

    if (!name) {
      return res.status(400).json({
        message: "Section name required"
      });
    }

    const [duplicate] = await db.execute(
      `SELECT id FROM sections WHERE name = ? AND election_id = (SELECT election_id FROM sections WHERE id = ?) AND school_id = ? AND id != ?`,
      [name, section_id, school_id, section_id]
    );

    if (duplicate.length > 0) {
      return res.status(400).json({ message: "Another section with this name already exists in this election" });
    }

    const [existing] = await db.execute(
      `SELECT id FROM sections WHERE id = ? AND school_id = ?`,
      [section_id, school_id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        message: "Section not found"
      });
    }

    await db.execute(
      `UPDATE sections SET name = ? WHERE id = ? AND school_id = ?`,
      [name, section_id, school_id]
    );

    res.json({
      message: "Section updated successfully"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error"
    });

  }

};

exports.deleteSection = async (req, res) => {

  try {

    const { section_id } = req.params;
    const school_id = req.user.school_id;

    const [existing] = await db.execute(
      `SELECT id FROM sections WHERE id = ? AND school_id = ?`,
      [section_id, school_id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        message: "Section not found"
      });
    }

    await db.execute(
      `DELETE FROM sections WHERE id = ? AND school_id = ?`,
      [section_id, school_id]
    );

    res.json({
      message: "Section deleted successfully"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error"
    });

  }

};