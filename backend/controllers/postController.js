const db = require("../config/db");


/* CREATE POST */

exports.createPost = async (req, res) => {

 try {

  const school_id = req.user.school_id;

  const {
   election_id,
   name,
   gender_rule,
   candidate_classes,
   voting_classes
  } = req.body;


  if (!election_id || !name) {

   return res.status(400).json({
    message: "Required fields missing"
   });

  }


  /* check duplicate */

  const [existing] = await db.execute(
   `SELECT id
    FROM posts
    WHERE school_id=? AND election_id=? AND name=?`,
   [school_id, election_id, name]
  );

  if (existing.length > 0) {

   return res.status(400).json({
    message: "Post already exists"
   });

  }


  /* create post */

  const [result] = await db.execute(
   `INSERT INTO posts
    (school_id,election_id,name,gender_rule,candidate_classes,voting_classes)
    VALUES (?,?,?,?,?,?)`,
   [
    school_id,
    election_id,
    name,
    gender_rule || "ANY",
    JSON.stringify(candidate_classes || []),
    JSON.stringify(voting_classes || [])
   ]
  );


  res.json({
   message: "Post created successfully",
   post_id: result.insertId
  });

 } catch (error) {

  console.error(error);

  res.status(500).json({
   message: "Server error"
  });

 }

};




/* GET POSTS */

exports.getPosts = async (req, res) => {

 try {

  const school_id = req.user.school_id;
  const { election_id } = req.query;


  const [rows] = await db.execute(
   `SELECT
     id,
     election_id,
     name,
     gender_rule,
     candidate_classes,
     voting_classes
    FROM posts
    WHERE school_id=? AND election_id=?`,
   [school_id, election_id]
  );


  /* convert JSON fields */

  rows.forEach(post => {

   post.candidate_classes = JSON.parse(post.candidate_classes || "[]");
   post.voting_classes = JSON.parse(post.voting_classes || "[]");

  });


  res.json(rows);

 } catch (error) {

  console.error(error);

  res.status(500).json({
   message: "Server error"
  });

 }

};

/* GET SINGLE POST */

exports.getPost = async (req, res) => {

 try {

  const school_id = req.user.school_id;
  const { post_id } = req.params;

  const [rows] = await db.execute(
   `SELECT
     id,
     name,
     gender_rule,
     candidate_classes,
     voting_classes,
     election_id
    FROM posts
    WHERE id=? AND school_id=?`,
   [post_id, school_id]
  );

  if (rows.length === 0) {
   return res.status(404).json({
    message: "Post not found"
   });
  }

  const post = rows[0];
  post.candidate_classes = JSON.parse(post.candidate_classes || "[]");
  post.voting_classes = JSON.parse(post.voting_classes || "[]");

  res.json(post);

 } catch (error) {

  console.error(error);

  res.status(500).json({
   message: "Server error"
  });

 }

};

/* UPDATE POST */

exports.updatePost = async (req, res) => {

 try {

  const school_id = req.user.school_id;
  const { post_id } = req.params;
  const { name, gender_rule, candidate_classes, voting_classes } = req.body;

  const [existing] = await db.execute(
   `SELECT id FROM posts WHERE id=? AND school_id=?`,
   [post_id, school_id]
  );

  if (existing.length === 0) {
   return res.status(404).json({
    message: "Post not found"
   });
  }

  let updateFields = [];
  let updateValues = [];

  if (name) {
   updateFields.push("name=?");
   updateValues.push(name);
  }

  if (gender_rule) {
   updateFields.push("gender_rule=?");
   updateValues.push(gender_rule);
  }

  if (candidate_classes) {
   updateFields.push("candidate_classes=?");
   updateValues.push(JSON.stringify(candidate_classes));
  }

  if (voting_classes) {
   updateFields.push("voting_classes=?");
   updateValues.push(JSON.stringify(voting_classes));
  }

  if (updateFields.length === 0) {
   return res.status(400).json({
    message: "No fields to update"
   });
  }

  updateValues.push(post_id, school_id);

  await db.execute(
   `UPDATE posts SET ${updateFields.join(", ")} WHERE id=? AND school_id=?`,
   updateValues
  );

  res.json({
   message: "Post updated successfully"
  });

 } catch (error) {

  console.error(error);

  res.status(500).json({
   message: "Server error"
  });

 }

};

/* DELETE POST */

exports.deletePost = async (req, res) => {

 try {

  const school_id = req.user.school_id;
  const { post_id } = req.params;

  const [existing] = await db.execute(
   `SELECT id FROM posts WHERE id=? AND school_id=?`,
   [post_id, school_id]
  );

  if (existing.length === 0) {
   return res.status(404).json({
    message: "Post not found"
   });
  }

  await db.execute(
   `DELETE FROM posts WHERE id=? AND school_id=?`,
   [post_id, school_id]
  );

  res.json({
   message: "Post deleted successfully"
  });

 } catch (error) {

  console.error(error);

  res.status(500).json({
   message: "Server error"
  });

 }

};