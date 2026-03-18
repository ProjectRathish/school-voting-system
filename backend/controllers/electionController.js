const db = require("../config/db");
const fs = require("fs");
const path = require("path");


/*
--------------------------------
CREATE ELECTION
--------------------------------
*/

exports.createElection = async (req, res) => {

  try {

    const { name, start_time, end_time } = req.body;

    const school_id = req.user.school_id;
    const created_by = req.user.id;

    if (!name) {
      return res.status(400).json({
        message: "Election name required"
      });
    }

    const [result] = await db.execute(
      `INSERT INTO elections
       (school_id, name, start_time, end_time, created_by)
       VALUES (?,?,?,?,?)`,
      [school_id, name, start_time, end_time, created_by]
    );

    res.json({
      message: "Election created successfully",
      election_id: result.insertId
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error"
    });

  }

};



/*
--------------------------------
GET ALL ELECTIONS (School Admin)
--------------------------------
*/

exports.getElections = async (req, res) => {

  try {

    const school_id = req.user.school_id;

    const [rows] = await db.execute(
      `SELECT *
       FROM elections
       WHERE school_id = ?
       ORDER BY created_at DESC`,
      [school_id]
    );

    res.json(rows);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error"
    });

  }

};



/*
--------------------------------
GET SINGLE ELECTION
--------------------------------
*/

exports.getElection = async (req, res) => {

  try {

    const { id } = req.params;

    const school_id = req.user.school_id;

    const [rows] = await db.execute(
      `SELECT *
       FROM elections
       WHERE id = ?
       AND school_id = ?`,
      [id, school_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Election not found"
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



exports.updateElection = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, start_time, end_time } = req.body;
    const school_id = req.user.school_id;

    if (!name) {
      return res.status(400).json({ message: "Election name required" });
    }

    const [result] = await db.execute(
      `UPDATE elections 
       SET name = ?, start_time = ?, end_time = ?
       WHERE id = ? AND school_id = ?`,
      [name, start_time, end_time, id, school_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Election not found" });
    }

    res.json({ message: "Election updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/*
--------------------------------
UPDATE ELECTION STATUS
--------------------------------
*/


exports.updateElectionStatus = async (req, res) => {

  try {

    const { id } = req.params;
    const { status, confirmation_text } = req.body;

    const school_id = req.user.school_id;

    const allowed = [
      "DRAFT",
      "CONFIGURING",
      "READY",
      "ACTIVE",
      "PAUSED",
      "CLOSED"
    ];

    if (!allowed.includes(status)) {
      return res.status(400).json({
        message: "Invalid status"
      });
    }

    // If setting to CONFIGURING, reset any other CONFIGURING election to DRAFT
    if (status === 'CONFIGURING') {
      await db.execute(
        `UPDATE elections SET status = 'DRAFT' 
         WHERE school_id = ? AND status = 'CONFIGURING' AND id != ?`,
        [school_id, id]
      );
    }


    // Require thorough confirmation when attempting to finalize/close an election
    if (status === 'CLOSED') {
      const [electionRows] = await db.execute(
        "SELECT name, status FROM elections WHERE id = ? AND school_id = ?",
        [id, school_id]
      );

      if (electionRows.length === 0) {
        return res.status(404).json({ message: "Election not found" });
      }

      if (electionRows[0].status === 'CLOSED') {
        return res.status(400).json({ message: "Election is already closed." });
      }

      if (!confirmation_text || confirmation_text.trim() !== electionRows[0].name.trim()) {
        return res.status(400).json({
          message: "Confirmation failed. To close the election, you must type the exact election name.",
          expected_confirmation_text: electionRows[0].name
        });
      }
    }

    const [result] = await db.execute(
      `UPDATE elections
       SET status = ?
       WHERE id = ?
       AND school_id = ?`,
      [status, id, school_id]
    );

    res.json({
      message: "Election status updated"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error"
    });

  }

};

/*
--------------------------------
DELETE ELECTION
--------------------------------
*/

exports.deleteElection = async (req, res) => {

  try {

    const { id } = req.params;
    const school_id = req.user.school_id;

    const [existing] = await db.execute(
      `SELECT id FROM elections WHERE id = ? AND school_id = ?`,
      [id, school_id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        message: "Election not found"
      });
    }

    // Get school code for folder path
    const [schoolRows] = await db.execute("SELECT code FROM schools WHERE id = ?", [school_id]);
    const school_code = schoolRows.length > 0 ? schoolRows[0].code : null;

    await db.execute(
      `DELETE FROM elections WHERE id = ? AND school_id = ?`,
      [id, school_id]
    );

    // Delete files
    if (school_code) {
      try {
        const electDir = path.join(__dirname, "../uploads/candidates", school_code, String(id));
        if (fs.existsSync(electDir)) {
          fs.rmSync(electDir, { recursive: true, force: true });
          console.log(`Deleted election folder: ${electDir}`);
        }
      } catch (fileErr) {
        console.error("Error deleting election files:", fileErr);
      }
    }

    res.json({
      message: "Election deleted successfully"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error"
    });

  }

};

/*
--------------------------------
GET ELECTION RESULTS
--------------------------------
*/

exports.getResults = async (req, res) => {
  try {
    const { id } = req.params;
    const school_id = req.user.school_id;

    // Verify election exists
    const [electionResults] = await db.execute(
      `SELECT id, name, status FROM elections WHERE id = ? AND school_id = ?`,
      [id, school_id]
    );

    if (electionResults.length === 0) {
      return res.status(404).json({ message: "Election not found" });
    }

    const election = electionResults[0];

    // Enforce After-Election-Only Results for Schools
    if (election.status !== 'CLOSED') {
      return res.status(403).json({ message: "Results can only be generated after the election status is marked as CLOSED." });
    }

    // Get Voter Turnout Stats
    const [turnout] = await db.execute(
      `SELECT COUNT(*) as total_voters, SUM(CASE WHEN has_voted = 1 THEN 1 ELSE 0 END) as voted_count
       FROM voters
       WHERE election_id = ? AND school_id = ?`,
      [id, school_id]
    );

    const totalVoters = turnout[0].total_voters || 0;
    const votedCount = Number(turnout[0].voted_count) || 0;
    const turnoutPercentage = totalVoters > 0 ? ((votedCount / totalVoters) * 100).toFixed(2) : 0;

    // Get results per post
    const [rawResults] = await db.execute(
      `SELECT 
         p.id as post_id,
         p.name as post_name,
         c.id as candidate_id,
         u.name as candidate_name,
         c.photo,
         c.symbol,
         COUNT(v.id) as vote_count
       FROM posts p
       LEFT JOIN candidates c ON c.post_id = p.id
       LEFT JOIN voters u ON c.voter_id = u.id
       LEFT JOIN votes v ON v.candidate_id = c.id
       WHERE p.election_id = ? AND p.school_id = ?
       GROUP BY p.id, c.id
       ORDER BY p.id ASC, vote_count DESC`,
      [id, school_id]
    );

    // Format results to group by post
    const postsMap = new Map();

    rawResults.forEach(row => {
      if (!postsMap.has(row.post_id)) {
        postsMap.set(row.post_id, {
          post_id: row.post_id,
          post_name: row.post_name,
          total_votes: 0,
          candidates: []
        });
      }

      const postEntry = postsMap.get(row.post_id);
      
      if (row.candidate_id) { // Only add if candidate exists for the post
        postEntry.candidates.push({
          candidate_id: row.candidate_id,
          candidate_name: row.candidate_name,
          photo: row.photo,
          symbol: row.symbol,
          votes: row.vote_count
        });
        postEntry.total_votes += row.vote_count;
      }
    });

    const resultsByPost = Array.from(postsMap.values());

    res.json({
      message: "Election results retrieved successfully",
      election: {
        id: election.id,
        name: election.name,
        status: election.status
      },
      statistics: {
        total_voters: totalVoters,
        voted_count: votedCount,
        turnout_percentage: parseFloat(turnoutPercentage)
      },
      results: resultsByPost
    });

  } catch (error) {
    console.error("Error fetching election results:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getTurnout = async (req, res) => {
  try {
    const { id } = req.params;
    const school_id = req.user.school_id;

    // Overall turnout
    const [turnout] = await db.execute(
      `SELECT COUNT(*) as total_voters, SUM(CASE WHEN has_voted = 1 THEN 1 ELSE 0 END) as voted_count
       FROM voters
       WHERE election_id = ? AND school_id = ?`,
      [id, school_id]
    );

    const totalVoters = turnout[0].total_voters || 0;
    const votedCount = Number(turnout[0].voted_count) || 0;
    const turnoutPercentage = totalVoters > 0 ? ((votedCount / totalVoters) * 100).toFixed(2) : 0;

    // Class-wise turnout
    const [classTurnout] = await db.execute(
      `SELECT c.name as class_name, COUNT(v.id) as total, SUM(CASE WHEN v.has_voted = 1 THEN 1 ELSE 0 END) as voted
       FROM voters v
       JOIN classes c ON v.class_id = c.id
       WHERE v.election_id = ? AND v.school_id = ?
       GROUP BY v.class_id
       ORDER BY c.name ASC`,
      [id, school_id]
    );

    // Gender turnout
    const [genderTurnout] = await db.execute(
      `SELECT sex, COUNT(*) as total, SUM(CASE WHEN has_voted = 1 THEN 1 ELSE 0 END) as voted
       FROM voters
       WHERE election_id = ? AND school_id = ?
       GROUP BY sex`,
      [id, school_id]
    );

    res.json({
      summary: {
        total_voters: totalVoters,
        voted_count: votedCount,
        turnout_percentage: parseFloat(turnoutPercentage)
      },
      class_breakdown: classTurnout,
      gender_breakdown: genderTurnout
    });

  } catch (error) {
    console.error("Error fetching turnout analytics:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/*
--------------------------------
GET ELECTION DETAILED RESULTS (Analysis)
--------------------------------
*/

exports.getDetailedResults = async (req, res) => {
  try {
    const { id } = req.params;
    const school_id = req.user.school_id;

    // Verify election exists
    const [electionResults] = await db.execute(
      `SELECT id, name, status FROM elections WHERE id = ? AND school_id = ?`,
      [id, school_id]
    );

    if (electionResults.length === 0) {
      return res.status(404).json({ message: "Election not found" });
    }

    const election = electionResults[0];

    // Enforce After-Election-Only Results for Schools
    if (election.status !== 'CLOSED') {
      return res.status(403).json({ message: "Detailed analytics can only be generated after the election status is marked as CLOSED." });
    }

    // Get voting breakdowns per candidate
    const [rawResults] = await db.execute(
      `SELECT 
         p.id as post_id,
         p.name as post_name,
         c.id as candidate_id,
         u.name as candidate_name,
         v.voter_sex,
         cl.name as class_name,
         s.name as section_name,
         COUNT(v.id) as vote_count
       FROM posts p
       JOIN candidates c ON c.post_id = p.id
       JOIN voters u ON c.voter_id = u.id
       JOIN votes v ON v.candidate_id = c.id
       LEFT JOIN classes cl ON v.voter_class_id = cl.id
       LEFT JOIN sections s ON v.voter_section_id = s.id
       WHERE p.election_id = ? AND p.school_id = ?
       GROUP BY p.id, c.id, v.voter_sex, v.voter_class_id, v.voter_section_id
       ORDER BY p.id ASC, candidate_id ASC`,
      [id, school_id]
    );

    // Structure the data for easy charting
    const postsMap = new Map();

    rawResults.forEach(row => {
      if (!postsMap.has(row.post_id)) {
        postsMap.set(row.post_id, {
          post_id: row.post_id,
          post_name: row.post_name,
          candidates: new Map()
        });
      }

      const postEntry = postsMap.get(row.post_id);
      
      if (!postEntry.candidates.has(row.candidate_id)) {
        postEntry.candidates.set(row.candidate_id, {
          candidate_id: row.candidate_id,
          candidate_name: row.candidate_name,
          total_votes: 0,
          demographics: {
            male_votes: 0,
            female_votes: 0,
            classes: {},
            sections: {}
          }
        });
      }

      const candidateEntry = postEntry.candidates.get(row.candidate_id);
      
      // Update totals
      candidateEntry.total_votes += row.vote_count;
      
      // Update gender breakdown
      if (row.voter_sex === 'M') {
         candidateEntry.demographics.male_votes += row.vote_count;
      } else if (row.voter_sex === 'F') {
         candidateEntry.demographics.female_votes += row.vote_count;
      }
      
      // Update class breakdown
      const className = row.class_name || 'Unknown Class';
      if (!candidateEntry.demographics.classes[className]) {
         candidateEntry.demographics.classes[className] = 0;
      }
      candidateEntry.demographics.classes[className] += row.vote_count;

      // Update section breakdown
      const sectionName = row.section_name || 'Unknown Section';
      if (!candidateEntry.demographics.sections[sectionName]) {
         candidateEntry.demographics.sections[sectionName] = 0;
      }
      candidateEntry.demographics.sections[sectionName] += row.vote_count;
    });

    // Convert Maps back to cleanly parsed arrays for JSON response
    const formattedResults = Array.from(postsMap.values()).map(post => {
       return {
          post_id: post.post_id,
          post_name: post.post_name,
          candidates: Array.from(post.candidates.values())
       };
    });

    res.json({
      message: "Detailed election analytics retrieved successfully",
      election: electionResults[0],
      analytics: formattedResults
    });

  } catch (error) {
    console.error("Error fetching detailed results:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/*
--------------------------------
EXPORT ELECTION RESULTS TO EXCEL
--------------------------------
*/

exports.exportResults = async (req, res) => {
  try {
    const { id } = req.params;
    const school_id = req.user.school_id;
    const ExcelJS = require('exceljs');

    const [electionResults] = await db.execute(
      `SELECT id, name, status FROM elections WHERE id = ? AND school_id = ?`,
      [id, school_id]
    );

    if (electionResults.length === 0) {
      return res.status(404).json({ message: "Election not found" });
    }

    const election = electionResults[0];

    // Enforce After-Election-Only Results for Schools
    if (election.status !== 'CLOSED') {
      return res.status(403).json({ message: "Exporting results is only permitted after the election relies is marked as CLOSED." });
    }

    const [rawResults] = await db.execute(
      `SELECT 
         p.name as post_name,
         u.name as candidate_name,
         COUNT(v.id) as vote_count
       FROM posts p
       JOIN candidates c ON c.post_id = p.id
       JOIN voters u ON c.voter_id = u.id
       JOIN votes v ON v.candidate_id = c.id
       WHERE p.election_id = ? AND p.school_id = ?
       GROUP BY p.id, c.id
       ORDER BY p.id ASC, vote_count DESC`,
      [id, school_id]
    );

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'School Voting System';
    
    const sheet = workbook.addWorksheet('Election Results');

    sheet.columns = [
      { header: 'Post Name', key: 'post_name', width: 30 },
      { header: 'Candidate Name', key: 'candidate_name', width: 30 },
      { header: 'Total Votes', key: 'vote_count', width: 15 }
    ];

    // Styling the header row
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0052cc' } // A nice blue header
    };

    rawResults.forEach(row => {
      sheet.addRow(row);
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${election.name.replace(/[^a-z0-9]/gi, '_')}_Results.xlsx"`
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error("Error exporting results:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/*
--------------------------------
BOOTH OFFICER ASSIGNMENTS
--------------------------------
*/

exports.getAssignments = async (req, res) => {
  try {
    const { id } = req.params;
    const school_id = req.user.school_id;

    const [rows] = await db.execute(
      `SELECT a.id, a.user_id, a.booth_id, u.username, b.booth_number
       FROM election_officer_assignments a
       JOIN users u ON a.user_id = u.id
       JOIN polling_booths b ON a.booth_id = b.id
       WHERE a.election_id = ? AND u.school_id = ?`,
      [id, school_id]
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.assignOfficer = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, booth_id } = req.body;
    const school_id = req.user.school_id;

    // Verify user belongs to school and is a booth officer
    const [userRows] = await db.execute(
      "SELECT id FROM users WHERE id=? AND school_id=? AND role='BOOTH_OFFICER'",
      [user_id, school_id]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: "Booth officer not found in your school" });
    }

    // Verify booth belongs to this election
    const [boothRows] = await db.execute(
      "SELECT id FROM polling_booths WHERE id=? AND election_id=? AND school_id=?",
      [booth_id, id, school_id]
    );

    if (boothRows.length === 0) {
      return res.status(404).json({ message: "Booth not found in this election" });
    }

    // Upsert assignment (Unique on election_id, user_id)
    await db.execute(
      `INSERT INTO election_officer_assignments (election_id, user_id, booth_id)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE booth_id = VALUES(booth_id)`,
      [id, user_id, booth_id]
    );

    res.json({ message: "Officer assigned successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.unassignOfficer = async (req, res) => {
  try {
    const { id, user_id } = req.params;
    const school_id = req.user.school_id;

    // Verify user belongs to school
    const [userRows] = await db.execute(
      "SELECT id FROM users WHERE id=? AND school_id=?",
      [user_id, school_id]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    await db.execute(
      "DELETE FROM election_officer_assignments WHERE election_id=? AND user_id=?",
      [id, user_id]
    );

    res.json({ message: "Officer unassigned successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};