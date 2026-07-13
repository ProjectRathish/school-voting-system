const db = require("../config/db");
const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");

function drawStatsCard(doc, x, y, width, height, label, value, accentColor) {
  // Card background with rounded corners
  doc.lineJoin('round').rect(x, y, width, height).fillAndStroke("#f8fafc", "#e2e8f0");
  
  // Left accent line
  doc.rect(x, y, 4, height).fill(accentColor);
  
  // Label text
  doc.font("Helvetica").fillColor("#64748b").fontSize(8).text(label, x + 15, y + 12, { width: width - 20, align: "left" });
  
  // Value text
  doc.font("Helvetica-Bold").fillColor("#0f172a").fontSize(16).text(value, x + 15, y + 26, { width: width - 20, align: "left" });
}

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
      "SELECT id, name, priority, allow_nota FROM posts WHERE election_id = ? AND school_id = ? ORDER BY priority ASC, name ASC",
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

      const [[notaRow]] = await db.execute(
        `SELECT COUNT(*) as count FROM votes WHERE post_id = ? AND candidate_id IS NULL`,
        [post.id]
      );
      const notaCount = Number(notaRow?.count) || 0;

      const isContested = candidates.length > 1;
      if (isContested) {
        if (post.allow_nota !== 0) {
          candidates.push({
            candidate_id: -1,
            candidate_name: 'None of the Above (NOTA)',
            symbol: null,
            votes: notaCount,
            is_nota: true
          });
        }
        candidates.sort((a, b) => b.votes - a.votes);
      }

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
      .font("Helvetica")
      .fillColor("#444444")
      .fontSize(16)
      .text(school.name.toUpperCase(), 125, 48, { align: "left" })
      .fontSize(9)
      .fillColor("#64748b")
      .text(school.location || "Official Election Authority", 125, 68, { align: "left" })
      .font("Helvetica-Bold")
      .fillColor("#6366f1")
      .text("OFFICIAL ELECTION CERTIFICATE", 125, 82, { align: "left", characterSpacing: 1 })
      .moveDown();

    doc
      .strokeColor("#e2e8f0")
      .lineWidth(1)
      .moveTo(50, 110)
      .lineTo(550, 110)
      .stroke();

    // --- Election Title ---
    doc
      .moveDown(2)
      .font("Helvetica-Bold")
      .fillColor("#0f172a")
      .fontSize(22)
      .text(election.name, { align: "center" })
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#64748b")
      .text(`Status: ${election.status}  |  Generated: ${new Date().toLocaleString()}`, { align: "center" })
      .moveDown();

    // --- Stats Summary Section (Cards) ---
    const statsTop = doc.y + 10;
    const cardWidth = 140;
    const cardHeight = 55;
    const cardGap = 15;
    
    drawStatsCard(doc, 50, statsTop, cardWidth, cardHeight, "REGISTERED VOTERS", totalVoters.toString(), "#6366f1");
    drawStatsCard(doc, 50 + cardWidth + cardGap, statsTop, cardWidth, cardHeight, "TOTAL VOTES CAST", votedCount.toString(), "#10b981");
    drawStatsCard(doc, 50 + 2 * (cardWidth + cardGap), statsTop, cardWidth, cardHeight, "ELECTION TURNOUT", `${turnoutPercentage}%`, "#fbbf24");
    
    doc.y = statsTop + cardHeight + 25; // Move cursor past stats section
    doc.font("Helvetica"); // Reset default font

    // --- Results Breakdown ---
    for (const post of reportData) {
      doc
        .font("Helvetica-Bold")
        .fillColor("#4f46e5")
        .fontSize(14)
        .text(post.post_name)
        .moveDown(0.4);

      // Table Header
      const tableTop = doc.y;
      doc
        .font("Helvetica-Bold")
        .fillColor("#475569")
        .fontSize(9)
        .text("CANDIDATE", 80, tableTop)
        .text("VOTES", 320, tableTop, { width: 60, align: "right" })
        .text("PERCENTAGE", 400, tableTop, { width: 80, align: "right" })
        .text("VOTE SHARE PROGRESS", 500, tableTop);
      
      doc
        .moveTo(50, tableTop + 14)
        .lineTo(550, tableTop + 14)
        .strokeColor("#cbd5e1")
        .lineWidth(1)
        .stroke();

      let currentY = tableTop + 24;
      const postTotal = post.candidates.reduce((sum, cand) => sum + cand.votes, 0);

      post.candidates.forEach((c, index) => {
        const isWinner = index === 0 && c.votes > 0;
        const pct = postTotal > 0 ? ((c.votes / postTotal) * 100).toFixed(1) : "0.0";
        
        // Page break check (needs margin buffer for height 28)
        if (currentY > 700) {
          doc.addPage();
          // Draw table header on new page
          doc.font("Helvetica-Bold").fillColor("#475569").fontSize(9)
             .text("CANDIDATE", 80, 50)
             .text("VOTES", 320, 50, { width: 60, align: "right" })
             .text("PERCENTAGE", 400, 50, { width: 80, align: "right" })
             .text("VOTE SHARE PROGRESS", 500, 50);
          doc.moveTo(50, 64).lineTo(550, 64).strokeColor("#cbd5e1").lineWidth(1).stroke();
          currentY = 74;
        }

        if (isWinner) {
          doc.lineJoin('round').rect(50, currentY - 5, 500, 24).fillAndStroke("#fef9c3", "#fef08a");
        }

        // Draw Candidate Symbol image (if available)
        if (c.symbol) {
          const symbolPath = path.join(__dirname, "..", c.symbol);
          if (fs.existsSync(symbolPath)) {
            doc.image(symbolPath, 52, currentY - 3, { width: 20, height: 20 });
          }
        }

        doc
          .font(isWinner ? "Helvetica-Bold" : "Helvetica")
          .fillColor(isWinner ? "#854d0e" : "#0f172a")
          .fontSize(10)
          .text(c.candidate_name, 80, currentY);

        if (isWinner) {
          doc
            .font("Helvetica-Bold")
            .fillColor("#eab308")
            .fontSize(8)
            .text("🏆 WINNER", 230, currentY + 1.5);
        }

        doc
          .font(isWinner ? "Helvetica-Bold" : "Helvetica")
          .fillColor("#0f172a")
          .fontSize(10)
          .text(c.votes.toString(), 320, currentY, { width: 60, align: "right" })
          .text(`${pct}%`, 400, currentY, { width: 80, align: "right" });

        // Draw vote share bar
        doc.lineJoin('miter').rect(500, currentY + 3, 50, 6).fill("#e2e8f0");
        if (c.votes > 0) {
          const barWidth = 50 * (c.votes / postTotal);
          doc.rect(500, currentY + 3, barWidth, 6).fill(isWinner ? "#eab308" : "#6366f1");
        }

        currentY += 28;
      });

      doc.y = currentY + 10;
      doc.moveDown(1.5);
    }

    // --- Footer Section ---
    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor("#94a3b8")
      .text(
        `Digital Verification Serial: SV-${school_id}-${election.id}-${Date.now().toString().substring(8)}`,
        50,
        745,
        { align: "center" }
      )
      .text(
        "This is a computer-generated official document. No signature is required for electronic verification.",
        50,
        757,
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

    // Sort voters in each class/division alphabetically by name
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base', numeric: true }));
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
