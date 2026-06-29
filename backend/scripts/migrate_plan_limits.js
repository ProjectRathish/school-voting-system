const db = require('../config/db');

async function migrate() {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    console.log("Updating subscription_plans table...");
    const [planCols] = await connection.execute("SHOW COLUMNS FROM subscription_plans");
    const planColNames = planCols.map(c => c.Field);

    if (!planColNames.includes('max_booths')) {
      await connection.execute("ALTER TABLE subscription_plans ADD COLUMN max_booths INT NOT NULL DEFAULT 5");
    }
    if (!planColNames.includes('max_machines')) {
      await connection.execute("ALTER TABLE subscription_plans ADD COLUMN max_machines INT NOT NULL DEFAULT 10");
    }
    if (!planColNames.includes('max_officers')) {
      await connection.execute("ALTER TABLE subscription_plans ADD COLUMN max_officers INT NOT NULL DEFAULT 5");
    }

    console.log("Updating schools table...");
    const [schoolCols] = await connection.execute("SHOW COLUMNS FROM schools");
    const schoolColNames = schoolCols.map(c => c.Field);

    if (!schoolColNames.includes('custom_max_booths')) {
      await connection.execute("ALTER TABLE schools ADD COLUMN custom_max_booths INT DEFAULT NULL");
    }
    if (!schoolColNames.includes('custom_max_machines')) {
      await connection.execute("ALTER TABLE schools ADD COLUMN custom_max_machines INT DEFAULT NULL");
    }
    if (!schoolColNames.includes('custom_max_officers')) {
      await connection.execute("ALTER TABLE schools ADD COLUMN custom_max_officers INT DEFAULT NULL");
    }

    console.log("Setting default plan values...");
    // Free plan limits
    await connection.execute(`
      UPDATE subscription_plans 
      SET max_booths = 2, max_machines = 2, max_officers = 2 
      WHERE name = 'Free'
    `);
    // Standard plan limits
    await connection.execute(`
      UPDATE subscription_plans 
      SET max_booths = 5, max_machines = 10, max_officers = 5 
      WHERE name = 'Standard'
    `);
    // Premium plan limits
    await connection.execute(`
      UPDATE subscription_plans 
      SET max_booths = 10, max_machines = 20, max_officers = 10 
      WHERE name = 'Premium'
    `);

    await connection.commit();
    console.log("Migration successful!");
  } catch (error) {
    await connection.rollback();
    console.error("Migration failed:", error);
  } finally {
    connection.release();
    process.exit();
  }
}

migrate();
