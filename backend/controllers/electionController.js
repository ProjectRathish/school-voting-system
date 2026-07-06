const db = require("../config/db");
const fs = require("fs");
const path = require("path");
const { logAction } = require('../utils/auditLogger');


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

    // 1. Get School Code
    const [schoolRows] = await db.execute("SELECT code FROM schools WHERE id = ?", [school_id]);
    if (schoolRows.length === 0) {
      return res.status(404).json({ message: "School not found" });
    }
    const school_code = schoolRows[0].code;

    // 2. Fetch School Plan Limits
    const [schoolInfo] = await db.execute(`
      SELECT s.custom_max_elections, p.max_elections 
      FROM schools s
      LEFT JOIN subscription_plans p ON s.plan_id = p.id
      WHERE s.id = ?
    `, [school_id]);

    const maxElections = (schoolInfo[0]?.custom_max_elections !== null && schoolInfo[0]?.custom_max_elections !== undefined) 
      ? schoolInfo[0].custom_max_elections 
      : (schoolInfo[0]?.max_elections || 1); // Default to 1 if no plan found

    // 3. Count existing elections
    const [countRows] = await db.execute(
      "SELECT COUNT(*) as count FROM elections WHERE school_id = ?",
      [school_id]
    );

    if (countRows[0].count >= maxElections) {
      return res.status(403).json({ 
        message: `Election limit reached. Your current plan allows a maximum of ${maxElections} elections. Please upgrade your plan.` 
      });
    }

    const nextNumber = String(countRows[0].count + 1).padStart(3, '0');
    const election_code = `${school_code}-EL${nextNumber}`;

    const [result] = await db.execute(
      `INSERT INTO elections
       (school_id, name, start_time, end_time, created_by, election_code)
       VALUES (?,?,?,?,?,?)`,
      [school_id, name, start_time, end_time, created_by, election_code]
    );

    logAction({
      school_id,
      user_id: req.user.id,
      user_name: req.user.name || req.user.email,
      role: req.user.role,
      action: 'CREATE_ELECTION',
      entity_type: 'Election',
      entity_name: name,
      details: { election_code, election_id: result.insertId }
    });

    res.json({
      message: "Election created successfully",
      election_id: result.insertId,
      election_code: election_code
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



exports.getStats = async (req, res) => {
  try {
    const school_id = req.user.school_id;

    const [[{ totalElections }]] = await db.execute(
      "SELECT COUNT(*) as totalElections FROM elections WHERE school_id = ?",
      [school_id]
    );

    const [[{ totalVoters }]] = await db.execute(
      "SELECT COUNT(*) as totalVoters FROM voters WHERE school_id = ?",
      [school_id]
    );

    const [[{ totalCandidates }]] = await db.execute(
      "SELECT COUNT(*) as totalCandidates FROM candidates WHERE school_id = ?",
      [school_id]
    );

    const [[{ totalBooths }]] = await db.execute(
      "SELECT COUNT(*) as totalBooths FROM polling_booths WHERE school_id = ?",
      [school_id]
    );

    const [[{ totalMachines }]] = await db.execute(
      "SELECT COUNT(*) as totalMachines FROM voting_machines WHERE school_id = ?",
      [school_id]
    );

    const [[{ totalOfficers }]] = await db.execute(
      "SELECT COUNT(*) as totalOfficers FROM users WHERE school_id = ? AND role = 'BOOTH_OFFICER'",
      [school_id]
    );

    const [planInfo] = await db.execute(`
      SELECT s.plan_id,
             s.custom_max_voters, s.custom_max_elections,
             s.custom_max_booths, s.custom_max_machines, s.custom_max_officers,
             s.subscription_status, s.subscription_expiry,
             p.name as plan_name,
             p.max_voters, p.max_elections,
             p.max_booths, p.max_machines, p.max_officers
      FROM schools s
      JOIN subscription_plans p ON s.plan_id = p.id
      WHERE s.id = ?
    `, [school_id]);

    res.json({
      totalElections,
      totalVoters,
      totalCandidates,
      activeBooths: totalBooths,
      totalBooths,
      totalMachines,
      totalOfficers,
      plan: planInfo[0] || null
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
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


    // Require thorough confirmation when attempting to finalize/close or start an election
    if (status === 'CLOSED' || status === 'ACTIVE') {
      const [electionRows] = await db.execute(
        "SELECT name, status, election_code FROM elections WHERE id = ? AND school_id = ?",
        [id, school_id]
      );

      if (electionRows.length === 0) {
        return res.status(404).json({ message: "Election not found" });
      }

      if (status === 'CLOSED' && electionRows[0].status === 'CLOSED') {
        return res.status(400).json({ message: "Election is already closed." });
      }

      const expectedCode = electionRows[0].election_code;

      if (!confirmation_text || confirmation_text.trim() !== expectedCode) {
        return res.status(400).json({
          message: `Confirmation failed. To ${status === 'ACTIVE' ? 'start' : 'end'} the election, you must enter the correct election code.`,
          expected_confirmation_text: expectedCode
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

    // Fetch election name for the audit log
    const [elRows] = await db.execute('SELECT name FROM elections WHERE id = ?', [id]);
    logAction({
      school_id,
      user_id: req.user.id,
      user_name: req.user.name || req.user.email,
      role: req.user.role,
      action: `ELECTION_STATUS_${status}`,
      entity_type: 'Election',
      entity_name: elRows[0]?.name || `Election #${id}`,
      details: { election_id: id, new_status: status }
    });

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

    // Manual cascade deletion to avoid ER_ROW_IS_REFERENCED_2
    await db.execute("DELETE FROM votes WHERE election_id = ?", [id]);
    await db.execute("DELETE FROM candidates WHERE election_id = ?", [id]);
    await db.execute("DELETE FROM voters WHERE election_id = ?", [id]);
    await db.execute("DELETE FROM posts WHERE election_id = ?", [id]);
    await db.execute("DELETE FROM classes WHERE election_id = ?", [id]);
    await db.execute("DELETE FROM sections WHERE election_id = ?", [id]);
    await db.execute("DELETE FROM election_officer_assignments WHERE election_id = ?", [id]);

    // Fetch name before deletion for audit log
    const [nameRows] = await db.execute('SELECT name FROM elections WHERE id = ?', [id]);
    const electionName = nameRows[0]?.name || `Election #${id}`;

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

    logAction({
      school_id,
      user_id: req.user.id,
      user_name: req.user.name || req.user.email,
      role: req.user.role,
      action: 'DELETE_ELECTION',
      entity_type: 'Election',
      entity_name: electionName,
      details: { election_id: id }
    });

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

    if (election.status !== 'CLOSED') {
      return res.status(403).json({ message: "Results are only available for CLOSED elections." });
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
         p.allow_nota,
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
       GROUP BY p.id, p.name, p.allow_nota, c.id, u.name, c.photo, c.symbol
       ORDER BY p.id ASC, vote_count DESC`,
      [id, school_id]
    );

    // Get NOTA votes count per post
    const [notaResults] = await db.execute(
      `SELECT post_id, COUNT(*) as nota_count
       FROM votes
       WHERE election_id = ? AND school_id = ? AND candidate_id IS NULL
       GROUP BY post_id`,
      [id, school_id]
    );
    const notaMap = new Map(notaResults.map(r => [r.post_id, Number(r.nota_count)]));

    // Format results to group by post
    const postsMap = new Map();

    rawResults.forEach(row => {
      if (!postsMap.has(row.post_id)) {
        postsMap.set(row.post_id, {
          post_id: row.post_id,
          post_name: row.post_name,
          allow_nota: row.allow_nota,
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
          vote_count: row.vote_count
        });
        postEntry.total_votes += row.vote_count;
      }
    });

    // Mark posts with only 1 candidate as uncontested (they were skipped on the voting machine)
    const resultsByPost = Array.from(postsMap.values()).map(post => {
      const is_uncontested = post.candidates.length === 1;
      const notaCount = notaMap.get(post.post_id) || 0;

      if (!is_uncontested) {
        if (post.allow_nota !== 0) {
          post.candidates.push({
            candidate_id: -1,
            candidate_name: 'None of the Above (NOTA)',
            photo: null,
            symbol: null,
            vote_count: notaCount,
            is_nota: true
          });
          post.total_votes += notaCount;
        }
        post.candidates.sort((a, b) => b.vote_count - a.vote_count);
      }

      return {
        ...post,
        is_uncontested
      };
    });

    res.json({
      message: "Election results retrieved successfully",
      election: {
        id: election.id,
        name: election.name,
        status: election.status
      },
      turnout: {
        total_voters: totalVoters,
        votes_cast: votedCount,
        turnout_percentage: parseFloat(turnoutPercentage)
      },
      results: resultsByPost
    });

  } catch (error) {
    console.error("Error fetching election results:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getPublicResults = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the id parameter is numeric (database ID) or an election code
    const isNumeric = /^\d+$/.test(id);
    const queryField = isNumeric ? 'e.id' : 'e.election_code';

    // Verify election exists and fetch school info
    const [electionResults] = await db.execute(
      `SELECT e.id, e.name, e.status, s.name as school_name, s.logo as school_logo
       FROM elections e
       JOIN schools s ON e.school_id = s.id
       WHERE ${queryField} = ?`,
      [id]
    );

    if (electionResults.length === 0) {
      return res.status(404).json({ message: "Election not found" });
    }

    const election = electionResults[0];
    const numericElectionId = election.id;

    if (election.status !== 'CLOSED') {
      return res.status(403).json({ message: "Results are only available for CLOSED elections." });
    }

    // Get Voter Turnout Stats
    const [turnout] = await db.execute(
      `SELECT COUNT(*) as total_voters, SUM(CASE WHEN has_voted = 1 THEN 1 ELSE 0 END) as voted_count
       FROM voters
       WHERE election_id = ?`,
      [numericElectionId]
    );

    const totalVoters = turnout[0].total_voters || 0;
    const votedCount = Number(turnout[0].voted_count) || 0;
    const turnoutPercentage = totalVoters > 0 ? ((votedCount / totalVoters) * 100).toFixed(2) : 0;

    // Get results per post
    const [rawResults] = await db.execute(
      `SELECT 
         p.id as post_id,
         p.name as post_name,
         p.allow_nota,
         c.id as candidate_id,
         u.name as candidate_name,
         c.photo,
         c.symbol,
         c.symbol_name,
         COUNT(v.id) as vote_count
       FROM posts p
       LEFT JOIN candidates c ON c.post_id = p.id
       LEFT JOIN voters u ON c.voter_id = u.id
       LEFT JOIN votes v ON v.candidate_id = c.id
       WHERE p.election_id = ?
       GROUP BY p.id, p.name, p.allow_nota, c.id, u.name, c.photo, c.symbol, c.symbol_name
       ORDER BY p.id ASC, vote_count DESC`,
      [numericElectionId]
    );

    // Get NOTA votes count per post
    const [notaResults] = await db.execute(
      `SELECT post_id, COUNT(*) as nota_count
       FROM votes
       WHERE election_id = ? AND candidate_id IS NULL
       GROUP BY post_id`,
      [numericElectionId]
    );
    const notaMap = new Map(notaResults.map(r => [r.post_id, Number(r.nota_count)]));

    // Format results to group by post
    const postsMap = new Map();

    rawResults.forEach(row => {
      if (!postsMap.has(row.post_id)) {
        postsMap.set(row.post_id, {
          post_id: row.post_id,
          post_name: row.post_name,
          allow_nota: row.allow_nota,
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
          symbol_name: row.symbol_name,
          vote_count: row.vote_count
        });
        postEntry.total_votes += row.vote_count;
      }
    });

    // Mark posts with only 1 candidate as uncontested (they were skipped on the voting machine)
    const resultsByPost = Array.from(postsMap.values()).map(post => {
      const is_uncontested = post.candidates.length === 1;
      const notaCount = notaMap.get(post.post_id) || 0;

      if (!is_uncontested) {
        if (post.allow_nota !== 0) {
          post.candidates.push({
            candidate_id: -1,
            candidate_name: 'None of the Above (NOTA)',
            photo: null,
            symbol: null,
            symbol_name: 'nota',
            vote_count: notaCount,
            is_nota: true
          });
          post.total_votes += notaCount;
        }
        post.candidates.sort((a, b) => b.vote_count - a.vote_count);
      }

      return {
        ...post,
        is_uncontested
      };
    });

    res.json({
      message: "Public election results retrieved successfully",
      election: {
        id: election.id,
        name: election.name,
        status: election.status,
        school_name: election.school_name,
        school_logo: election.school_logo
      },
      turnout: {
        total_voters: totalVoters,
        votes_cast: votedCount,
        turnout_percentage: parseFloat(turnoutPercentage)
      },
      results: resultsByPost
    });

  } catch (error) {
    console.error("Error fetching public election results:", error);
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
       GROUP BY v.class_id, c.name
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

    if (election.status !== 'CLOSED') {
      return res.status(403).json({ message: "Detailed results are only available for CLOSED elections." });
    }

    // Get voting breakdowns per candidate
    const [rawResults] = await db.execute(
      `SELECT 
         p.id as post_id,
         p.name as post_name,
         p.allow_nota,
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
       GROUP BY p.id, p.name, p.allow_nota, c.id, u.name, v.voter_sex, v.voter_class_id, cl.name, v.voter_section_id, s.name
       ORDER BY p.id ASC, candidate_id ASC`,
      [id, school_id]
    );

    // Get voting breakdowns for NOTA (where candidate_id IS NULL)
    const [notaResults] = await db.execute(
      `SELECT 
         v.post_id,
         p.name as post_name,
         p.allow_nota,
         v.voter_sex,
         cl.name as class_name,
         s.name as section_name,
         COUNT(v.id) as vote_count
       FROM votes v
       JOIN posts p ON v.post_id = p.id
       LEFT JOIN classes cl ON v.voter_class_id = cl.id
       LEFT JOIN sections s ON v.voter_section_id = s.id
       WHERE v.election_id = ? AND v.school_id = ? AND v.candidate_id IS NULL
       GROUP BY v.post_id, p.name, p.allow_nota, v.voter_sex, v.voter_class_id, cl.name, v.voter_section_id, s.name`,
      [id, school_id]
    );

    // Structure the data for easy charting
    const postsMap = new Map();

    rawResults.forEach(row => {
      if (!postsMap.has(row.post_id)) {
        postsMap.set(row.post_id, {
          post_id: row.post_id,
          post_name: row.post_name,
          allow_nota: row.allow_nota,
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

    // Add NOTA demographics
    notaResults.forEach(row => {
      if (!postsMap.has(row.post_id)) {
        postsMap.set(row.post_id, {
          post_id: row.post_id,
          post_name: row.post_name,
          allow_nota: row.allow_nota,
          candidates: new Map()
        });
      }

      const postEntry = postsMap.get(row.post_id);

      if (postEntry.allow_nota !== 0) {
        const candidate_id = -1; // Denote NOTA

        if (!postEntry.candidates.has(candidate_id)) {
          postEntry.candidates.set(candidate_id, {
            candidate_id: candidate_id,
            candidate_name: 'None of the Above (NOTA)',
            total_votes: 0,
            is_nota: true,
            demographics: {
              male_votes: 0,
              female_votes: 0,
              classes: {},
              sections: {}
            }
          });
        }

        const candidateEntry = postEntry.candidates.get(candidate_id);
        
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
      }
    });

    // Convert Maps back to cleanly parsed arrays for JSON response and sort by total_votes descending
    const formattedResults = Array.from(postsMap.values()).map(post => {
       const candidatesList = Array.from(post.candidates.values());
       candidatesList.sort((a, b) => b.total_votes - a.total_votes);
       return {
          post_id: post.post_id,
          post_name: post.post_name,
          candidates: candidatesList
       };
    });

    // NEW: Get school-wide demographic breakdown for the charts
    const [overallStats] = await db.execute(
      `SELECT cl.name as class_name, 
              SUM(CASE WHEN v.sex = 'M' THEN 1 ELSE 0 END) as male_votes,
              SUM(CASE WHEN v.sex = 'F' THEN 1 ELSE 0 END) as female_votes
       FROM voters v
       JOIN classes cl ON v.class_id = cl.id
       WHERE v.election_id = ? AND v.school_id = ? AND v.has_voted = 1
       GROUP BY cl.id, cl.name
       ORDER BY cl.id ASC`,
      [id, school_id]
    );

    res.json({
      message: "Detailed election analytics retrieved successfully",
      election: { id: election.id, name: election.name },
      demographics: overallStats, // Flat array for the bar chart
      post_breakdown: formattedResults // Detailed per-candidate/post data
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
         p.id as post_id,
         p.name as post_name,
         p.allow_nota,
         c.id as candidate_id,
         u.name as candidate_name,
         COUNT(v.id) as vote_count
       FROM posts p
       LEFT JOIN candidates c ON c.post_id = p.id
       LEFT JOIN voters u ON c.voter_id = u.id
       LEFT JOIN votes v ON v.candidate_id = c.id
       WHERE p.election_id = ? AND p.school_id = ?
       GROUP BY p.id, p.name, p.allow_nota, c.id, u.name
       ORDER BY p.id ASC, vote_count DESC`,
      [id, school_id]
    );

    const [notaResults] = await db.execute(
      `SELECT post_id, COUNT(*) as nota_count
       FROM votes
       WHERE election_id = ? AND school_id = ? AND candidate_id IS NULL
       GROUP BY post_id`,
      [id, school_id]
    );
    const notaMap = new Map(notaResults.map(r => [r.post_id, Number(r.nota_count)]));

    const postsMap = new Map();
    rawResults.forEach(row => {
      if (!postsMap.has(row.post_id)) {
        postsMap.set(row.post_id, {
          post_name: row.post_name,
          allow_nota: row.allow_nota,
          candidates: []
        });
      }
      if (row.candidate_id) {
        postsMap.get(row.post_id).candidates.push({
          candidate_name: row.candidate_name,
          vote_count: Number(row.vote_count) || 0
        });
      }
    });

    const rowsToExport = [];
    postsMap.forEach((post, post_id) => {
      const candidates = post.candidates;
      const isContested = candidates.length > 1;
      if (isContested) {
        if (post.allow_nota !== 0) {
          const notaCount = notaMap.get(post_id) || 0;
          candidates.push({
            candidate_name: 'None of the Above (NOTA)',
            vote_count: notaCount
          });
        }
        candidates.sort((a, b) => b.vote_count - a.vote_count);
      }
      
      candidates.forEach(c => {
        rowsToExport.push({
          post_name: post.post_name,
          candidate_name: c.candidate_name,
          vote_count: c.vote_count
        });
      });
    });

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

    rowsToExport.forEach(row => {
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
       WHERE a.election_id = ? AND b.school_id = ?`,
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

    // Verify booth belongs to this school (now global)
    const [boothRows] = await db.execute(
      "SELECT id FROM polling_booths WHERE id=? AND school_id=?",
      [booth_id, school_id]
    );

    if (boothRows.length === 0) {
      return res.status(404).json({ message: "Booth not found in your school" });
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

exports.duplicateElection = async (req, res) => {
  let connection;
  try {
    const { id: originalElectionId } = req.params;
    const school_id = req.user.school_id;
    const created_by = req.user.id;
    
    // Options for selective cloning
    const { 
      name: newName, 
      start_time: newStartTime, 
      end_time: newEndTime,
      includeSections = false,
      includeClasses = false,
      includeVoters = false,
      includePosts = false,
      includeCandidates = false
    } = req.body || {};

    connection = await db.getConnection();
    await connection.beginTransaction();

    // 1. Get original election
    const [originalRows] = await connection.execute(
      "SELECT name, start_time, end_time FROM elections WHERE id = ? AND school_id = ?",
      [originalElectionId, school_id]
    );

    if (originalRows.length === 0) {
      if (connection) await connection.rollback();
      return res.status(404).json({ message: "Original election not found" });
    }

    const original = originalRows[0];

    // 2. Fetch School Plan Limits
    const [schoolInfo] = await connection.execute(`
      SELECT s.custom_max_elections, p.max_elections 
      FROM schools s
      LEFT JOIN subscription_plans p ON s.plan_id = p.id
      WHERE s.id = ?
    `, [school_id]);

    const maxElections = (schoolInfo[0]?.custom_max_elections !== null && schoolInfo[0]?.custom_max_elections !== undefined) 
      ? schoolInfo[0].custom_max_elections 
      : (schoolInfo[0]?.max_elections || 1);

    // 3. Count existing elections to generate new code and check limit
    const [countRows] = await connection.execute(
      "SELECT COUNT(*) as count FROM elections WHERE school_id = ?",
      [school_id]
    );

    if (countRows[0].count >= maxElections) {
      await connection.rollback();
      return res.status(403).json({ 
        message: `Election limit reached. Your current plan allows a maximum of ${maxElections} elections. Please upgrade your plan.` 
      });
    }

    const [schoolRows] = await connection.execute("SELECT code FROM schools WHERE id = ?", [school_id]);
    const school_code = schoolRows[0].code;
    const nextNumber = String(countRows[0].count + 1).padStart(3, '0');
    const election_code = `${school_code}-EL${nextNumber}`;

    // 4. Create new election (Status: DRAFT)
    const [elecResult] = await connection.execute(
      `INSERT INTO elections (school_id, name, start_time, end_time, created_by, election_code, status) 
       VALUES (?, ?, ?, ?, ?, ?, 'DRAFT')`,
      [
        school_id, 
        newName || `Copy of ${original.name}`, 
        newStartTime || original.start_time, 
        newEndTime || original.end_time, 
        created_by, 
        election_code
      ]
    );
    const newElectionId = elecResult.insertId;

    // Mapping maps to track old IDs to new IDs
    const sectionMap = new Map();
    const classMap = new Map();
    const voterMap = new Map();
    const postMap = new Map();

    // 5. Duplicate Sections (election-specific ones)
    if (includeSections) {
      const [sectionRows] = await connection.execute(
        "SELECT id, name FROM sections WHERE election_id = ? AND school_id = ?",
        [originalElectionId, school_id]
      );
      for (const s of sectionRows) {
        const [result] = await connection.execute(
          "INSERT INTO sections (school_id, election_id, name) VALUES (?, ?, ?)",
          [school_id, newElectionId, s.name]
        );
        sectionMap.set(s.id, result.insertId);
      }
    }

    // 6. Duplicate Classes (election-specific ones)
    if (includeClasses) {
      const [classRows] = await connection.execute(
        "SELECT id, name, section_id FROM classes WHERE election_id = ? AND school_id = ?",
        [originalElectionId, school_id]
      );
      for (const c of classRows) {
        const newSectionId = sectionMap.get(c.section_id) || null;
        const [result] = await connection.execute(
          "INSERT INTO classes (school_id, election_id, section_id, name) VALUES (?, ?, ?, ?)",
          [school_id, newElectionId, newSectionId, c.name]
        );
        classMap.set(c.id, result.insertId);
      }
    }

    // 7. Duplicate Voters
    if (includeVoters) {
      const [voterRows] = await connection.execute(
        "SELECT id, admission_no, name, class_id, sex, division, is_blocked FROM voters WHERE election_id = ? AND school_id = ?",
        [originalElectionId, school_id]
      );

      for (const v of voterRows) {
        // If class_id was election-specific, use new one; otherwise keep as is (global)
        const newClassId = classMap.get(v.class_id) || v.class_id;
        const [voterResult] = await connection.execute(
          `INSERT INTO voters (school_id, election_id, admission_no, name, class_id, sex, division, is_blocked) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [school_id, newElectionId, v.admission_no, v.name, newClassId, v.sex, v.division || null, v.is_blocked || 0]
        );
        voterMap.set(v.id, voterResult.insertId);
      }
    }

    // 8. Duplicate Posts
    if (includePosts) {
      const [postRows] = await connection.execute(
        "SELECT id, name, candidate_classes, voting_classes, gender_rule, priority FROM posts WHERE election_id = ? AND school_id = ?",
        [originalElectionId, school_id]
      );

      for (const p of postRows) {
        // Map class IDs in candidate_classes and voting_classes JSON arrays
        let candClasses = p.candidate_classes;
        let votClasses = p.voting_classes;

        try {
          if (typeof candClasses === 'string') candClasses = JSON.parse(candClasses);
          if (typeof votClasses === 'string') votClasses = JSON.parse(votClasses);
          
          if (Array.isArray(candClasses)) {
             candClasses = candClasses.map(id => classMap.get(id) || id);
          }
          if (Array.isArray(votClasses)) {
             votClasses = votClasses.map(id => classMap.get(id) || id);
          }
        } catch (e) {
          console.error("Error mapping classes for post:", e);
        }

        const [postResult] = await connection.execute(
          `INSERT INTO posts (school_id, election_id, name, candidate_classes, voting_classes, gender_rule, priority) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [school_id, newElectionId, p.name, JSON.stringify(candClasses), JSON.stringify(votClasses), p.gender_rule, p.priority || 0]
        );
        postMap.set(p.id, postResult.insertId);
      }
    }

    // 9. Duplicate Candidates
    if (includeCandidates && includeVoters && includePosts) {
      const [candRows] = await connection.execute(
        "SELECT voter_id, post_id, photo, symbol, symbol_name FROM candidates WHERE election_id = ? AND school_id = ?",
        [originalElectionId, school_id]
      );

      for (const c of candRows) {
        const newVoterId = voterMap.get(c.voter_id);
        const newPostId = postMap.get(c.post_id);

        if (newVoterId && newPostId) {
          await connection.execute(
            `INSERT INTO candidates (school_id, election_id, voter_id, post_id, photo, symbol, symbol_name) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [school_id, newElectionId, newVoterId, newPostId, c.photo, c.symbol, c.symbol_name]
          );
        }
      }
    }

    await connection.commit();
    res.json({ 
      message: "Election duplicated successfully", 
      election_id: newElectionId,
      election_code: election_code
    });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Duplicate Error:", error);
    res.status(500).json({ message: "Server error duplicating election", error: error.message });
  } finally {
    if (connection) connection.release();
  }
};

/**
 * Import Post Structure from another election
 */
exports.importPostStructure = async (req, res) => {
  try {
    const { target_election_id } = req.params;
    const { from_election_id } = req.body;
    const school_id = req.user.school_id;

    if (!from_election_id || !target_election_id) {
      return res.status(400).json({ message: "Missing election IDs" });
    }

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Verify source election belongs to school
      const [sourceElection] = await connection.execute(
        "SELECT id FROM elections WHERE id = ? AND school_id = ?",
        [from_election_id, school_id]
      );
      if (sourceElection.length === 0) {
        return res.status(403).json({ message: "Source election access denied" });
      }

      // Verify target election belongs to school
      const [targetElection] = await connection.execute(
        "SELECT id, status FROM elections WHERE id = ? AND school_id = ?",
        [target_election_id, school_id]
      );
      if (targetElection.length === 0) {
        return res.status(403).json({ message: "Target election access denied" });
      }

      if (targetElection[0].status !== 'DRAFT' && targetElection[0].status !== 'CONFIGURING') {
        return res.status(400).json({ message: "Can only import structure to an election in Draft/Configuring status" });
      }

      // Get posts from source
      const [posts] = await connection.execute(
        "SELECT name, candidate_classes, voting_classes, gender_rule FROM posts WHERE election_id = ?",
        [from_election_id]
      );

      if (posts.length === 0) {
        return res.status(400).json({ message: "Source election has no posts to import" });
      }

      // Fetch classes for source election
      const [sourceClasses] = await connection.execute(
        `SELECT c.id, c.name, s.name as section_name 
         FROM classes c 
         LEFT JOIN sections s ON c.section_id = s.id 
         WHERE c.election_id = ? AND c.school_id = ?`,
        [from_election_id, school_id]
      );

      // Fetch classes for target election
      const [targetClasses] = await connection.execute(
        `SELECT c.id, c.name, s.name as section_name 
         FROM classes c 
         LEFT JOIN sections s ON c.section_id = s.id 
         WHERE c.election_id = ? AND c.school_id = ?`,
        [target_election_id, school_id]
      );

      // Build mapping map
      const classMap = new Map();
      const targetClassByUniqueKey = new Map();

      for (const tc of targetClasses) {
        const key = `${tc.section_name || ''} | ${tc.name}`.toLowerCase();
        targetClassByUniqueKey.set(key, tc.id);
      }

      for (const sc of sourceClasses) {
        const key = `${sc.section_name || ''} | ${sc.name}`.toLowerCase();
        if (targetClassByUniqueKey.has(key)) {
          classMap.set(sc.id, targetClassByUniqueKey.get(key));
        } else {
          // Fallback: search by name only
          const fallbackTarget = targetClasses.find(tc => tc.name.toLowerCase() === sc.name.toLowerCase());
          if (fallbackTarget) {
            classMap.set(sc.id, fallbackTarget.id);
          }
        }
      }

      // Insert into target with mapped class IDs
      for (const p of posts) {
        let candClasses = [];
        let votClasses = [];
        try {
           candClasses = JSON.parse(p.candidate_classes || "[]");
           votClasses = JSON.parse(p.voting_classes || "[]");
           
           if (Array.isArray(candClasses)) {
              candClasses = candClasses.map(id => classMap.get(Number(id)) || id);
           }
           if (Array.isArray(votClasses)) {
              votClasses = votClasses.map(id => classMap.get(Number(id)) || id);
           }
        } catch (e) {
           console.error("Error parsing/mapping imported post classes:", e);
        }

        await connection.execute(
          `INSERT INTO posts (school_id, election_id, name, candidate_classes, voting_classes, gender_rule) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [school_id, target_election_id, p.name, JSON.stringify(candClasses), JSON.stringify(votClasses), p.gender_rule]
        );
      }

      await connection.commit();
      res.json({ message: `${posts.length} positions imported successfully` });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Import Error:", error);
    res.status(500).json({ message: "Server error during import" });
  }
};

exports.toggleNominations = async (req, res) => {
  try {
    const { id } = req.params;
    const { open } = req.body;
    const school_id = req.user.school_id;

    const [result] = await db.execute(
      `UPDATE elections SET nomination_open = ? WHERE id = ? AND school_id = ?`,
      [open ? 1 : 0, id, school_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Election not found" });
    }

    res.json({ message: `Nominations ${open ? 'opened' : 'closed'} successfully` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getPublicElection = async (req, res) => {
  try {
    const { code } = req.params;

    const [rows] = await db.execute(
      `SELECT e.id, e.name, e.nomination_open, e.status, s.code as school_code 
       FROM elections e 
       JOIN schools s ON e.school_id = s.id 
       WHERE e.election_code = ?`,
      [code]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Election not found" });
    }

    const election = rows[0];

    if (!election.nomination_open && election.status !== 'CONFIGURING') {
      return res.status(403).json({ message: "Nomination window is closed for this election." });
    }

    res.json(election);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};