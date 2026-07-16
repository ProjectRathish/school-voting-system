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

    // 4. Fetch Results per Post (Sorted by Display Order Descending)
    const [posts] = await db.execute(
      "SELECT id, name, priority, allow_nota FROM posts WHERE election_id = ? AND school_id = ? ORDER BY priority DESC, name ASC",
      [id, school_id]
    );

    const reportData = [];
    for (const post of posts) {
      const [candidates] = await db.execute(
        `SELECT 
          c.id as candidate_id, 
          v.name as candidate_name, 
          c.symbol,
          c.symbol_name,
          cl.name as class_name,
          s.name as section_name,
          (SELECT COUNT(*) FROM votes WHERE candidate_id = c.id) as votes
        FROM candidates c
        JOIN voters v ON c.voter_id = v.id
        LEFT JOIN classes cl ON v.class_id = cl.id
        LEFT JOIN sections s ON cl.section_id = s.id
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
            symbol_name: '-',
            class_name: '-',
            section_name: '',
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
    // Top banner colored accent bar
    doc.rect(50, 40, 500, 3).fill("#6366f1");

    const logoWidth = 60;
    const headerTextX = school.logo && fs.existsSync(path.join(__dirname, "..", school.logo)) ? 125 : 50;

    if (school.logo) {
      const logoPath = path.join(__dirname, "..", school.logo);
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, 48, { width: logoWidth });
      }
    }

    doc
      .font("Helvetica")
      .fillColor("#1e293b")
      .fontSize(16)
      .text(school.name.toUpperCase(), headerTextX, 50, { align: "left" })
      .fontSize(9)
      .fillColor("#64748b")
      .text(school.location || "Official Election Authority", headerTextX, 70, { align: "left" })
      .font("Helvetica-Bold")
      .fillColor("#6366f1")
      .text("OFFICIAL ELECTION CERTIFICATE", headerTextX, 84, { align: "left", characterSpacing: 1 })
      .moveDown();

    doc
      .strokeColor("#e2e8f0")
      .lineWidth(1)
      .moveTo(50, 112)
      .lineTo(550, 112)
      .stroke();

    // --- Election Title ---
    doc
      .moveDown(1.2)
      .font("Helvetica-Bold")
      .fillColor("#1e1b4b")
      .fontSize(20)
      .text(election.name, { align: "center" })
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#64748b")
      .text(`STATUS: ${election.status.toUpperCase()}  |  GENERATED: ${new Date().toLocaleString().toUpperCase()}`, { align: "center" })
      .moveDown(0.5);

    // Subtle accent line under election header
    doc
      .moveTo(220, doc.y)
      .lineTo(380, doc.y)
      .strokeColor("#6366f1")
      .lineWidth(1.5)
      .stroke();

    doc.moveDown(1.5);

    // --- Stats Summary Section (Cards) ---
    const statsTop = doc.y + 5;
    const cardWidth = 153;
    const cardHeight = 55;
    const cardGap = 20;
    
    drawStatsCard(doc, 50, statsTop, cardWidth, cardHeight, "REGISTERED VOTERS", totalVoters.toString(), "#6366f1");
    drawStatsCard(doc, 50 + cardWidth + cardGap, statsTop, cardWidth, cardHeight, "TOTAL VOTES CAST", votedCount.toString(), "#10b981");
    drawStatsCard(doc, 50 + 2 * (cardWidth + cardGap), statsTop, cardWidth, cardHeight, "ELECTION TURNOUT", `${turnoutPercentage}%`, "#fbbf24");
    
    doc.y = statsTop + cardHeight + 25; // Move cursor past stats section
    doc.font("Helvetica"); // Reset default font

    // --- Results Breakdown ---
    for (const post of reportData) {
      // Orphan post header prevention
      if (doc.y > 620) {
        doc.addPage();
      }

      const postY = doc.y;
      // Draw left accent bar for post name
      doc.rect(50, postY - 1, 4, 15).fill("#4f46e5");

      doc
        .font("Helvetica-Bold")
        .fillColor("#1e293b")
        .fontSize(12)
        .text(post.post_name.toUpperCase(), 62, postY)
        .moveDown(0.6);

      // Table Header
      const tableTop = doc.y;
      doc.rect(50, tableTop - 5, 500, 20).fill("#f1f5f9");
      doc
        .font("Helvetica-Bold")
        .fillColor("#334155")
        .fontSize(8)
        .text("CANDIDATE", 55, tableTop + 1)
        .text("CLASS", 170, tableTop + 1)
        .text("SYMBOL", 230, tableTop + 1, { width: 30, align: "center" })
        .text("SYMBOL NAME", 270, tableTop + 1)
        .text("VOTES", 360, tableTop + 1, { width: 60, align: "right" })
        .text("PERCENT", 420, tableTop + 1, { width: 70, align: "right" })
        .text("PROGRESS", 500, tableTop + 1);
      
      doc
        .moveTo(50, tableTop + 15)
        .lineTo(550, tableTop + 15)
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
          doc.rect(50, 50, 500, 20).fill("#f1f5f9");
          doc.font("Helvetica-Bold").fillColor("#334155").fontSize(8)
             .text("CANDIDATE", 55, 56)
             .text("CLASS", 170, 56)
             .text("SYMBOL", 230, 56, { width: 30, align: "center" })
             .text("SYMBOL NAME", 270, 56)
             .text("VOTES", 360, 56, { width: 60, align: "right" })
             .text("PERCENT", 420, 56, { width: 70, align: "right" })
             .text("PROGRESS", 500, 56);
          doc.moveTo(50, 70).lineTo(550, 70).strokeColor("#cbd5e1").lineWidth(1).stroke();
          currentY = 80;
        }

        if (isWinner) {
          doc.lineJoin('round').rect(50, currentY - 3, 500, 24).fillAndStroke("#fefcbf", "#fef08a");
        }

        const className = c.class_name ? (c.section_name ? `${c.class_name} - ${c.section_name}` : c.class_name) : '-';

        doc
          .font(isWinner ? "Helvetica-Bold" : "Helvetica")
          .fillColor(isWinner ? "#854d0e" : "#0f172a")
          .fontSize(9)
          .text(c.candidate_name, 55, isWinner ? currentY - 2 : currentY + 3, { width: 110, height: 12, ellipsis: true });

        if (isWinner) {
          doc
            .font("Helvetica-Bold")
            .fillColor("#b45309")
            .fontSize(7)
            .text("🏆 WINNER", 55, currentY + 9);
        }

        doc
          .font(isWinner ? "Helvetica-Bold" : "Helvetica")
          .fillColor(isWinner ? "#854d0e" : "#334155")
          .fontSize(9)
          .text(className, 170, currentY + 3, { width: 55, height: 12, ellipsis: true });

        // Draw Candidate Symbol image (if available)
        if (c.symbol) {
          const symbolPath = path.join(__dirname, "..", c.symbol);
          if (fs.existsSync(symbolPath)) {
            doc.image(symbolPath, 235, currentY - 1, { width: 20, height: 20 });
          }
        }

        doc
          .font(isWinner ? "Helvetica-Bold" : "Helvetica")
          .fillColor(isWinner ? "#854d0e" : "#334155")
          .fontSize(9)
          .text(c.symbol_name || '-', 270, currentY + 3, { width: 85, height: 12, ellipsis: true });

        doc
          .font(isWinner ? "Helvetica-Bold" : "Helvetica")
          .fillColor(isWinner ? "#854d0e" : "#0f172a")
          .fontSize(9)
          .text(c.votes.toString(), 360, currentY + 3, { width: 60, align: "right" })
          .text(`${pct}%`, 420, currentY + 3, { width: 70, align: "right" });

        // Draw vote share bar (aligned to end at 550)
        doc.lineJoin('miter').rect(500, currentY + 6, 50, 6).fill("#e2e8f0");
        if (c.votes > 0) {
          const barWidth = 50 * (c.votes / postTotal);
          doc.rect(500, currentY + 6, barWidth, 6).fill(isWinner ? "#d97706" : "#6366f1");
        }

        // Draw row separator
        if (!isWinner) {
          doc
            .moveTo(50, currentY + 24)
            .lineTo(550, currentY + 24)
            .strokeColor("#f1f5f9")
            .lineWidth(0.5)
            .stroke();
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
