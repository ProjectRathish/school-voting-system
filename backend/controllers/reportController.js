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
      "SELECT id, name, priority FROM posts WHERE election_id = ? AND school_id = ? ORDER BY priority ASC, name ASC",
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

exports.generateVoterSignatureSheet = async (req, res) => {
  try {
    const { id } = req.params;
    const school_id = req.user.school_id;

    // 1. Fetch School & Election Info
    const [schools] = await db.execute("SELECT id, name, logo, location FROM schools WHERE id = ?", [school_id]);
    const school = schools[0];
    const [elections] = await db.execute("SELECT name FROM elections WHERE id = ? AND school_id = ?", [id, school_id]);
    const election = elections[0];

    if (!election) return res.status(404).json({ message: "Election not found" });

    // 2. Fetch Voters
    const [voters] = await db.execute(
      `SELECT 
        v.admission_no, v.name, v.sex, v.division,
        c.name AS class_name, s.name AS section_name
       FROM voters v
       JOIN classes c ON v.class_id = c.id
       JOIN sections s ON c.section_id = s.id
       WHERE v.election_id = ? AND v.school_id = ?
       ORDER BY s.name, c.name, v.division, v.name`,
      [id, school_id]
    );

    // Grouping by "Section - Class - Division"
    const groups = {};
    voters.forEach(v => {
      const divisionStr = v.division ? ` - Division ${v.division}` : '';
      const key = `${v.section_name} - ${v.class_name}${divisionStr}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(v);
    });

    // PDF Generation
    const doc = new PDFDocument({ margin: 50 });
    const filename = `${election.name.replace(/\s+/g, "_")}_Voter_Signature_Sheets.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    doc.pipe(res);

    const groupKeys = Object.keys(groups);
    groupKeys.forEach((groupKey, gIdx) => {
      if (gIdx > 0) doc.addPage();

      // Header
      doc.fontSize(16).fillColor("#000").text(school.name.toUpperCase(), { align: "center" });
      doc.fontSize(10).text("VOTER SIGNATURE LIST / POLLING SHEET", { align: "center" }).moveDown();
      doc.fontSize(12).fillColor("#0052cc").text(`${election.name} | ${groupKey}`, { align: "center" }).moveDown();

      // Table Headers
      const tableTop = doc.y;
      doc.fillColor("#666").fontSize(9)
        .text("SI.", 50, tableTop)
        .text("ADM NO", 80, tableTop)
        .text("STUDENT NAME", 155, tableTop)
        .text("DIV", 350, tableTop)
        .text("M/F", 385, tableTop)
        .text("SIGNATURE / THUMB IMPRESSION", 420, tableTop);
      
      doc.strokeColor("#ddd").lineWidth(1).moveTo(50, tableTop + 12).lineTo(550, tableTop + 12).stroke();

      let currentY = tableTop + 25;
      groups[groupKey].forEach((v, vIdx) => {
        if (currentY > 700) {
          doc.addPage();
          // Repeat header on new page if needed (simplified here)
          currentY = 50;
        }

        doc.fillColor("#333").fontSize(10)
          .text((vIdx + 1).toString(), 50, currentY)
          .text(v.admission_no, 80, currentY)
          .text(v.name, 155, currentY)
          .text(v.division || '-', 350, currentY)
          .text(v.sex, 385, currentY);
        
        // Signature Line
        doc.strokeColor("#ccc").lineCap('butt').moveTo(415, currentY + 12).lineTo(545, currentY + 12).stroke();

        currentY += 28;
      });

      // Footer
      doc.fontSize(8).fillColor("#999").text(`Generated for ${groupKey}`, 50, 750, { align: "center" });
    });

    doc.end();
  } catch (error) {
    console.error("Error generating signature sheet:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
