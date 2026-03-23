const db = require("../config/db");

exports.createCandidate = async (req, res) => {
  try {
    const school_id = req.user.school_id;
    const { election_id, admission_no, voter_id, post_id } = req.body;

    /* 1️⃣ find voter by ID or admission number */
    let voterQuery = "SELECT id, admission_no, class_id, sex, is_blocked FROM voters WHERE election_id=?";
    let voterParams = [election_id];

    if (voter_id) {
      voterQuery += " AND id=?";
      voterParams.push(voter_id);
    } else if (admission_no) {
      voterQuery += " AND admission_no=?";
      voterParams.push(admission_no);
    } else {
      return res.status(400).json({ message: "Voter ID or Admission number is required" });
    }

    const [voterRows] = await db.execute(voterQuery, voterParams);

    if (voterRows.length === 0) {
      return res.status(400).json({ message: "Voter not found" });
    }

    const voter = voterRows[0];
    const actual_voter_id = voter.id;
    const actual_admission_no = voter.admission_no;
    const voterClass = voter.class_id;
    const voterSex = voter.sex;

    if (voter.is_blocked) {
      return res.status(400).json({
        message: "This student is currently blocked and cannot be registered as a candidate."
      });
    }

    /* 2️⃣ get post rules */
    const [postRows] = await db.execute(
      `SELECT candidate_classes, gender_rule FROM posts WHERE id=? AND election_id=?`,
      [post_id, election_id]
    );

    if (postRows.length === 0) {
      return res.status(400).json({ message: "Post not found" });
    }

    const candidateClasses = JSON.parse(postRows[0].candidate_classes || "[]");
    const genderRule = postRows[0].gender_rule;

    /* 3️⃣ check class eligibility */
    if (!candidateClasses.includes(voterClass)) {
      return res.status(400).json({ message: "This class is not eligible for this post" });
    }

    /* 4️⃣ check gender eligibility */
    if (genderRule !== "ANY" && voterSex !== genderRule) {
      return res.status(400).json({ message: "Gender not eligible for this post" });
    }

    /* 5️⃣ prevent multiple candidacy */
    const [existingCandidate] = await db.execute(
      `SELECT id FROM candidates WHERE voter_id=? AND election_id=?`,
      [actual_voter_id, election_id]
    );

    if (existingCandidate.length > 0) {
      return res.status(400).json({ message: "This voter is already a candidate" });
    }

    /* 6️⃣ handle uploaded files (photo and symbol) */
    let photoPath = null;
    let symbolPath = null;
    const school_code = req.user.school_code || `school_${req.user.school_id}`;

    if (req.files) {
      if (req.files.photo) {
        photoPath = `/uploads/candidates/${school_code}/${election_id}/photos/photo-${actual_admission_no}.jpg`;
      }
      if (req.files.symbol) {
        symbolPath = `/uploads/candidates/${school_code}/${election_id}/symbols/symbol-${actual_admission_no}.png`;
      }
    }

    /* 7️⃣ create candidate */
    const [result] = await db.execute(
      `INSERT INTO candidates (school_id, election_id, voter_id, post_id, photo, symbol) VALUES (?,?,?,?,?,?)`,
      [school_id, election_id, actual_voter_id, post_id, photoPath, symbolPath]
    );

    res.json({
      message: "Candidate created successfully",
      candidate_id: result.insertId,
      photo: photoPath,
      symbol: symbolPath
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

exports.getCandidates = async (req, res) => {
  try {
    const school_id = req.user.school_id;
    const { election_id } = req.query;

    if (!election_id || isNaN(election_id)) {
      return res.status(400).json({ message: "Valid election_id is required" });
    }

    const [rows] = await db.execute(
      `SELECT
        candidates.id,
        candidates.voter_id,
        candidates.post_id,
        voters.admission_no,
        voters.name AS candidate_name,
        voters.sex,
        voters.is_blocked,
        classes.name AS class_name,
        posts.name AS post_name,
        candidates.photo,
        candidates.symbol
      FROM candidates
      JOIN voters ON candidates.voter_id = voters.id
      JOIN classes ON voters.class_id = classes.id
      JOIN posts ON candidates.post_id = posts.id
      WHERE candidates.school_id=? AND candidates.election_id=?
      ORDER BY candidate_name ASC`,
      [school_id, election_id]
    );

    res.json(rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getCandidate = async (req, res) => {
  try {
    const school_id = req.user.school_id;
    const { candidate_id } = req.params;

    const [rows] = await db.execute(
      `SELECT
        candidates.id AS candidate_id,
        voters.admission_no,
        voters.name,
        voters.sex AS gender,
        classes.name AS class,
        posts.name AS post,
        candidates.photo,
        candidates.symbol,
        candidates.election_id
      FROM candidates
      JOIN voters ON candidates.voter_id = voters.id
      JOIN classes ON voters.class_id = classes.id
      JOIN posts ON candidates.post_id = posts.id
      WHERE candidates.id=? AND candidates.school_id=?`,
      [candidate_id, school_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    res.json(rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateCandidate = async (req, res) => {
  try {
    const school_id = req.user.school_id;
    const { candidate_id } = req.params;
    const { post_id } = req.body;

    const [existing] = await db.execute(
      `SELECT c.voter_id, c.election_id, v.admission_no 
       FROM candidates c 
       JOIN voters v ON c.voter_id = v.id 
       WHERE c.id=? AND c.school_id=?`,
      [candidate_id, school_id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const voter_id = existing[0].voter_id;
    const election_id = existing[0].election_id;
    const actual_admission_no = existing[0].admission_no;
    const school_code = req.user.school_code || `school_${req.user.school_id}`;

    let updateFields = [];
    let updateParams = [];

    if (post_id) {
      const [voterRows] = await db.execute(`SELECT class_id, sex FROM voters WHERE id=?`, [voter_id]);
      const [postRows] = await db.execute(`SELECT candidate_classes, gender_rule FROM posts WHERE id=? AND election_id=?`, [post_id, election_id]);
      
      if (postRows.length === 0) return res.status(400).json({ message: "Post not found" });

      const candidateClasses = JSON.parse(postRows[0].candidate_classes || "[]");
      if (!candidateClasses.includes(voterRows[0].class_id)) return res.status(400).json({ message: "This class is not eligible for this post" });
      if (postRows[0].gender_rule !== "ANY" && voterRows[0].sex !== postRows[0].gender_rule) return res.status(400).json({ message: "Gender not eligible for this post" });

      updateFields.push("post_id=?");
      updateParams.push(post_id);
    }

    if (req.files) {
      if (req.files.photo) {
        const photoPath = `/uploads/candidates/${school_code}/${election_id}/photos/photo-${actual_admission_no}.jpg`;
        updateFields.push("photo=?");
        updateParams.push(photoPath);
      }
      if (req.files.symbol) {
        const symbolPath = `/uploads/candidates/${school_code}/${election_id}/symbols/symbol-${actual_admission_no}.png`;
        updateFields.push("symbol=?");
        updateParams.push(symbolPath);
      }
    }

    if (updateFields.length > 0) {
      updateParams.push(candidate_id);
      await db.execute(
        `UPDATE candidates SET ${updateFields.join(", ")} WHERE id=?`,
        updateParams
      );
    }

    res.json({ message: "Candidate updated successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deleteCandidate = async (req, res) => {
  try {
    const school_id = req.user.school_id;
    const { candidate_id } = req.params;

    const [existing] = await db.execute(
      `SELECT photo, symbol FROM candidates WHERE id=? AND school_id=?`,
      [candidate_id, school_id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const { photo, symbol } = existing[0];

    await db.execute(
      `DELETE FROM candidates WHERE id=? AND school_id=?`,
      [candidate_id, school_id]
    );

    try {
      const fs = require("fs");
      const path = require("path");
      
      if (photo) {
        const photoPath = path.join(__dirname, "..", photo);
        if (fs.existsSync(photoPath)) fs.unlinkSync(photoPath);
      }
      if (symbol) {
        const symbolPath = path.join(__dirname, "..", symbol);
        if (fs.existsSync(symbolPath)) fs.unlinkSync(symbolPath);
      }
    } catch (fileErr) {
      console.error("Error deleting candidate files:", fileErr);
    }

    res.json({ message: "Candidate deleted successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};