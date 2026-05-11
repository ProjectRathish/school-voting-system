const db = require("../config/db");
const XLSX = require("xlsx");

exports.uploadVoters = async (req, res) => {
  try {
    const school_id = req.user.school_id;
    const { election_id } = req.body;

    const workbook = XLSX.read(req.file.buffer);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    // Check Voter Limit
    const [schoolInfo] = await db.execute(`
      SELECT s.custom_max_voters, p.max_voters 
      FROM schools s
      LEFT JOIN subscription_plans p ON s.plan_id = p.id
      WHERE s.id = ?
    `, [school_id]);

    const maxVoters = (schoolInfo[0]?.custom_max_voters !== null && schoolInfo[0]?.custom_max_voters !== undefined) 
      ? schoolInfo[0].custom_max_voters 
      : (schoolInfo[0]?.max_voters || 450);

    const [currentVoterCount] = await db.execute(
      "SELECT COUNT(*) as count FROM voters WHERE school_id = ?",
      [school_id]
    );

    if (currentVoterCount[0].count + rows.length > maxVoters) {
      return res.status(403).json({ 
        message: `Voter limit exceeded. Your current plan allows a maximum of ${maxVoters} voters. You are trying to add ${rows.length} more, but already have ${currentVoterCount[0].count}.` 
      });
    }

    /* Load classes and join with sections for accurate mapping */
    const [classes] = await db.execute(
      `SELECT classes.id, classes.name, sections.name AS section_name
       FROM classes
       JOIN sections ON classes.section_id = sections.id
       WHERE classes.school_id = ? AND (classes.election_id = ? OR classes.election_id IS NULL)`,
      [school_id, election_id]
    );

    const classMap = {};
    classes.forEach(c => {
      // Key is "Section Name | Class Name" to handle duplicates across sections
      const key = `${c.section_name} | ${c.name}`.toLowerCase();
      classMap[key] = c.id;
    });

    let inserted = 0;
    const errors = [];
    const valuesList = [];
    const batchSize = 100;
    
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const sectionName = (row.section || "").toString().trim();
        const className = (row.class || "").toString().trim();
        const key = `${sectionName} | ${className}`.toLowerCase();
        
        const class_id = classMap[key];
        if (!class_id) {
            errors.push(`Row ${i + 2}: Combination of "${sectionName}" and "${className}" not found. Please refer to the 'Valid Classes' reference sheet.`);
            continue;
        }

        valuesList.push([
            school_id,
            election_id,
            (row.admission_no || "").toString().trim().toUpperCase(),
            (row.name || "").toString().trim(),
            class_id,
            (row.division || null),
            row.sex ? row.sex.toString().toUpperCase().charAt(0) : 'M',
            0
        ]);
    }

    if (valuesList.length > 0) {
        for (let i = 0; i < valuesList.length; i += batchSize) {
            const batch = valuesList.slice(i, i + batchSize);
            const placeholders = batch.map(() => "(?,?,?,?,?,?,?,?)").join(",");
            const flatValues = batch.flat();
            
            await db.execute(
                `INSERT IGNORE INTO voters
                 (school_id, election_id, admission_no, name, class_id, division, sex, is_blocked)
                 VALUES ${placeholders}`,
                flatValues
            );
            inserted += batch.length;
        }
    }

    res.json({
        message: errors.length > 0 ? "Upload completed with errors" : "Voters uploaded successfully",
        inserted,
        errors
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error"
    });
  }
};
exports.createVoter = async (req, res) => {

 try {

  const school_id = req.user.school_id;

  const {
   election_id,
   admission_no,
   name,
   class_id,
   division,
   sex
  } = req.body;

    if (!election_id || !admission_no || !name || !class_id || !sex) {
     return res.status(400).json({
      message: "Required fields missing"
     });
    }

    // Check Voter Limit
    const [schoolInfo] = await db.execute(`
      SELECT s.custom_max_voters, p.max_voters 
      FROM schools s
      LEFT JOIN subscription_plans p ON s.plan_id = p.id
      WHERE s.id = ?
    `, [school_id]);

    const maxVoters = (schoolInfo[0]?.custom_max_voters !== null && schoolInfo[0]?.custom_max_voters !== undefined) 
      ? schoolInfo[0].custom_max_voters 
      : (schoolInfo[0]?.max_voters || 450);

    const [currentVoterCount] = await db.execute(
      "SELECT COUNT(*) as count FROM voters WHERE school_id = ?",
      [school_id]
    );

    if (currentVoterCount[0].count >= maxVoters) {
      return res.status(403).json({ 
        message: `Voter limit reached. Your current plan allows a maximum of ${maxVoters} voters. Please upgrade your plan.` 
      });
    }

  /* check duplicate voter */
  const [existing] = await db.execute(
   `SELECT id FROM voters
    WHERE election_id=? AND admission_no=?`,
   [election_id, admission_no]
  );

  if (existing.length > 0) {
   return res.status(400).json({
    message: "Voter already exists"
   });
  }

  const [result] = await db.execute(
    `INSERT INTO voters
     (school_id,election_id,admission_no,name,class_id,division,sex,is_blocked)
     VALUES (?,?,?,?,?,?,?,?)`,
    [
     school_id,
     election_id,
     admission_no,
     name,
     class_id,
     division || null,
     sex,
     0
    ]
  );

  res.json({
   message: "Voter added successfully",
   voter_id: result.insertId
  });

 } catch (error) {

  console.error(error);

  res.status(500).json({
   message: "Server error"
  });

 }

};
exports.getVoters = async (req, res) => {

 try {

  const school_id = req.user.school_id;
  const { 
    election_id, 
    page = 1, 
    limit = 1000, 
    search = '', 
    class_id = '',
    sex = '',
    status = '',
    is_candidate = '',
    section_id = '',
    division = ''
  } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let query = `
    SELECT 
      voters.id,
      voters.admission_no,
      voters.name,
      voters.sex,
      voters.division,
      voters.class_id,
      voters.is_blocked,
      voters.has_voted,
      classes.name AS class_name,
      sections.name AS section_name,
      CASE WHEN (SELECT 1 FROM candidates WHERE candidates.voter_id = voters.id LIMIT 1) THEN 1 ELSE 0 END AS is_candidate,
      (SELECT p.name FROM posts p JOIN candidates c ON p.id = c.post_id WHERE c.voter_id = voters.id LIMIT 1) AS candidate_post_name
    FROM voters
    LEFT JOIN classes ON voters.class_id = classes.id
    LEFT JOIN sections ON classes.section_id = sections.id
    WHERE voters.school_id=? AND voters.election_id=?
  `;
  const params = [school_id, election_id];

  if (search) {
    query += ` AND (voters.name LIKE ? OR voters.admission_no LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`);
  }

  if (class_id && class_id !== 'ANY') {
    const ids = class_id.split(',').map(s => s.trim()).filter(Boolean);
    if (ids.length > 0) {
      const placeholders = ids.map(() => '?').join(',');
      query += ` AND voters.class_id IN (${placeholders})`;
      params.push(...ids);
    }
  }

  if (sex && sex !== 'ANY') {
    const sexes = sex.split(',').map(s => s.trim()).filter(Boolean);
    if (sexes.length > 0) {
      const placeholders = sexes.map(() => '?').join(',');
      query += ` AND voters.sex IN (${placeholders})`;
      params.push(...sexes);
    }
  }

  if (status && status !== 'ANY') {
    const statuses = status.split(',').map(s => s.trim()).filter(Boolean);
    if (statuses.length > 0) {
      const statusConditions = [];
      statuses.forEach(s => {
        if (s === 'READY') statusConditions.push(`(voters.has_voted = 0 AND voters.is_blocked = 0)`);
        else if (s === 'VOTED') statusConditions.push(`voters.has_voted = 1`);
        else if (s === 'BLOCKED') statusConditions.push(`voters.is_blocked = 1`);
      });
      if (statusConditions.length > 0) {
        query += ` AND (${statusConditions.join(' OR ')})`;
      }
    }
  }

  if (is_candidate && is_candidate !== 'ANY') {
    if (is_candidate === 'YES') {
        query += ` AND EXISTS (SELECT 1 FROM candidates WHERE candidates.voter_id = voters.id)`;
    } else {
        query += ` AND NOT EXISTS (SELECT 1 FROM candidates WHERE candidates.voter_id = voters.id)`;
    }
  }

  if (section_id && section_id !== 'ANY') {
    const ids = section_id.split(',').map(s => s.trim()).filter(Boolean);
    if (ids.length > 0) {
      const placeholders = ids.map(() => '?').join(',');
      query += ` AND classes.section_id IN (${placeholders})`;
      params.push(...ids);
    }
  }

  if (division && division !== 'ANY') {
    const divisions = division.split(',').map(s => s.trim()).filter(Boolean);
    if (divisions.length > 0) {
      const placeholders = divisions.map(() => '?').join(',');
      query += ` AND voters.division IN (${placeholders})`;
      params.push(...divisions);
    }
  }

  // Count total voters with current filters
  const countQuery = `SELECT COUNT(*) as total FROM (${query}) as sub`;
  const [countRows] = await db.execute(countQuery, params);
  const total = countRows[0].total;

  query += ` ORDER BY voters.admission_no LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), offset);

  const [rows] = await db.execute(query, params);

  res.json({
    data: rows,
    total,
    page: parseInt(page),
    limit: parseInt(limit)
  });

 } catch (error) {

  console.error(error);

  res.status(500).json({
   message: "Server error"
  });

 }

};

exports.getVoter = async (req, res) => {

 try {

  const school_id = req.user.school_id;
  const { voter_id } = req.params;

  const [rows] = await db.execute(
   `SELECT 
      voters.id,
      voters.admission_no,
      voters.name,
      voters.sex,
      voters.division,
      voters.has_voted,
      voters.election_id,
      classes.name AS class_name,
      sections.name AS section_name
    FROM voters
    LEFT JOIN classes ON voters.class_id = classes.id
    LEFT JOIN sections ON classes.section_id = sections.id
    WHERE voters.id=? AND voters.school_id=?`,
   [voter_id, school_id]
  );

  if (rows.length === 0) {
   return res.status(404).json({
    message: "Voter not found"
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

exports.updateVoter = async (req, res) => {
  try {
    const school_id = req.user.school_id;
    const { voter_id } = req.params;
    const { name, sex, class_id, division, is_blocked } = req.body;

    const [existing] = await db.execute(
      `SELECT id FROM voters WHERE id=? AND school_id=?`,
      [voter_id, school_id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        message: "Voter not found"
      });
    }

    let updateFields = [];
    let updateValues = [];

    if (name) {
      updateFields.push("name=?");
      updateValues.push(name);
    }

    if (sex) {
      updateFields.push("sex=?");
      updateValues.push(sex);
    }

    if (class_id) {
      updateFields.push("class_id=?");
      updateValues.push(class_id);
    }

    if (division !== undefined) {
      updateFields.push("division=?");
      updateValues.push(division);
    }

    if (is_blocked !== undefined) {
      updateFields.push("is_blocked=?");
      updateValues.push(is_blocked);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        message: "No fields to update"
      });
    }

    updateValues.push(voter_id, school_id);

    await db.execute(
      `UPDATE voters SET ${updateFields.join(", ")} WHERE id=? AND school_id=?`,
      updateValues
    );

    res.json({
      message: "Voter updated successfully"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error"
    });
  }
};

exports.deleteVoter = async (req, res) => {

 try {

  const school_id = req.user.school_id;
  const { voter_id } = req.params;

  const [existing] = await db.execute(
   `SELECT id FROM voters WHERE id=? AND school_id=?`,
   [voter_id, school_id]
  );

  if (existing.length === 0) {
   return res.status(404).json({
    message: "Voter not found"
   });
  }

  // Manually delete candidacy record first (prevents FK failures)
  await db.execute(
    `DELETE FROM candidates WHERE voter_id=? AND school_id=?`,
    [voter_id, school_id]
  );

  await db.execute(
   `DELETE FROM voters WHERE id=? AND school_id=?`,
   [voter_id, school_id]
  );

  res.json({
   message: "Voter deleted successfully"
  });

 } catch (error) {

  console.error(error);

  res.status(500).json({
   message: "Server error"
  });

 }

};

exports.downloadTemplate = async (req, res) => {
  try {
    const { election_id } = req.query;
    const school_id = req.user.school_id;
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Voter Import');

    sheet.columns = [
      { header: 'admission_no', key: 'admission_no', width: 20 },
      { header: 'name', key: 'name', width: 30 },
      { header: 'section', key: 'section', width: 20 },
      { header: 'class', key: 'class', width: 15 },
      { header: 'division', key: 'division', width: 15 },
      { header: 'sex', key: 'sex', width: 10 }
    ];

    // If election_id is available, fetch real classes to provide as hints
    if (election_id) {
      const [classes] = await db.execute(
        `SELECT classes.name AS class_name, sections.name AS section_name
         FROM classes
         JOIN sections ON classes.section_id = sections.id
         WHERE classes.school_id = ? AND (classes.election_id = ? OR classes.election_id IS NULL)`,
        [school_id, election_id]
      );

      if (classes.length > 0) {
        const refSheet = workbook.addWorksheet('Valid Classes (Reference)');
        refSheet.columns = [
          { header: 'Section Name', key: 'section_name', width: 25 },
          { header: 'Class Name', key: 'class_name', width: 20 }
        ];
        classes.forEach(c => refSheet.addRow(c));

        // Instructions for the user
        refSheet.addRow({});
        refSheet.addRow({ section_name: 'INSTRUCTIONS:' });
        refSheet.addRow({ section_name: 'Please use the exact Section and Class names above' });
        refSheet.addRow({ section_name: 'in your Voter Import sheet to avoid errors.' });

        // Add a sample row using real data
        sheet.addRow({
          admission_no: '1001',
          name: 'Sample Student Name',
          section: classes[0].section_name,
          class: classes[0].class_name,
          division: 'A',
          sex: 'M'
        });
      } else {
        // Sample row with generic data if no classes yet
        sheet.addRow({ admission_no: '1001', name: 'John Doe', section: 'Main Section', class: 'Grade-1', sex: 'M' });
      }
    } else {
      // Sample row with generic data
      sheet.addRow({ admission_no: '1001', name: 'John Doe', section: 'Section-A', class: 'Class-1', sex: 'M' });
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="Voter_Import_Template.xlsx"');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error generating template:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.verifyVoter = async (req, res) => {
  try {
    const { admission_no } = req.params;
    const { election_id } = req.query;
    const school_id = req.user.school_id;

    if (!admission_no || !election_id) {
       return res.status(400).json({ message: "admission_no and election_id are required" });
    }

    const [rows] = await db.execute(
       `SELECT v.*, c.name as class_name, (SELECT p.name FROM posts p JOIN candidates can ON p.id = can.post_id WHERE can.voter_id = v.id LIMIT 1) AS candidate_post_name 
        FROM voters v
        LEFT JOIN classes c ON v.class_id = c.id
        WHERE v.admission_no=? AND v.election_id=? AND v.school_id=?`,
       [admission_no, election_id, school_id]
    );

    if (rows.length === 0) {
       return res.status(404).json({ message: "Voter not found in this election" });
    }

    const voter = rows[0];

    // Return status info
    res.json({
       message: "Voter found",
       voter: {
          id: voter.id,
          name: voter.name,
          admission_no: voter.admission_no,
          class_id: voter.class_id,
          class_name: voter.class_name,
          sex: voter.sex,
          is_candidate: !!voter.candidate_post_name,
          candidate_post_name: voter.candidate_post_name,
          has_voted: voter.has_voted,
          is_active: voter.is_active,
          is_blocked: voter.is_blocked
       }
    });

  } catch (error) {
    console.error("Error verifying voter:", error);
    res.status(500).json({ message: "Server error during verification" });
  }
};
exports.clearVoters = async (req, res) => {
  try {
    const school_id = req.user.school_id;
    const { election_id } = req.body;
    const db = require('../config/db');
    await db.execute('DELETE FROM voters WHERE school_id=? AND election_id=?', [school_id, election_id]);
    res.json({ message: "All voters cleared for this election." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.bulkDeleteVoters = async (req, res) => {
  try {
    const school_id = req.user.school_id;
    const { election_id, voter_ids } = req.body;

    if (!election_id || !voter_ids || !Array.isArray(voter_ids) || voter_ids.length === 0) {
      return res.status(400).json({ message: "Invalid request. Election ID and Voter IDs are required." });
    }

    // Security check: ensure the election belongs to the school
    const [election] = await db.execute(
      "SELECT id FROM elections WHERE id = ? AND school_id = ?",
      [election_id, school_id]
    );

    if (election.length === 0) {
      return res.status(403).json({ message: "Unauthorized access to this election." });
    }

    // Delete voters (only if they belong to this school and election)
    // Using a set of placeholders for the IN clause
    const placeholders = voter_ids.map(() => "?").join(",");
    const query = `DELETE FROM voters WHERE id IN (${placeholders}) AND school_id = ? AND election_id = ?`;
    
    const [result] = await db.execute(query, [...voter_ids, school_id, election_id]);

    res.json({
      message: `${result.affectedRows} voters deleted successfully.`,
      deleted_count: result.affectedRows
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during bulk delete." });
  }
};
