const db = require("../config/db");

// Create a new polling booth
exports.createPollingBooth = async (req, res) => {
  try {
    const school_id = req.user.school_id;
    const { booth_number, booth_name, location, capacity } = req.body;

    // Validate required fields
    if (!booth_number || !location) {
      return res.status(400).json({
        message: "booth_number and location are required"
      });
    }

    // Check if booth number already exists for this school
    const [existingBooth] = await db.execute(
      `SELECT id FROM polling_booths WHERE booth_number=? AND school_id=?`,
      [booth_number, school_id]
    );

    if (existingBooth.length > 0) {
      return res.status(400).json({
        message: "Polling booth with this number already exists in your school"
      });
    }

    // Fetch School Plan Limits for booths
    const [schoolInfo] = await db.execute(`
      SELECT s.custom_max_booths, p.max_booths 
      FROM schools s
      LEFT JOIN subscription_plans p ON s.plan_id = p.id
      WHERE s.id = ?
    `, [school_id]);

    const maxBooths = (schoolInfo[0]?.custom_max_booths !== null && schoolInfo[0]?.custom_max_booths !== undefined) 
      ? schoolInfo[0].custom_max_booths 
      : (schoolInfo[0]?.max_booths || 5);

    // Count existing booths
    const [countRows] = await db.execute(
      "SELECT COUNT(*) as count FROM polling_booths WHERE school_id = ?",
      [school_id]
    );

    if (countRows[0].count >= maxBooths) {
      return res.status(403).json({
        message: `Limit reached: Your current plan allows a maximum of ${maxBooths} polling booths.`
      });
    }

    // Create the polling booth
    const [result] = await db.execute(
      `INSERT INTO polling_booths (school_id, booth_number, booth_name, location, capacity, status)
       VALUES (?, ?, ?, ?, ?, 'ACTIVE')`,
      [school_id, booth_number, booth_name || null, location, capacity || null]
    );

    res.status(201).json({
      message: "Polling booth created successfully",
      booth_id: result.insertId
    });
  } catch (err) {
    console.error("Error creating polling booth:", err);
    res.status(500).json({
      message: "Error creating polling booth",
      error: err.message
    });
  }
};

// Get all polling booths for an election
exports.getAllPollingBooths = async (req, res) => {
  try {
    const school_id = req.user.school_id;
    const { election_id } = req.query;

    let query = `SELECT * FROM polling_booths WHERE school_id=?`;
    let params = [school_id];

    if (election_id) {
      query += ` AND election_id=?`;
      params.push(election_id);
    }

    query += ` ORDER BY booth_number ASC`;

    const [booths] = await db.execute(query, params);

    res.json({
      message: "Polling booths retrieved successfully",
      count: booths.length,
      data: booths
    });
  } catch (err) {
    console.error("Error fetching polling booths:", err);
    res.status(500).json({
      message: "Error fetching polling booths",
      error: err.message
    });
  }
};

// Get a specific polling booth
exports.getPollingBoothById = async (req, res) => {
  try {
    const school_id = req.user.school_id;
    const { booth_id } = req.params;

    const [booth] = await db.execute(
      `SELECT * FROM polling_booths WHERE id=? AND school_id=?`,
      [booth_id, school_id]
    );

    if (booth.length === 0) {
      return res.status(404).json({
        message: "Polling booth not found"
      });
    }

    res.json({
      message: "Polling booth retrieved successfully",
      data: booth[0]
    });
  } catch (err) {
    console.error("Error fetching polling booth:", err);
    res.status(500).json({
      message: "Error fetching polling booth",
      error: err.message
    });
  }
};

// Update a polling booth
exports.updatePollingBooth = async (req, res) => {
  try {
    const school_id = req.user.school_id;
    const { booth_id } = req.params;
    const { booth_number, booth_name, location, capacity, status } = req.body;

    // Verify polling booth exists
    const [existingBooth] = await db.execute(
      `SELECT id FROM polling_booths WHERE id=? AND school_id=?`,
      [booth_id, school_id]
    );

    if (existingBooth.length === 0) {
      return res.status(404).json({
        message: "Polling booth not found"
      });
    }

    // Build dynamic update query
    let updateQuery = "UPDATE polling_booths SET ";
    let updateValues = [];
    let updateFields = [];

    if (booth_number !== undefined) {
      updateFields.push("booth_number=?");
      updateValues.push(booth_number);
    }
    if (booth_name !== undefined) {
      updateFields.push("booth_name=?");
      updateValues.push(booth_name || null);
    }
    if (location !== undefined) {
      updateFields.push("location=?");
      updateValues.push(location);
    }
    if (capacity !== undefined) {
      updateFields.push("capacity=?");
      updateValues.push(capacity);
    }
    if (status !== undefined) {
      updateFields.push("status=?");
      updateValues.push(status);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        message: "No fields to update"
      });
    }

    // If booth_number is being updated, check for uniqueness within the school
    if (booth_number !== undefined) {
      const [dupBooth] = await db.execute(
        `SELECT id FROM polling_booths WHERE booth_number=? AND school_id=? AND id != ?`,
        [booth_number, school_id, booth_id]
      );

      if (dupBooth.length > 0) {
        return res.status(400).json({
          message: `Polling booth with number ${booth_number} already exists in your school.`
        });
      }
    }

    updateQuery += updateFields.join(", ");
    updateQuery += " WHERE id=? AND school_id=?";
    updateValues.push(booth_id, school_id);

    await db.execute(updateQuery, updateValues);

    res.json({
      message: "Polling booth updated successfully"
    });
  } catch (err) {
    console.error("Error updating polling booth:", err);
    res.status(500).json({
      message: "Error updating polling booth",
      error: err.message
    });
  }
};

// Delete a polling booth
exports.deletePollingBooth = async (req, res) => {
  try {
    const school_id = req.user.school_id;
    const { booth_id } = req.params;

    // Verify polling booth exists
    const [existingBooth] = await db.execute(
      `SELECT id FROM polling_booths WHERE id=? AND school_id=?`,
      [booth_id, school_id]
    );

    if (existingBooth.length === 0) {
      return res.status(404).json({
        message: "Polling booth not found"
      });
    }

    // Start cleanup of dependencies
    // 1. Unassign any officers currently assigned to this booth
    await db.execute(
      `UPDATE users SET booth_id = NULL WHERE booth_id=? AND school_id=?`,
      [booth_id, school_id]
    );

    // 2. Delete associated voting machines for this booth
    await db.execute(
      `DELETE FROM voting_machines WHERE booth_id=? AND school_id=?`,
      [booth_id, school_id]
    );

    // 3. Delete officer assignments for this booth in the election assignments table
    await db.execute(
      `DELETE FROM election_officer_assignments WHERE booth_id=?`,
      [booth_id]
    );

    // 4. Finally delete the polling booth
    await db.execute(
      `DELETE FROM polling_booths WHERE id=? AND school_id=?`,
      [booth_id, school_id]
    );

    res.json({
      message: "Polling booth and its associated machines/assignments deleted successfully"
    });
  } catch (err) {
    console.error("Error deleting polling booth:", err);
    res.status(500).json({
      message: "Error deleting polling booth",
      error: err.message
    });
  }
};

// Assign voter to a free voting machine in the booth
exports.assignVoter = async (req, res) => {
  try {
    const school_id = req.user.school_id;
    // Allow explicitly passing booth_id because user tokens might not always contain it if assigned post-login
    const booth_id = req.body.booth_id || req.user.booth_id || req.params.booth_id; 
    const { admission_no } = req.body;

    if (!admission_no || !booth_id) {
       return res.status(400).json({ message: "admission_no and booth_id are required" });
    }

    // 1. Get the election_id. In global booth mode, this must be provided or found.
    const election_id = req.body.election_id || req.user.election_id;

    if (!election_id) {
       return res.status(400).json({ message: "election_id is required for voter assignment" });
    }

    // Verify election is currently ACTIVE
    const [electionRows] = await db.execute(
       "SELECT status FROM elections WHERE id=? AND school_id=?",
       [election_id, school_id]
    );

    if (electionRows.length === 0) {
       return res.status(404).json({ message: "Election not found" });
    }

    if (electionRows[0].status === 'PAUSED') {
       return res.status(403).json({ message: "Election is currently PAUSED (e.g., for lunch break). Voters cannot be assigned." });
    }

    if (electionRows[0].status !== 'ACTIVE') {
       return res.status(403).json({ message: `Election is not active. Current status: ${electionRows[0].status}` });
    }

    // Fetch the voter (include class_id and sex for eligibility check)
    const [voterRows] = await db.execute(
       "SELECT id, is_active, has_voted, is_blocked, class_id, sex FROM voters WHERE admission_no=? AND election_id=? AND school_id=?",
       [admission_no, election_id, school_id]
    );

    if (voterRows.length === 0) {
       return res.status(404).json({ message: "Voter not found in this election" });
    }

    const voter = voterRows[0];

    if (voter.has_voted) {
       return res.status(400).json({ message: "Voter has already cast their vote" });
    }
    
    if (voter.is_blocked) {
       return res.status(403).json({ message: "This voter has been blocked by an administrator and cannot vote." });
    }

    if (voter.is_active) {
       // Ideally we could return what machine they are at, but for now just prevent double activation
       return res.status(400).json({ message: "Voter is already active in a session" });
    }

    // Check if voter is eligible for any posts in this election
    const [posts] = await db.execute(
       "SELECT id, gender_rule, voting_classes FROM posts WHERE election_id=?",
       [election_id]
    );

    const eligiblePosts = posts.filter(post => {
       if (post.voting_classes) {
          try {
             const classes = JSON.parse(post.voting_classes);
             if (classes && classes.length > 0) {
                 const classStrArray = classes.map(String);
                 if (!classStrArray.includes(String(voter.class_id))) {
                     return false;
                 }
             }
          } catch(e) {}
       }
       return true;
    });

    if (eligiblePosts.length === 0) {
        return res.status(400).json({ message: "Voter is not eligible to vote for any posts in this election." });
    }

    // Check for a free machine in this booth
    let machineQuery = "SELECT id, machine_name FROM voting_machines WHERE booth_id=? AND school_id=? AND status='FREE'";
    let machineParams = [booth_id, school_id];

    if (req.body.machine_id) {
       machineQuery += " AND id=?";
       machineParams.push(req.body.machine_id);
    }

    machineQuery += " LIMIT 1 FOR UPDATE";

    const [machineRows] = await db.execute(machineQuery, machineParams);

    if (machineRows.length === 0) {
       return res.status(400).json({ 
          message: req.body.machine_id 
            ? "The selected machine is not free or not found" 
            : "No free voting machines available in this booth" 
       });
    }

    const machine = machineRows[0];

    // Standard updating without complex explicit transaction since execute handles it
    await db.execute(
      "UPDATE voters SET is_active=1 WHERE id=?",
      [voter.id]
    );

    await db.execute(
      "UPDATE voting_machines SET status='BUSY', current_voter_id=? WHERE id=?",
      [voter.id, machine.id]
    );

    // Real-time update events removed (replaced by client-side polling)

    res.json({
       message: "Voter successfully activated and assigned to machine",
       voter_id: voter.id,
       machine_id: machine.id,
       machine_name: machine.machine_name
    });

  } catch (err) {
    console.error("Error assigning voter:", err);
    res.status(500).json({ message: "Server error assigning voter", error: err.message });
  }
};
