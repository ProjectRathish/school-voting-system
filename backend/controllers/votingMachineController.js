const db = require("../config/db");
const crypto = require("crypto");
const io = require("../utils/socket");

// Generate unique machine code format: VM-BOOTH-NUMBER
const generateMachineCode = async (booth_id) => {
  const timestamp = Date.now().toString().slice(-4);
  const random = Math.floor(Math.random() * 100).toString().padStart(2, "0");
  return `VM-B${booth_id}-${timestamp}${random}`;
};

// Generate secure machine token
const generateMachineToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Register a new voting machine
exports.registerMachine = async (req, res) => {
  try {
    const { election_id, booth_id, machine_name } = req.body;
    const school_id = req.user.school_id;

    // Validate required fields
    if (!election_id || !booth_id || !machine_name) {
      return res.status(400).json({
        message: "election_id, booth_id, and machine_name are required"
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

    // Verify polling booth exists and belongs to the election
    const [boothRows] = await db.execute(
      `SELECT id FROM polling_booths WHERE id=? AND election_id=? AND school_id=?`,
      [booth_id, election_id, school_id]
    );

    if (boothRows.length === 0) {
      return res.status(404).json({
        message: "Polling booth not found"
      });
    }

    // Check if machine_name already exists in this booth
    const [duplicateCheck] = await db.execute(
      `SELECT id FROM voting_machines WHERE booth_id=? AND machine_name=?`,
      [booth_id, machine_name]
    );

    if (duplicateCheck.length > 0) {
      return res.status(400).json({
        message: "Machine name already exists in this booth"
      });
    }

    // Generate unique machine code
    const machine_code = await generateMachineCode(booth_id);

    // Generate secure machine token
    const machine_token = generateMachineToken();

    // Create the voting machine
    const [result] = await db.execute(
      `INSERT INTO voting_machines (school_id, election_id, booth_id, machine_name, machine_code, machine_token, status)
       VALUES (?, ?, ?, ?, ?, ?, 'FREE')`,
      [school_id, election_id, booth_id, machine_name, machine_code, machine_token]
    );

    res.status(201).json({
      message: "Voting machine registered successfully",
      machine_id: result.insertId,
      machine_code,
      machine_token,
      booth_id
    });
  } catch (err) {
    console.error("Error registering machine:", err);
    res.status(500).json({
      message: "Error registering voting machine",
      error: err.message
    });
  }
};

// Verify voting machine by token
exports.verifyMachine = async (req, res) => {
  try {
    const machineToken = req.headers["machine-token"];

    if (!machineToken) {
      return res.status(400).json({
        error: "machine-token header is required"
      });
    }

    // Find machine by token
    const [machines] = await db.execute(
      `SELECT m.id, m.booth_id, m.status, m.machine_code, m.election_id, pb.booth_number
       FROM voting_machines m
       JOIN polling_booths pb ON m.booth_id = pb.id
       WHERE m.machine_token=?`,
      [machineToken]
    );

    if (machines.length === 0) {
      return res.status(401).json({
        error: "Device not registered as voting machine"
      });
    }

    const machine = machines[0];

    // Check machine status
    if (machine.status === "OFFLINE") {
      return res.status(403).json({
        error: "Voting machine is offline",
        machine_id: machine.id
      });
    }

    res.status(200).json({
      machine_id: machine.id,
      machine_code: machine.machine_code,
      booth_id: machine.booth_id,
      booth_name: machine.booth_number,
      election_id: machine.election_id,
      status: machine.status,
      message: "Machine verified successfully"
    });
  } catch (err) {
    console.error("Error verifying machine:", err);
    res.status(500).json({
      error: "Error verifying machine",
      message: err.message
    });
  }
};

// Get all machines in a specific booth
exports.getMachinesInBooth = async (req, res) => {
  try {
    const school_id = req.user.school_id;
    const { booth_id } = req.params;

    // Verify booth exists
    const [boothRows] = await db.execute(
      `SELECT id FROM polling_booths WHERE id=? AND school_id=?`,
      [booth_id, school_id]
    );

    if (boothRows.length === 0) {
      return res.status(404).json({
        message: "Polling booth not found"
      });
    }

    // Get all machines in booth
    const [machines] = await db.execute(
      `SELECT m.id, m.machine_name, m.machine_code, m.status, m.created_at, pb.booth_number
       FROM voting_machines m
       JOIN polling_booths pb ON m.booth_id = pb.id
       WHERE m.booth_id=? AND m.school_id=?
       ORDER BY m.created_at ASC`,
      [booth_id, school_id]
    );

    // Add booth_name to response
    const boothName = machines.length > 0 ? machines[0].booth_number : null;
    const machinesData = machines.map(m => ({
      id: m.id,
      machine_name: m.machine_name,
      machine_code: m.machine_code,
      status: m.status,
      created_at: m.created_at
    }));

    res.json({
      message: "Machines retrieved successfully",
      booth_id,
      booth_name: boothName,
      count: machines.length,
      data: machinesData
    });
  } catch (err) {
    console.error("Error fetching machines:", err);
    res.status(500).json({
      message: "Error fetching machines",
      error: err.message
    });
  }
};

// Get single machine details
exports.getMachineById = async (req, res) => {
  try {
    const school_id = req.user.school_id;
    const { machine_id } = req.params;

    const [machines] = await db.execute(
      `SELECT m.id, m.machine_name, m.machine_code, m.booth_id, m.election_id, m.status, m.created_at, pb.booth_number
       FROM voting_machines m
       JOIN polling_booths pb ON m.booth_id = pb.id
       WHERE m.id=? AND m.school_id=?`,
      [machine_id, school_id]
    );

    if (machines.length === 0) {
      return res.status(404).json({
        message: "Machine not found"
      });
    }

    const machine = machines[0];
    res.json({
      message: "Machine retrieved successfully",
      data: {
        id: machine.id,
        machine_name: machine.machine_name,
        machine_code: machine.machine_code,
        booth_id: machine.booth_id,
        booth_name: machine.booth_number,
        election_id: machine.election_id,
        status: machine.status,
        created_at: machine.created_at
      }
    });
  } catch (err) {
    console.error("Error fetching machine:", err);
    res.status(500).json({
      message: "Error fetching machine",
      error: err.message
    });
  }
};

// Update machine status
exports.updateMachineStatus = async (req, res) => {
  try {
    const school_id = req.user.school_id;
    const { machine_id } = req.params;
    const { status } = req.body;

    const validStatuses = ["FREE", "BUSY", "OFFLINE"];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        message: "status must be one of: FREE, BUSY, OFFLINE"
      });
    }

    // Verify machine exists
    const [existing] = await db.execute(
      `SELECT id FROM voting_machines WHERE id=? AND school_id=?`,
      [machine_id, school_id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        message: "Machine not found"
      });
    }

    // Update status
    await db.execute(
      `UPDATE voting_machines SET status=? WHERE id=? AND school_id=?`,
      [status, machine_id, school_id]
    );

    res.json({
      message: "Machine status updated successfully",
      machine_id,
      status
    });
  } catch (err) {
    console.error("Error updating machine:", err);
    res.status(500).json({
      message: "Error updating machine",
      error: err.message
    });
  }
};

// Delete a voting machine
exports.deleteMachine = async (req, res) => {
  try {
    const school_id = req.user.school_id;
    const { machine_id } = req.params;

    // Verify machine exists
    const [existing] = await db.execute(
      `SELECT id FROM voting_machines WHERE id=? AND school_id=?`,
      [machine_id, school_id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        message: "Machine not found"
      });
    }

    // Delete machine
    await db.execute(
      `DELETE FROM voting_machines WHERE id=? AND school_id=?`,
      [machine_id, school_id]
    );

    res.json({
      message: "Machine deleted successfully"
    });
  } catch (err) {
    console.error("Error deleting machine:", err);
    res.status(500).json({
      message: "Error deleting machine",
      error: err.message
    });
  }
};

// Fetch Ballot
exports.fetchBallot = async (req, res) => {
  try {
    const machineToken = req.headers["machine-token"];

    if (!machineToken) {
      return res.status(400).json({ error: "machine-token header is required" });
    }

    // Find machine by token
    const [machines] = await db.execute(
      `SELECT m.id, m.school_id, m.election_id, m.status, m.current_voter_id 
       FROM voting_machines m
       WHERE m.machine_token=?`,
      [machineToken]
    );

    if (machines.length === 0) {
      return res.status(401).json({ error: "Invalid machine token" });
    }

    const machine = machines[0];

    if (machine.status !== 'BUSY' || !machine.current_voter_id) {
       return res.status(400).json({ error: "Machine is not active. No voter assigned." });
    }

    // Get current voter info (class_id, sex)
    const [voterRows] = await db.execute(
       "SELECT class_id, sex, has_voted FROM voters WHERE id=?",
       [machine.current_voter_id]
    );

    if (voterRows.length === 0) {
       return res.status(404).json({ error: "Voter not found" });
    }

    const voter = voterRows[0];

    if (voter.has_voted) {
       return res.status(400).json({ error: "Voter has already voted" });
    }

    // Fetch posts eligible for this voter (class_id in voting_classes, gender matches)
    const [posts] = await db.execute(
       `SELECT id, name, gender_rule, voting_classes FROM posts WHERE election_id=?`,
       [machine.election_id]
    );

    const eligiblePosts = posts.filter(post => {
       // Check class rule
       if (post.voting_classes) {
          try {
             const classes = JSON.parse(post.voting_classes);
             // If classes array is empty it might mean open to all, or nobody. Assume empty array means open to all if that's the prior logic, but usually it means only those listed.
             // If the list is empty, let's assume it means no classes are restricted, but conventionally it should be an array of IDs.
             if (classes && classes.length > 0 && !classes.includes(voter.class_id)) {
                 return false;
             }
          } catch(e) {}
       }
       return true;
    });

    if (eligiblePosts.length === 0) {
        return res.json({ message: "No posts available for this voter", posts: [] });
    }

    const postIds = eligiblePosts.map(p => p.id);

    // Fetch candidates for these posts
    const placeholders = postIds.map(() => '?').join(',');
    const [candidates] = await db.execute(
       `SELECT c.id as candidate_id, c.post_id, c.photo, c.symbol, v.name as candidate_name
        FROM candidates c
        JOIN voters v ON c.voter_id = v.id
        WHERE c.post_id IN (${placeholders}) AND c.election_id=?`,
       [...postIds, machine.election_id]
    );

    // Assemble ballot
    const ballot = eligiblePosts.map(post => {
       return {
          post_id: post.id,
          post_name: post.name,
          candidates: candidates.filter(c => c.post_id === post.id)
       };
    });

    res.json({
       message: "Ballot retrieved successfully",
       voter_id: machine.current_voter_id,
       ballot: ballot
    });

  } catch (err) {
    console.error("Error fetching ballot:", err);
    res.status(500).json({ error: "Server error fetching ballot", details: err.message });
  }
};

// Cast Vote
exports.castVote = async (req, res) => {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const machineToken = req.headers["machine-token"];
    const { votes } = req.body; // Array of {post_id, candidate_id}

    if (!machineToken) {
      await connection.rollback();
      return res.status(400).json({ error: "machine-token header is required" });
    }
    
    if (!votes || !Array.isArray(votes)) {
      await connection.rollback();
      return res.status(400).json({ error: "Votes array is required" });
    }

    // Find machine by token (FOR UPDATE to lock it)
    const [machines] = await connection.execute(
      `SELECT m.id, m.school_id, m.election_id, m.status, m.current_voter_id 
       FROM voting_machines m
       WHERE m.machine_token=? FOR UPDATE`,
      [machineToken]
    );

    if (machines.length === 0) {
      await connection.rollback();
      return res.status(401).json({ error: "Invalid machine token" });
    }

    const machine = machines[0];

    if (machine.status !== 'BUSY' || !machine.current_voter_id) {
       await connection.rollback();
       return res.status(400).json({ error: "Machine is not active. No voter assigned." });
    }

    // Verify Voter and get demographics for analytics
    const [voterRows] = await connection.execute(
       `SELECT v.id, v.has_voted, v.class_id, v.sex, c.section_id 
        FROM voters v 
        JOIN classes c ON v.class_id = c.id 
        WHERE v.id=? FOR UPDATE`,
       [machine.current_voter_id]
    );

    if (voterRows.length === 0 || voterRows[0].has_voted) {
       await connection.rollback();
       return res.status(400).json({ error: "Voter already voted or not found" });
    }
    
    const voter = voterRows[0];

    // Insert Votes
    for (const vote of votes) {
       if (vote.candidate_id) { // allows recording missing votes if they skipped a post
           await connection.execute(
             `INSERT INTO votes (school_id, election_id, post_id, candidate_id, voter_class_id, voter_section_id, voter_sex) 
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
             [machine.school_id, machine.election_id, vote.post_id, vote.candidate_id, voter.class_id, voter.section_id, voter.sex]
           );
       }
    }

    // Mark voter as voted
    await connection.execute(
       "UPDATE voters SET has_voted=1, is_active=0 WHERE id=?",
       [machine.current_voter_id]
    );

    // Free the machine
    await connection.execute(
       "UPDATE voting_machines SET status='FREE', current_voter_id=NULL WHERE id=?",
       [machine.id]
    );

    await connection.commit();
    
    // Emit real-time update event
    try {
      io.getIO().to(`election_${machine.election_id}`).emit("vote_cast", { 
         message: "New vote received",
         election_id: machine.election_id
      });
    } catch (socketErr) {
      console.error("Socket emit failed:", socketErr);
    }
    
    res.json({ message: "Vote cast successfully" });
  } catch (err) {
    await connection.rollback();
    console.error("Error casting vote:", err);
    res.status(500).json({ error: "Server error casting vote", details: err.message });
  } finally {
    connection.release();
  }
};
