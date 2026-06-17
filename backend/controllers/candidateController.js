const db = require("../config/db");
const { logAction } = require('../utils/auditLogger');

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
        photoPath = `/uploads/candidates/${school_code}/${election_id}/photos/${req.files.photo[0].filename}`;
      }
      if (req.files.symbol) {
        symbolPath = `/uploads/candidates/${school_code}/${election_id}/symbols/${req.files.symbol[0].filename}`;
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
      symbol_name || null, 'APPROVED'
    ];

    console.log("Candidate Insert Params:", insertParams);

    const [result] = await db.execute(
      `INSERT INTO candidates (school_id, election_id, voter_id, post_id, photo, symbol, symbol_name, status) VALUES (?,?,?,?,?,?,?,?)`,
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
        sections.name AS section_name,
        candidates.photo,
        candidates.symbol,
        candidates.symbol_name,
        candidates.status,
        posts.name AS post_name,
        posts.priority AS post_priority
      FROM candidates
      JOIN voters ON candidates.voter_id = voters.id
      LEFT JOIN classes ON voters.class_id = classes.id
      LEFT JOIN sections ON classes.section_id = sections.id
      JOIN posts ON candidates.post_id = posts.id
      WHERE candidates.school_id=? AND candidates.election_id=?`;
    
    const { status } = req.query;
    const params = [school_id, election_id];

    if (status) {
      query += ` AND candidates.status=?`;
      params.push(status);
    } else {
      // Default to approved for the main candidates list
      query += ` AND candidates.status='APPROVED'`;
    }

    if (post_id && !isNaN(post_id)) {
      query += ` AND candidates.post_id=?`;
      params.push(post_id);
    }

    const { class_id, section_id, division } = req.query;
    if (class_id) {
      query += ` AND voters.class_id=?`;
      params.push(class_id);
    }
    if (section_id) {
      query += ` AND classes.section_id=?`;
      params.push(section_id);
    }
    if (division) {
      query += ` AND voters.division=?`;
      params.push(division);
    }

    query += ` ORDER BY posts.priority ASC, candidate_name ASC`;

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
      LEFT JOIN classes ON voters.class_id = classes.id
      LEFT JOIN sections ON classes.section_id = sections.id
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

exports.getEligiblePosts = async (req, res) => {
  try {
    const { election_id, admission_no } = req.query;

    if (!election_id || !admission_no) {
      return res.status(400).json({ message: "Election ID and Admission No are required" });
    }

    const [electionRows] = await db.execute(
      "SELECT nomination_open, status FROM elections WHERE id = ?",
      [election_id]
    );

    if (electionRows.length === 0) {
      return res.status(404).json({ message: "Election not found" });
    }

    if (!electionRows[0].nomination_open) {
      return res.status(403).json({ message: "Nominations are currently closed for this election." });
    }

    const [voterRows] = await db.execute(
      "SELECT id, class_id, sex, name FROM voters WHERE election_id = ? AND admission_no = ?",
      [election_id, admission_no]
    );

    if (voterRows.length === 0) {
      return res.status(404).json({ message: "Student record not found for this election." });
    }

    const voter = voterRows[0];

    const [postRows] = await db.execute(
      "SELECT id, name, gender_rule, candidate_classes FROM posts WHERE election_id = ?",
      [election_id]
    );

    const eligiblePosts = postRows.filter(post => {
      let classes = [];
      try {
        classes = JSON.parse(post.candidate_classes || "[]").map(Number);
      } catch (e) {
        classes = [];
      }
      const classMatch = classes.includes(Number(voter.class_id));
      const genderMatch = post.gender_rule === "ANY" || post.gender_rule === voter.sex;
      return classMatch && genderMatch;
    });

    res.json({
      student_name: voter.name,
      voter_id: voter.id,
      posts: eligiblePosts
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.selfNominate = async (req, res) => {
  try {
    const { election_id, admission_no, post_id, symbol_name } = req.body;

    const [electionRows] = await db.execute(
      "SELECT nomination_open, school_id FROM elections WHERE id = ?",
      [election_id]
    );

    if (electionRows.length === 0 || !electionRows[0].nomination_open) {
      return res.status(403).json({ message: "Nomination window is closed." });
    }

    const school_id = electionRows[0].school_id;

    const [voterRows] = await db.execute(
      "SELECT id, name FROM voters WHERE election_id = ? AND admission_no = ?",
      [election_id, admission_no]
    );

    if (voterRows.length === 0) {
      return res.status(404).json({ message: "Voter not found" });
    }

    const voter_id = voterRows[0].id;

    const [existing] = await db.execute(
      "SELECT id FROM candidates WHERE voter_id = ? AND election_id = ?",
      [voter_id, election_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "You have already submitted a nomination." });
    }

    let photoPath = null;
    let symbolPath = null;
    
    const [sRows] = await db.execute("SELECT code FROM schools WHERE id = ?", [school_id]);
    if (sRows.length === 0) {
        return res.status(500).json({ message: "School configuration error" });
    }
    const school_code = sRows[0].code;

    if (req.files) {
      if (req.files.photo) {
        const photoFile = req.files.photo[0];
        photoPath = req.user 
          ? `/uploads/candidates/${school_code}/${election_id}/photos/${photoFile.filename}`
          : `/uploads/public/${election_id}/photos/${photoFile.filename}`;
      }
      if (req.files.symbol) {
        const symbolFile = req.files.symbol[0];
        symbolPath = req.user
          ? `/uploads/candidates/${school_code}/${election_id}/symbols/${symbolFile.filename}`
          : `/uploads/public/${election_id}/symbols/${symbolFile.filename}`;
      }
    }

    await db.execute(
      `INSERT INTO candidates (school_id, election_id, voter_id, post_id, photo, symbol, symbol_name, status) 
       VALUES (?,?,?,?,?,?,?, 'PENDING')`,
      [school_id, election_id, voter_id, post_id, photoPath, symbolPath, symbol_name]
    );

    res.json({ message: "Nomination submitted successfully! It is now pending approval." });
  } catch (error) {
    console.error("Nomination submission error:", error);
    res.status(500).json({ message: "Server error during submission", error: error.message });
  }
};

exports.updateCandidateStatus = async (req, res) => {
  try {
    const { candidate_id } = req.params;
    const { status } = req.body;
    const school_id = req.user.school_id;

    if (!['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
       return res.status(400).json({ message: "Invalid status" });
    }

    if (status === 'REJECTED') {
      const [existing] = await db.execute(
        `SELECT photo, symbol FROM candidates WHERE id = ? AND school_id = ?`,
        [candidate_id, school_id]
      );
      
      if (existing.length > 0) {
        const { photo, symbol } = existing[0];
        const fs = require("fs");
        const path = require("path");
        
        try {
          if (photo) {
            const photoPath = path.join(__dirname, "..", photo);
            if (fs.existsSync(photoPath)) fs.unlinkSync(photoPath);
          }
          if (symbol) {
            const symbolPath = path.join(__dirname, "..", symbol);
            if (fs.existsSync(symbolPath)) fs.unlinkSync(symbolPath);
          }
        } catch (err) {
          console.error("Error deleting files on rejection:", err);
        }

        await db.execute(
          `UPDATE candidates SET status = ?, photo = NULL, symbol = NULL WHERE id = ? AND school_id = ?`,
          [status, candidate_id, school_id]
        );
      }
    } else {
      await db.execute(
        `UPDATE candidates SET status = ? WHERE id = ? AND school_id = ?`,
        [status, candidate_id, school_id]
      );
    }

    res.json({ message: `Candidate ${status.toLowerCase()} successfully` });

    // Fire audit log after response
    const [candInfo] = await db.execute(
      `SELECT v.name, v.admission_no FROM candidates c JOIN voters v ON c.voter_id = v.id WHERE c.id = ?`,
      [candidate_id]
    );
    logAction({
      school_id,
      user_id: req.user.id,
      user_name: req.user.name || req.user.email,
      role: req.user.role,
      action: status === 'APPROVED' ? 'APPROVE_CANDIDATE' : status === 'REJECTED' ? 'REJECT_CANDIDATE' : 'UPDATE_CANDIDATE_STATUS',
      entity_type: 'Candidate',
      entity_name: candInfo[0]?.name || `Candidate #${candidate_id}`,
      details: { candidate_id, new_status: status, admission_no: candInfo[0]?.admission_no }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
exports.getNominations = async (req, res) => {
  try {
    const school_id = req.user.school_id;
    const { election_id } = req.query;

    if (!election_id) {
       return res.status(400).json({ message: "Election ID required" });
    }

    const [rows] = await db.execute(`
      SELECT 
        candidates.id,
        voters.name AS candidate_name,
        voters.admission_no,
        posts.name AS post_name,
        candidates.created_at,
        candidates.status,
        candidates.photo,
        candidates.symbol_name,
        classes.name AS class_name,
        sections.name AS section_name
      FROM candidates
      JOIN voters ON candidates.voter_id = voters.id
      JOIN posts ON candidates.post_id = posts.id
      LEFT JOIN classes ON voters.class_id = classes.id
      LEFT JOIN sections ON classes.section_id = sections.id
      WHERE candidates.school_id = ? AND candidates.election_id = ? AND candidates.status = 'PENDING'
      ORDER BY candidates.created_at DESC
    `, [school_id, election_id]);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
