const db = require("../config/db");


exports.createCandidate = async (req, res) => {

 try {

  const school_id = req.user.school_id;

  const { election_id, admission_no, post_id } = req.body;


  /* 1️⃣ find voter by admission number */

  const [voterRows] = await db.execute(
   `SELECT id, class_id, sex
    FROM voters
    WHERE admission_no=? AND election_id=?`,
   [admission_no, election_id]
  );

  if (voterRows.length === 0) {

   return res.status(400).json({
    message: "Voter not found"
   });

  }

  const voter_id = voterRows[0].id;
  const voterClass = voterRows[0].class_id;
  const voterSex = voterRows[0].sex;


  /* 2️⃣ get post rules */

  const [postRows] = await db.execute(
   `SELECT candidate_classes, gender_rule
    FROM posts
    WHERE id=? AND election_id=?`,
   [post_id, election_id]
  );

  if (postRows.length === 0) {

   return res.status(400).json({
    message: "Post not found"
   });

  }

  const candidateClasses = JSON.parse(postRows[0].candidate_classes || "[]");
  const genderRule = postRows[0].gender_rule;


  /* 3️⃣ check class eligibility */

  if (!candidateClasses.includes(voterClass)) {

   return res.status(400).json({
    message: "This class is not eligible for this post"
   });

  }


  /* 4️⃣ check gender eligibility */

  if (genderRule !== "ANY" && voterSex !== genderRule) {

   return res.status(400).json({
    message: "Gender not eligible for this post"
   });

  }


  /* 5️⃣ prevent multiple candidacy */

  const [existingCandidate] = await db.execute(
   `SELECT id
    FROM candidates
    WHERE voter_id=? AND election_id=?`,
   [voter_id, election_id]
  );

  if (existingCandidate.length > 0) {

   return res.status(400).json({
    message: "This voter is already a candidate"
   });

  }


  /* 6️⃣ handle uploaded files (photo and symbol) */
  let photoPath = null;
  let symbolPath = null;
  const school_code = req.user.school_code || `school_${req.user.school_id}`;

  if (req.files) {
    if (req.files.photo) {
      photoPath = `/uploads/candidates/${school_code}/${election_id}/photos/photo-${admission_no}.jpg`;
    }
    if (req.files.symbol) {
      symbolPath = `/uploads/candidates/${school_code}/${election_id}/symbols/symbol-${admission_no}.png`;
    }
  }


  /* 7️⃣ create candidate */

  const [result] = await db.execute(
   `INSERT INTO candidates
    (school_id,election_id,voter_id,post_id,photo,symbol)
    VALUES (?,?,?,?,?,?)`,
   [
    school_id,
    election_id,
    voter_id,
    post_id,
    photoPath,
    symbolPath
   ]
  );


  res.json({
   message: "Candidate created successfully",
   candidate_id: result.insertId,
   photo: photoPath,
   symbol: symbolPath
  });


 } catch (error) {

  console.error(error);

  res.status(500).json({
   message: error.message || "Server error"
  });

 }

};
exports.getCandidates = async (req, res) => {
 try {
  const school_id = req.user.school_id;
  const { election_id } = req.query;

  // Validate election_id
  if (!election_id || isNaN(election_id)) {
    return res.status(400).json({
      message: "Valid election_id is required"
    });
  }

  const [rows] = await db.execute(
   `SELECT
     candidates.id AS candidate_id,
     voters.admission_no,
     voters.name,
     voters.sex AS gender,
     classes.name AS class,
     posts.name AS post,
     candidates.photo,
     candidates.symbol
    FROM candidates
    JOIN voters ON candidates.voter_id = voters.id
    JOIN classes ON voters.class_id = classes.id
    JOIN posts ON candidates.post_id = posts.id
    WHERE candidates.school_id=? 
    AND candidates.election_id=?
    ORDER BY voters.name ASC`
   , [school_id, election_id]
  );

  res.json(rows);

 } catch (error) {
  console.error(error);
  res.status(500).json({
   message: "Server error",
   error: error.message
  });
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
   return res.status(404).json({
    message: "Candidate not found"
   });
  }

  res.json(rows[0]);

 } catch (error) {
  console.error(error);
  res.status(500).json({
   message: "Server error",
   error: error.message
  });
 }
};

exports.updateCandidate = async (req, res) => {
 try {
  const school_id = req.user.school_id;
  const { candidate_id } = req.params;
  const { post_id } = req.body;

  const [existing] = await db.execute(
   `SELECT voter_id, election_id FROM candidates WHERE id=? AND school_id=?`,
   [candidate_id, school_id]
  );

  if (existing.length === 0) {
   return res.status(404).json({
    message: "Candidate not found"
   });
  }

  const voter_id = existing[0].voter_id;
  const election_id = existing[0].election_id;

  if (post_id) {
   // Get voter details
   const [voterRows] = await db.execute(
    `SELECT class_id, sex FROM voters WHERE id=?`,
    [voter_id]
   );

   // Get post rules
   const [postRows] = await db.execute(
    `SELECT candidate_classes, gender_rule FROM posts WHERE id=? AND election_id=?`,
    [post_id, election_id]
   );

   if (postRows.length === 0) {
    return res.status(400).json({
     message: "Post not found"
    });
   }

   const candidateClasses = JSON.parse(postRows[0].candidate_classes || "[]");
   const genderRule = postRows[0].gender_rule;

   if (!candidateClasses.includes(voterRows[0].class_id)) {
    return res.status(400).json({
     message: "This class is not eligible for this post"
    });
   }

   if (genderRule !== "ANY" && voterRows[0].sex !== genderRule) {
    return res.status(400).json({
     message: "Gender not eligible for this post"
    });
   }

   await db.execute(
    `UPDATE candidates SET post_id=? WHERE id=?`,
    [post_id, candidate_id]
   );
  }

  res.json({
   message: "Candidate updated successfully"
  });

 } catch (error) {
  console.error(error);
  res.status(500).json({
   message: "Server error",
   error: error.message
  });
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
   return res.status(404).json({
    message: "Candidate not found"
   });
  }

  const { photo, symbol } = existing[0];

  await db.execute(
   `DELETE FROM candidates WHERE id=? AND school_id=?`,
   [candidate_id, school_id]
  );

  // Delete files from disk
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

  res.json({
   message: "Candidate deleted successfully"
  });

 } catch (error) {
  console.error(error);
  res.status(500).json({
   message: "Server error",
   error: error.message
  });
 }
};