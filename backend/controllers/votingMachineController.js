const db = require("../config/db");
const crypto = require("crypto");

// Generate unique machine code format: SCHOOLCODE-VM-B{booth_number}-{random}
const generateMachineCode = async (school_code, booth_number) => {
  const timestamp = Date.now().toString().slice(-4);
  const random = Math.floor(Math.random() * 100).toString().padStart(2, "0");
  return `${school_code}-VM-B${booth_number}-${timestamp}${random}`;
};

// Generate secure machine token
const generateMachineToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Register a new voting machine
exports.registerMachine = async (req, res) => {
  try {
    const { booth_id, machine_name } = req.body;
    const school_id = req.user.school_id;

    // Validate required fields
    if (!booth_id || !machine_name) {
      return res.status(400).json({
        message: "booth_id and machine_name are required"
      });
    }

    // Verify polling booth exists and belongs to the school
    const [boothRows] = await db.execute(
      `SELECT id, booth_number FROM polling_booths WHERE id=? AND school_id=?`,
      [booth_id, school_id]
    );

    if (boothRows.length === 0) {
      return res.status(404).json({
        message: "Polling booth not found"
      });
    }

    // Fetch School Code for unique machine prefix
    const [schoolRows] = await db.execute("SELECT code FROM schools WHERE id = ?", [school_id]);
    if (schoolRows.length === 0) {
      return res.status(404).json({ message: "School not found" });
    }
    const school_code = schoolRows[0].code;

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

    // Generate globally unique machine code
    const booth_number = boothRows[0].booth_number;
    const machine_code = await generateMachineCode(school_code, booth_number);

    // Generate secure machine token
    const machine_token = generateMachineToken();

    // Create the voting machine
    const [result] = await db.execute(
      `INSERT INTO voting_machines (school_id, booth_id, machine_name, machine_code, machine_token, status)
       VALUES (?, ?, ?, ?, ?, 'FREE')`,
      [school_id, booth_id, machine_name, machine_code, machine_token]
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
    const deviceFingerprint = req.headers["device-id"];

    if (!machineToken) {
      return res.status(400).json({
        error: "machine-token header is required"
      });
    }

    // Find machine by machine_code
    const [machines] = await db.execute(
      `SELECT m.id, m.booth_id, m.status, m.machine_code, m.machine_name, m.school_id, m.current_voter_id, m.device_fingerprint,
              pb.booth_number as booth_name
       FROM voting_machines m
       LEFT JOIN polling_booths pb ON m.booth_id = pb.id
       WHERE m.machine_code=?`,
      [machineToken]
    );

    if (machines.length === 0) {
      return res.status(401).json({
        error: "Device not registered as voting machine"
      });
    }

    const machine = machines[0];

    // Hardware Binding Security Check
    if (deviceFingerprint) {
      if (!machine.device_fingerprint) {
        // Bind this device for the first time
        await db.execute(
          "UPDATE voting_machines SET device_fingerprint=? WHERE id=?",
          [deviceFingerprint, machine.id]
        );
        console.log(`[Security] Machine ${machine.machine_code} bound to device ${deviceFingerprint}`);
      } else if (machine.device_fingerprint !== deviceFingerprint) {
        // Mismatch found!
        return res.status(403).json({
          error: "Hardware Mismatch. This machine code is already locked to another physical device. Please contact school admin.",
          code: "HARDWARE_MISMATCH"
        });
      }
    }
    
    // Update last_ping
    await db.execute(
      "UPDATE voting_machines SET last_ping=CURRENT_TIMESTAMP WHERE id=?",
      [machine.id]
    );

    // Check machine status
    if (machine.status === "OFFLINE") {
      return res.status(403).json({
        error: "Voting machine is offline",
        machine_id: machine.id
      });
    }

    res.status(200).json({
      id: machine.id,
      school_id: machine.school_id,
      machine_name: machine.machine_name,
      machine_code: machine.machine_code,
      booth_id: machine.booth_id,
      booth_name: machine.booth_name,
      status: machine.status,
      current_voter_id: machine.current_voter_id,
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
      `SELECT id, booth_number, location FROM polling_booths WHERE id=? AND school_id=?`,
      [booth_id, school_id]
    );

    if (boothRows.length === 0) {
      return res.status(404).json({
        message: "Polling booth not found"
      });
    }

    // Update officer's ping if they are polling their booth
    if (req.user.role === 'BOOTH_OFFICER') {
      await db.execute("UPDATE users SET last_ping = CURRENT_TIMESTAMP WHERE id = ?", [req.user.id]);
    }

    // Get all machines in booth
    const [machines] = await db.execute(
      `SELECT m.id, m.machine_name, m.machine_code, m.status, m.created_at, m.last_ping, pb.booth_number,
              TIMESTAMPDIFF(SECOND, m.last_ping, CURRENT_TIMESTAMP) as machine_ping_diff
       FROM voting_machines m
       JOIN polling_booths pb ON m.booth_id = pb.id
       WHERE m.booth_id=? AND m.school_id=?
       ORDER BY m.created_at ASC`,
      [booth_id, school_id]
    );

    // Add booth_name to response from the primary lookup
    const boothName = boothRows[0]?.booth_number || null;
    const boothLocation = boothRows[0]?.location || 'Unspecified Location';
    const machinesData = machines.map(m => ({
      id: m.id,
      machine_name: m.machine_name,
      machine_code: m.machine_code,
      status: m.status,
      created_at: m.created_at,
      is_online: m.machine_ping_diff !== null && m.machine_ping_diff < 60
    }));

    res.json({
      message: "Machines retrieved successfully",
      booth_id,
      booth_name: boothName,
      booth_location: boothLocation,
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

// Get all machines for an election
exports.getAllMachines = async (req, res) => {
  try {
    const school_id = req.user.school_id;
    const [machines] = await db.execute(
      `SELECT m.id, m.machine_name, m.machine_code, m.status, m.created_at, m.last_ping, pb.booth_number, m.booth_id, m.device_fingerprint,
              u.username as officer_username, u.last_ping as officer_last_ping,
              TIMESTAMPDIFF(SECOND, m.last_ping, CURRENT_TIMESTAMP) as machine_ping_diff,
              TIMESTAMPDIFF(SECOND, u.last_ping, CURRENT_TIMESTAMP) as officer_ping_diff
       FROM voting_machines m
       JOIN polling_booths pb ON m.booth_id = pb.id
       LEFT JOIN users u ON u.booth_id = pb.id AND u.role = 'BOOTH_OFFICER'
       WHERE m.school_id=?
       ORDER BY pb.booth_number ASC, m.machine_name ASC`,
      [school_id]
    );

    const machinesData = machines.map(m => ({
        ...m,
        is_online: m.machine_ping_diff !== null && m.machine_ping_diff < 60,
        officer_is_online: m.officer_ping_diff !== null && m.officer_ping_diff < 60
    }));

    res.json(machinesData);
  } catch (err) {
    console.error("Error fetching all machines:", err);
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
      `SELECT m.id, m.machine_name, m.machine_code, m.booth_id, m.status, m.created_at, pb.booth_number
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

// Update machine details
exports.updateMachine = async (req, res) => {
  try {
    const school_id = req.user.school_id;
    const { machine_id } = req.params;
    const { machine_name, booth_id } = req.body;

    if (!machine_name || !booth_id) {
       return res.status(400).json({ message: "machine_name and booth_id are required" });
    }

    // Verify booth belongs to this school
    const [boothRows] = await db.execute(
      `SELECT id FROM polling_booths WHERE id=? AND school_id=?`,
      [booth_id, school_id]
    );

    if (boothRows.length === 0) {
      return res.status(400).json({ message: "Selected booth not found" });
    }

    // Uniqueness check for machine name within the booth
    const [dup] = await db.execute(
      `SELECT id FROM voting_machines WHERE machine_name=? AND booth_id=? AND id != ?`,
      [machine_name, booth_id, machine_id]
    );

    if (dup.length > 0) {
       return res.status(400).json({ message: "Machine name already exists in this booth" });
    }

    await db.execute(
      `UPDATE voting_machines SET machine_name=?, booth_id=? WHERE id=? AND school_id=?`,
      [machine_name, booth_id, machine_id, school_id]
    );

    res.json({ message: "Machine updated successfully" });

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

    // Find machine by code (it's passed as the token header)
    const [machines] = await db.execute(
      `SELECT m.id, m.school_id, m.status, m.current_voter_id 
       FROM voting_machines m
       WHERE m.machine_code=?`,
      [machineToken]
    );

    if (machines.length === 0) {
      return res.status(401).json({ error: "Invalid machine token" });
    }

    const machine = machines[0];

    if (machine.status !== 'BUSY' || !machine.current_voter_id) {
       return res.status(400).json({ error: "Machine is not active. No voter assigned." });
    }

    // Get current voter info (name, class_id, sex, election_id)
    const [voterRows] = await db.execute(
       "SELECT name, election_id, class_id, sex, has_voted FROM voters WHERE id=?",
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
       `SELECT id, name, priority, gender_rule, voting_classes, allow_nota FROM posts WHERE election_id=?`,
       [voter.election_id]
    );

    const eligiblePosts = posts.filter(post => {
       // Check class rule
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
        return res.json({ message: "No posts available for this voter", ballot: [] });
    }

    const postIds = eligiblePosts.map(p => p.id);

    // Fetch candidates for these posts
    const placeholders = postIds.map(() => '?').join(',');
    const [candidates] = await db.execute(
       `SELECT c.id as candidate_id, c.post_id, c.photo, c.symbol, v.name as candidate_name
        FROM candidates c
        JOIN voters v ON c.voter_id = v.id
        WHERE c.post_id IN (${placeholders}) 
        AND c.election_id=? 
        AND v.is_blocked = 0`,
       [...postIds, voter.election_id]
    );

    // Assemble ballot (Sorted by Post Priority)
    const ballot = eligiblePosts
      .sort((a, b) => (a.priority || 0) - (b.priority || 0))
      .map(post => {
       const postCandidates = candidates
             .filter(c => c.post_id === post.id)
             .sort((a, b) => a.candidate_name.localeCompare(b.candidate_name));

       // If only 1 candidate, they are the uncontested winner — skip this post on the ballot
       if (postCandidates.length <= 1) {
           return null;
       }

       // Add NOTA
       if (post.allow_nota !== 0) {
           postCandidates.push({
               candidate_id: -1, // Use a negative ID to denote NOTA
               post_id: post.id,
               candidate_name: 'None of the Above (NOTA)',
               symbol: null,
               photo: null
           });
       }

       return {
          post_id: post.id,
          post_name: post.name,
          candidates: postCandidates
       };
    })
    .filter(Boolean); // Remove null entries (uncontested posts with 1 candidate)

    res.json({
       message: "Ballot retrieved successfully",
       voter_id: machine.current_voter_id,
       voter_name: voter.name,
       ballot
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

    // Find machine by machine_code (FOR UPDATE to lock it)
    const [machines] = await connection.execute(
      `SELECT m.id, m.school_id, m.status, m.current_voter_id 
       FROM voting_machines m
       WHERE m.machine_code=? FOR UPDATE`,
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

    // Verify Voter and get demographics/election for analytics
    const [voterRows] = await connection.execute(
       `SELECT v.id, v.election_id, v.has_voted, v.class_id, v.sex, c.section_id,
               c.name as class_name, s.name as section_name
        FROM voters v 
        JOIN classes c ON v.class_id = c.id 
        JOIN sections s ON c.section_id = s.id
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
           // Map NOTA ID (-1) to null for candidate_id to signify "None of the Above"
           const actualCandidateId = vote.candidate_id === -1 ? null : vote.candidate_id;
           await connection.execute(
             `INSERT INTO votes (school_id, election_id, post_id, candidate_id, voter_class_id, voter_section_id, voter_sex) 
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
             [machine.school_id, voter.election_id, vote.post_id, actualCandidateId, voter.class_id, voter.section_id, voter.sex]
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
    
    // Real-time update events removed (replaced by client-side polling)
    
    res.json({ message: "Vote cast successfully" });
  } catch (err) {
    await connection.rollback();
    console.error("Error casting vote:", err);
    res.status(500).json({ error: "Server error casting vote", details: err.message });
  } finally {
    connection.release();
  }
};

// Ping from machine to update last_ping
exports.pingMachine = async (req, res) => {
  try {
    const machineToken = req.headers["machine-token"];
    if (!machineToken) return res.status(400).json({ error: "machine-token header is required" });

    const [result] = await db.execute(
      "UPDATE voting_machines SET last_ping=CURRENT_TIMESTAMP WHERE machine_code=?",
      [machineToken]
    );

    if (result.affectedRows === 0) return res.status(401).json({ error: "Invalid machine" });

    res.json({ message: "Pong", timestamp: new Date() });
  } catch (err) {
    console.error("Ping error:", err);
    res.status(500).json({ error: "Ping failed" });
  }
};

exports.resetBinding = async (req, res) => {
  try {
    const { machine_id } = req.params;
    const school_id = req.user.school_id;

    const [machine] = await db.execute(
      "SELECT id FROM voting_machines WHERE id = ? AND school_id = ?",
      [machine_id, school_id]
    );

    if (machine.length === 0) {
      return res.status(404).json({ message: "Machine not found" });
    }

    await db.execute(
      "UPDATE voting_machines SET device_fingerprint = NULL WHERE id = ?",
      [machine_id]
    );

    res.json({ message: "Hardware binding reset successfully. You can now register this code on a new device." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.bulkDeleteMachines = async (req, res) => {
  try {
    const school_id = req.user.school_id;

    const [result] = await db.execute(
      "DELETE FROM voting_machines WHERE school_id = ?",
      [school_id]
    );

    res.json({ 
      message: "All voting machines deleted successfully", 
      count: result.affectedRows 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during bulk deletion" });
  }
};

// Release / reset a busy voting machine back to FREE state
exports.releaseMachine = async (req, res) => {
  try {
    const { machine_id } = req.params;
    const school_id = req.user.school_id;

    // Fetch the machine details (ensuring it belongs to this school)
    const [machines] = await db.execute(
      `SELECT id, status, current_voter_id, booth_id FROM voting_machines WHERE id=? AND school_id=?`,
      [machine_id, school_id]
    );

    if (machines.length === 0) {
      return res.status(404).json({ message: "Voting machine not found" });
    }

    const machine = machines[0];

    // Dynamically resolve election_id for Socket emissions
    let election_id = req.body?.election_id || req.user?.election_id;

    // If there is an active voter, reset their active status and obtain election_id
    if (machine.current_voter_id) {
      const [voterRows] = await db.execute(
        "SELECT election_id FROM voters WHERE id=?",
        [machine.current_voter_id]
      );
      if (voterRows.length > 0) {
        election_id = voterRows[0].election_id;
      }

      await db.execute(
        "UPDATE voters SET is_active=0 WHERE id=?",
        [machine.current_voter_id]
      );
    }

    if (!election_id) {
      const [activeElections] = await db.execute(
        "SELECT id FROM elections WHERE school_id=? AND status='ACTIVE' LIMIT 1",
        [school_id]
      );
      if (activeElections.length > 0) {
        election_id = activeElections[0].id;
      }
    }

    // Set machine status back to FREE
    await db.execute(
      "UPDATE voting_machines SET status='FREE', current_voter_id=NULL WHERE id=?",
      [machine.id]
    );

    // Real-time update events removed (replaced by client-side polling)

    res.json({ message: "Machine session successfully released and reset to FREE." });
  } catch (err) {
    console.error("Error releasing machine:", err);
    try {
      const fs = require("fs");
      const logMsg = `[${new Date().toISOString()}] req.params=${JSON.stringify(req.params)} req.user=${JSON.stringify(req.user)} ERROR:\n${err.stack}\n\n`;
      fs.appendFileSync("error_log.txt", logMsg);
    } catch (logErr) {
      console.error("Failed to write to log file:", logErr);
    }
    res.status(500).json({ message: "Server error releasing machine", error: err.message });
  }
};

