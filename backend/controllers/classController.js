const db = require("../config/db");

exports.createClass = async (req, res) => {

  try {

    const { election_id, section_id, name } = req.body;
    const school_id = req.user.school_id;

    if (!election_id || !section_id || !name) {
      return res.status(400).json({
        message: "Required fields missing"
      });
    }

    const [existing] = await db.execute(
      `SELECT id FROM classes WHERE name = ? AND section_id = ? AND school_id = ? AND election_id = ?`,
      [name, section_id, school_id, election_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "A class with this name already exists in this section" });
    }

    const [result] = await db.execute(
      `INSERT INTO classes
       (school_id, election_id, section_id, name)
       VALUES (?,?,?,?)`,
      [school_id, election_id, section_id, name]
    );

    res.json({
      message: "Class created successfully",
      class_id: result.insertId
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error"
    });

  }

};
exports.getClasses = async (req, res) => {

  try {

    const { election_id } = req.query;
    const school_id = req.user.school_id;

    const [rows] = await db.execute(
      `SELECT 
        classes.id,
        classes.name,
        classes.section_id,
        classes.created_at,
        sections.name AS section_name
       FROM classes
       JOIN sections ON classes.section_id = sections.id
       WHERE classes.school_id = ?
       AND classes.election_id = ?
       ORDER BY classes.name`,
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

exports.getClass = async (req, res) => {

  try {

    const { class_id } = req.params;
    const school_id = req.user.school_id;

    const [rows] = await db.execute(
      `SELECT 
        classes.id,
        classes.name,
        classes.election_id,
        sections.name AS section_name
       FROM classes
       JOIN sections ON classes.section_id = sections.id
       WHERE classes.id = ?
       AND classes.school_id = ?`,
      [class_id, school_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Class not found"
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

exports.updateClass = async (req, res) => {

  try {

    const { class_id } = req.params;
    const { name, section_id } = req.body;
    const school_id = req.user.school_id;

    if (!name) {
      return res.status(400).json({
        message: "Class name required"
      });
    }

    const [duplicate] = await db.execute(
      `SELECT id FROM classes WHERE name = ? AND section_id = ? AND school_id = ? AND id != ?`,
      [name, section_id, school_id, class_id]
    );

    if (duplicate.length > 0) {
      return res.status(400).json({ message: "Another class with this name already exists" });
    }

    const [existing] = await db.execute(
      `SELECT id FROM classes WHERE id = ? AND school_id = ?`,
      [class_id, school_id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        message: "Class not found"
      });
    }

    if (section_id) {
      await db.execute(
        `UPDATE classes SET name = ?, section_id = ? WHERE id = ? AND school_id = ?`,
        [name, section_id, class_id, school_id]
      );
    } else {
      await db.execute(
        `UPDATE classes SET name = ? WHERE id = ? AND school_id = ?`,
        [name, class_id, school_id]
      );
    }

    res.json({
      message: "Class updated successfully"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error"
    });

  }

};

exports.deleteClass = async (req, res) => {

  try {

    const { class_id } = req.params;
    const school_id = req.user.school_id;

    const [existing] = await db.execute(
      `SELECT id FROM classes WHERE id = ? AND school_id = ?`,
      [class_id, school_id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        message: "Class not found"
      });
    }

    await db.execute(
      `DELETE FROM classes WHERE id = ? AND school_id = ?`,
      [class_id, school_id]
    );

    res.json({
      message: "Class deleted successfully"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error"
    });

  }

};