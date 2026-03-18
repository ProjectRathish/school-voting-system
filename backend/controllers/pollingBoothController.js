const db = require("../config/db");

// Create a new polling booth
exports.createPollingBooth = async (req, res) => {
  try {
    const school_id = req.user.school_id;
    const { election_id, booth_number, location, capacity } = req.body;

    // Validate required fields
    if (!election_id || !booth_number || !location) {
      return res.status(400).json({
        message: "election_id, booth_number, and location are required"
      });
    }

    // Verify election exists and belongs to this school
    const [electionRows] = await db.execute(
      `SELECT id FROM elections WHERE id=? AND school_id=?`,
      [election_id, school_id]
    );

    if (electionRows.length === 0) {
      return res.status(404).json({
        message: "Election not found"
      });
    }

    // Check if booth number already exists for this election
    const [existingBooth] = await db.execute(
      `SELECT id FROM polling_booths WHERE booth_number=? AND election_id=?`,
      [booth_number, election_id]
    );

    if (existingBooth.length > 0) {
      return res.status(400).json({
        message: "Polling booth with this number already exists for this election"
      });
    }

    // Create the polling booth
    const [result] = await db.execute(
      `INSERT INTO polling_booths (school_id, election_id, booth_number, location, capacity, status)
       VALUES (?, ?, ?, ?, ?, 'ACTIVE')`,
      [school_id, election_id, booth_number, location, capacity || null]
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
    const { booth_number, location, capacity, status } = req.body;

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

    // Delete the polling booth
    await db.execute(
      `DELETE FROM polling_booths WHERE id=? AND school_id=?`,
      [booth_id, school_id]
    );

    res.json({
      message: "Polling booth deleted successfully"
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
    const booth_id = req.user.booth_id || req.params.booth_id; 
    const { admission_no, election_id } = req.body;

    if (!admission_no || !election_id || !booth_id) {
       return res.status(400).json({ message: "admission_no, election_id, and booth_id are required" });
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
       "SELECT id, is_active, has_voted, class_id, sex FROM voters WHERE admission_no=? AND election_id=? AND school_id=?",
       [admission_no, election_id, school_id]
    );

    if (voterRows.length === 0) {
       return res.status(404).json({ message: "Voter not found in this election" });
    }

    const voter = voterRows[0];

    if (voter.has_voted) {
       return res.status(400).json({ message: "Voter has already cast their vote" });
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
             if (classes && classes.length > 0 && !classes.includes(voter.class_id)) {
                 return false;
             }
          } catch(e) {}
       }
       return true;
    });

    if (eligiblePosts.length === 0) {
        return res.status(400).json({ message: "Voter is not eligible to vote for any posts in this election." });
    }

    // Check for a free machine in this booth
    let machineQuery = "SELECT id, machine_name FROM voting_machines WHERE booth_id=? AND school_id=? AND election_id=? AND status='FREE'";
    let machineParams = [booth_id, school_id, election_id];

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
