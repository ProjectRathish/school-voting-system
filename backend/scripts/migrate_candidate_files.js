const db = require("./config/db");
const fs = require("fs");
const path = require("path");

async function migrate() {
  try {
    console.log("Starting migration of candidate files...");

    const [candidates] = await db.execute(`
      SELECT c.id, c.photo, c.symbol, c.election_id, s.code as school_code, s.id as school_id
      FROM candidates c
      JOIN schools s ON c.school_id = s.id
    `);

    console.log(`Found ${candidates.length} candidates.`);

    for (const c of candidates) {
      const school_code = c.school_code || `school_${c.school_id}`;
      const election_id = c.election_id;

      // Migrate Photo
      if (c.photo && c.photo.includes("/candidate-photo/")) {
        const oldFileName = path.basename(c.photo);
        const oldPath = path.join(__dirname, "uploads", "candidate-photo", oldFileName);
        
        const newDir = path.join(__dirname, "uploads", "candidates", school_code, String(election_id), "photos");
        const newPath = path.join(newDir, oldFileName);
        const dbPath = `/uploads/candidates/${school_code}/${election_id}/photos/${oldFileName}`;

        if (fs.existsSync(oldPath)) {
          if (!fs.existsSync(newDir)) fs.mkdirSync(newDir, { recursive: true });
          fs.renameSync(oldPath, newPath);
          await db.execute("UPDATE candidates SET photo = ? WHERE id = ?", [dbPath, c.id]);
          console.log(`Moved photo: ${oldFileName} -> ${dbPath}`);
        } else {
          console.warn(`Photo not found on disk: ${oldPath}`);
        }
      }

      // Migrate Symbol
      if (c.symbol && c.symbol.includes("/candidate-symbol/")) {
        const oldFileName = path.basename(c.symbol);
        const oldPath = path.join(__dirname, "uploads", "candidate-symbol", oldFileName);
        
        const newDir = path.join(__dirname, "uploads", "candidates", school_code, String(election_id), "symbols");
        const newPath = path.join(newDir, oldFileName);
        const dbPath = `/uploads/candidates/${school_code}/${election_id}/symbols/${oldFileName}`;

        if (fs.existsSync(oldPath)) {
          if (!fs.existsSync(newDir)) fs.mkdirSync(newDir, { recursive: true });
          fs.renameSync(oldPath, newPath);
          await db.execute("UPDATE candidates SET symbol = ? WHERE id = ?", [dbPath, c.id]);
          console.log(`Moved symbol: ${oldFileName} -> ${dbPath}`);
        } else {
          console.warn(`Symbol not found on disk: ${oldPath}`);
        }
      }
    }

    console.log("Migration complete.");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

migrate();
