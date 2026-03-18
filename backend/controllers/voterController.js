const db = require("../config/db");
const XLSX = require("xlsx");

exports.uploadVoters = async (req, res) => {

 try {

  const school_id = req.user.school_id;
  const { election_id } = req.body;

  const workbook = XLSX.read(req.file.buffer);

  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  const rows = XLSX.utils.sheet_to_json(sheet);

  /* Load classes */
  const [classes] = await db.execute(
   `SELECT id,name
    FROM classes
    WHERE school_id=? AND election_id=?`,
   [school_id, election_id]
  );

  const classMap = {};

  classes.forEach(c => {
   classMap[c.name] = c.id;
  });

  let inserted = 0;

  for (const row of rows) {

   const class_id = classMap[row.class];

   if (!class_id) continue;

   await db.execute(
    `INSERT IGNORE INTO voters
     (school_id,election_id,admission_no,name,class_id,sex)
     VALUES (?,?,?,?,?,?)`,
    [
     school_id,
     election_id,
     row.admission_no,
     row.name,
     class_id,
     row.sex
    ]
   );

   inserted++;

  }

  res.json({
   message: "Voters uploaded",
   inserted
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
   class_name,
   sex
  } = req.body;

  if (!election_id || !admission_no || !name || !class_name || !sex) {
   return res.status(400).json({
    message: "Required fields missing"
   });
  }

  /* find class_id using class name */
  const [classRow] = await db.execute(
   `SELECT id
    FROM classes
    WHERE school_id=? AND election_id=? AND name=?`,
   [school_id, election_id, class_name]
  );

  if (classRow.length === 0) {
   return res.status(400).json({
    message: "Class not found"
   });
  }

  const class_id = classRow[0].id;

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
    (school_id,election_id,admission_no,name,class_id,sex)
    VALUES (?,?,?,?,?,?)`,
   [
    school_id,
    election_id,
    admission_no,
    name,
    class_id,
    sex
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
  const { election_id } = req.query;

  const [rows] = await db.execute(
   `SELECT 
      voters.id,
      voters.admission_no,
      voters.name,
      voters.sex,
      classes.name AS class
    FROM voters
    JOIN classes ON voters.class_id = classes.id
    WHERE voters.school_id=? AND voters.election_id=?
    ORDER BY voters.admission_no`,
   [school_id, election_id]
  );

  res.json(rows);

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
      voters.election_id,
      classes.name AS class
    FROM voters
    JOIN classes ON voters.class_id = classes.id
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
  const { name, sex, class_name } = req.body;

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

  if (class_name) {
   const [voterData] = await db.execute(
    `SELECT election_id FROM voters WHERE id=?`,
    [voter_id]
   );

   const election_id = voterData[0].election_id;

   const [classRow] = await db.execute(
    `SELECT id FROM classes WHERE name=? AND election_id=? AND school_id=?`,
    [class_name, election_id, school_id]
   );

   if (classRow.length === 0) {
    return res.status(400).json({
     message: "Class not found"
    });
   }

   updateFields.push("class_id=?");
   updateValues.push(classRow[0].id);
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
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Voter Template');

    sheet.columns = [
      { header: 'admission_no', key: 'admission_no', width: 20 },
      { header: 'name', key: 'name', width: 30 },
      { header: 'class', key: 'class', width: 15 },
      { header: 'sex', key: 'sex', width: 10 }
    ];

    // Add a sample row
    sheet.addRow({
      admission_no: '1001',
      name: 'John Doe',
      class: '10-A',
      sex: 'M'
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="Voter_Import_Template.xlsx"'
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error("Error generating template:", error);
    res.status(500).json({ message: "Server error" });
  }
};