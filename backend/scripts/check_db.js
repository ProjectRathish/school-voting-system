const db = require("./config/db");

async function check() {
    try {
        const [rows] = await db.execute("SELECT COUNT(*) as totalSchools FROM schools");
        console.log("Total Schools:", rows[0].totalSchools);
        const [all] = await db.execute("SELECT id, name FROM schools");
        console.log("All Schools:", all);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

check();
