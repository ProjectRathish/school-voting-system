const db = require("../config/db");

exports.createCandidate = async (req, res) => {
  try {
    const school_id = req.user.school_id;
    const { election_id, admission_no, voter_id, post_id, symbol_name } = req.body;

    console.log("Registering candidate:", { election_id, voter_id, post_id, admission_no });

    if (!election_id) {
      return res.status(400).json({ message: "Election ID is required" });
    }

    /* 1️⃣ find voter by ID or admission number */
    let voterQuery = "SELECT id, admission_no, class_id, sex, is_blocked, name FROM voters WHERE election_id=?";
    let voterParams = [election_id];

    if (voter_id && voter_id !== "null" && voter_id !== "") {
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
      return res.status(400).json({ message: `Voter not found for the given ${voter_id ? 'ID' : 'Admission No'}` });
    }

    const voter = voterRows[0];
    const actual_voter_id = voter.id;
    const actual_admission_no = voter.admission_no;
    const voterClass = Number(voter.class_id);
    const voterSex = voter.sex;

    if (voter.is_blocked) {
      return res.status(400).json({
        message: `${voter.name || 'This student'} is currently blocked and cannot be registered as a candidate.`
      });
    }

    /* 2️⃣ get post rules */
    const [postRows] = await db.execute(
      `SELECT name, candidate_classes, gender_rule FROM posts WHERE id=? AND election_id=?`,
      [post_id, election_id]
    );

    if (postRows.length === 0) {
      return res.status(400).json({ message: "Post not found or does not belong to this election" });
    }

    const postName = postRows[0].name;
    let candidateClasses = [];
    try {
      candidateClasses = JSON.parse(postRows[0].candidate_classes || "[]");
      // Ensure all elements are numbers for reliable comparison
      candidateClasses = Array.isArray(candidateClasses) ? candidateClasses.map(Number) : [];
    } catch (e) {
      console.error("Invalid candidate_classes JSON:", postRows[0].candidate_classes);
      candidateClasses = [];
    }
    
    const genderRule = postRows[0].gender_rule;

    /* 3️⃣ check class eligibility */
    if (!candidateClasses.includes(voterClass)) {
      return res.status(400).json({ 
        message: `Student class (ID: ${voterClass}) is not eligible for the post "${postName}".` 
      });
    }

    /* 4️⃣ check gender eligibility */
    if (genderRule !== "ANY" && voterSex !== genderRule) {
      const requiredGender = genderRule === "M" ? "Male" : "Female";
      return res.status(400).json({ 
        message: `This post "${postName}" is reserved for ${requiredGender} candidates only.` 
      });
    }

    /* 5️⃣ prevent multiple candidacy */
    const [existingCandidate] = await db.execute(
      `SELECT id FROM candidates WHERE voter_id=? AND election_id=?`,
      [actual_voter_id, election_id]
    );

    if (existingCandidate.length > 0) {
      return res.status(400).json({ message: `${voter.name} is already registered as a candidate in this election` });
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
    const insertParams = [
      school_id || null, 
      election_id || null, 
      actual_voter_id || null, 
      post_id || null, 
      photoPath || null, 
      symbolPath || null, 
      symbol_name || null
    ];

    console.log("Candidate Insert Params:", insertParams);

    const [result] = await db.execute(
      `INSERT INTO candidates (school_id, election_id, voter_id, post_id, photo, symbol, symbol_name) VALUES (?,?,?,?,?,?,?)`,
      insertParams
    );

    res.json({
      message: "Candidate created successfully",
      candidate_id: result.insertId,
      photo: photoPath,
      symbol: symbolPath
    });

  } catch (error) {
    console.error("CREATE_CANDIDATE_ERROR:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

exports.getCandidates = async (req, res) => {
  try {
    const school_id = req.user.school_id;
    const { election_id, post_id } = req.query;

    if (!election_id || isNaN(election_id)) {
      return res.status(400).json({ message: "Valid election_id is required" });
    }

    let query = `SELECT
        candidates.id,
        candidates.voter_id,
        candidates.post_id,
        voters.admission_no,
        voters.name AS candidate_name,
        voters.sex,
        voters.division,
        voters.is_blocked,
        classes.id AS class_id,
        classes.name AS class_name,
        posts.name AS post_name,
        candidates.photo,
        candidates.symbol,
        candidates.symbol_name
      FROM candidates
      JOIN voters ON candidates.voter_id = voters.id
      JOIN classes ON voters.class_id = classes.id
      JOIN posts ON candidates.post_id = posts.id
      WHERE candidates.school_id=? AND candidates.election_id=?`;
    
    const params = [school_id, election_id];

    if (post_id && !isNaN(post_id)) {
      query += ` AND candidates.post_id=?`;
      params.push(post_id);
    }

    query += ` ORDER BY candidate_name ASC`;

    const [rows] = await db.execute(query, params);

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
        candidates.symbol_name,
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
    const { post_id, symbol_name } = req.body;

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
      const [voterRows] = await db.execute(`SELECT name, class_id, sex FROM voters WHERE id=?`, [voter_id]);
      const [postRows] = await db.execute(`SELECT name, candidate_classes, gender_rule FROM posts WHERE id=? AND election_id=?`, [post_id, election_id]);
      
      if (postRows.length === 0) return res.status(400).json({ message: "Post not found" });

      const voterName = voterRows[0].name;
      const postName = postRows[0].name;
      let candidateClasses = [];
      try {
        candidateClasses = JSON.parse(postRows[0].candidate_classes || "[]");
        candidateClasses = Array.isArray(candidateClasses) ? candidateClasses.map(Number) : [];
      } catch (e) {
        candidateClasses = [];
      }

      const voterClass = Number(voterRows[0].class_id);
      if (!candidateClasses.includes(voterClass)) {
        return res.status(400).json({ message: `Student "${voterName}" (Class ID: ${voterClass}) is not eligible for the post "${postName}".` });
      }

      if (postRows[0].gender_rule !== "ANY" && voterRows[0].sex !== postRows[0].gender_rule) {
        const requiredGender = postRows[0].gender_rule === "M" ? "Male" : "Female";
        return res.status(400).json({ message: `The post "${postName}" is reserved for ${requiredGender} candidates only.` });
      }

      updateFields.push("post_id=?");
      updateParams.push(post_id);
    }

    if (symbol_name !== undefined) {
      updateFields.push("symbol_name=?");
      updateParams.push(symbol_name);
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