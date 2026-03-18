const db = require("../config/db");
const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");

exports.generateElectionReport = async (req, res) => {
  try {
    const { id } = req.params;
    const school_id = req.user.school_id;

    // 1. Fetch School Info
    const [schools] = await db.execute(
      "SELECT id, name, logo, location FROM schools WHERE id = ?",
      [school_id]
    );
    const school = schools[0];

    // 2. Fetch Election Info
    const [elections] = await db.execute(
      "SELECT id, name, status, start_time, end_time FROM elections WHERE id = ? AND school_id = ?",
      [id, school_id]
    );
    if (elections.length === 0) {
      return res.status(404).json({ message: "Election not found" });
    }
    const election = elections[0];

    // 3. Fetch Statistics
    const [totalVotersRow] = await db.execute(
      "SELECT COUNT(*) as count FROM voters WHERE election_id = ? AND school_id = ?",
      [id, school_id]
    );
    const [votedCountRow] = await db.execute(
      "SELECT COUNT(*) as count FROM voters WHERE election_id = ? AND school_id = ? AND has_voted = 1",
      [id, school_id]
    );
    
    const totalVoters = totalVotersRow[0].count;
    const votedCount = votedCountRow[0].count;
    const turnoutPercentage = totalVoters > 0 ? ((votedCount / totalVoters) * 100).toFixed(1) : "0.0";

    // 4. Fetch Results per Post
    const [posts] = await db.execute(
      "SELECT id, name FROM posts WHERE election_id = ? AND school_id = ?",
      [id, school_id]
    );

    const reportData = [];
    for (const post of posts) {
      const [candidates] = await db.execute(
        `SELECT 
          c.id as candidate_id, 
          v.name as candidate_name, 
          c.symbol,
          (SELECT COUNT(*) FROM votes WHERE candidate_id = c.id) as votes
        FROM candidates c
        JOIN voters v ON c.voter_id = v.id
        WHERE c.post_id = ?
        ORDER BY votes DESC`,
        [post.id]
      );
      reportData.push({
        post_name: post.name,
        candidates: candidates
      });
    }

    // PDF Generation
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers
    const filename = `${election.name.replace(/\s+/g, "_")}_Official_Report.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    doc.pipe(res);

    // --- Header Section ---
    if (school.logo) {
      const logoPath = path.join(__dirname, "..", school.logo);
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, 45, { width: 60 });
      }
    }

    doc
      .fillColor("#444444")
      .fontSize(20)
      .text(school.name.toUpperCase(), 120, 50, { align: "left" })
      .fontSize(10)
      .text(school.location || "Official Election Authority", 120, 75, { align: "left" })
      .text("OFFICIAL ELECTION CERTIFICATE", 120, 90, { align: "left", characterSpacing: 1 })
      .moveDown();

    doc
      .strokeColor("#aaaaaa")
      .lineWidth(1)
      .moveTo(50, 115)
      .lineTo(550, 115)
      .stroke();

    // --- Election Title ---
    doc
      .moveDown(2)
      .fillColor("#000000")
      .fontSize(24)
      .text(election.name, { align: "center", font: "Helvetica-Bold" })
      .fontSize(12)
      .text(`Status: ${election.status} | Generated: ${new Date().toLocaleString()}`, { align: "center" })
      .moveDown();

    // --- Stats Summary Table ---
    doc
      .rect(50, 220, 500, 60)
      .fill("#f9f9f9")
      .stroke("#dddddd");

    doc
      .fillColor("#444444")
      .fontSize(10)
      .text("TOTAL REGISTERED", 70, 235)
      .text("TOTAL VOTES CAST", 220, 235)
      .text("ELECTION TURNOUT", 400, 235);

    doc
      .fillColor("#000000")
      .fontSize(16)
      .text(totalVoters.toString(), 70, 250, { font: "Helvetica-Bold" })
      .text(votedCount.toString(), 220, 250)
      .text(`${turnoutPercentage}%`, 400, 250);

    doc.moveDown(4);

    // --- Results Breakdown ---
    for (const post of reportData) {
      doc
        .fillColor("#0052cc")
        .fontSize(16)
        .text(post.post_name, { underline: true })
        .moveDown(0.5);

      // Table Header
      const tableTop = doc.y;
      doc
        .fillColor("#666666")
        .fontSize(10)
        .text("CANDIDATE", 50, tableTop)
        .text("VOTES", 350, tableTop)
        .text("PERCENTAGE", 450, tableTop);
      
      doc
        .moveTo(50, tableTop + 15)
        .lineTo(550, tableTop + 15)
        .strokeColor("#eeeeee")
        .stroke();

      let currentY = tableTop + 25;

      post.candidates.forEach((c, index) => {
        const isWinner = index === 0 && c.votes > 0;
        const pct = votedCount > 0 ? ((c.votes / votedCount) * 100).toFixed(1) : "0.0";
        
        if (isWinner) {
          doc.rect(50, currentY - 5, 500, 20).fill("#fff9c4").stroke("#fff176");
           doc.fillColor("#000000");
        } else {
           doc.fillColor("#333333");
        }

        doc
          .fontSize(11)
          .text(c.candidate_name, 50, currentY)
          .text(c.votes.toString(), 350, currentY)
          .text(`${pct}%`, 450, currentY);

        if (isWinner) {
          doc.fontSize(8).fillColor("#f57f17").text("  [ WINNER ]", 250, currentY);
        }

        currentY += 25;

        // Check if we need a new page
        if (currentY > 700) {
          doc.addPage();
          currentY = 50;
        }
      });

      doc.moveDown(2);
    }

    // --- Footer Section ---
    const pageCount = doc.bufferedPageCount;
    doc
      .fontSize(8)
      .fillColor("#999999")
      .text(
        `Digital Verification Serial: SV-${school_id}-${election.id}-${Date.now().toString().substring(8)}`,
        50,
        750,
        { align: "center" }
      )
      .text(
        "This is a computer-generated official document. No signature is required for electronic verification.",
        50,
        762,
        { align: "center" }
      );

    doc.end();
  } catch (error) {
    console.error("Error generating PDF report:", error);
    res.status(500).json({ message: "Server error generating report", error: error.message });
  }
};
