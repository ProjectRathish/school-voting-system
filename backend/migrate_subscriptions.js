const db = require('./config/db');

async function migrate() {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    console.log("Creating subscription_plans table...");
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS subscription_plans (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        max_voters INT NOT NULL,
        max_elections INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        description TEXT,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("Seeding default plans...");
    await connection.execute(`
      INSERT INTO subscription_plans (name, max_voters, max_elections, price, description)
      VALUES 
        ('Free', 450, 1, 0.00, 'Basic plan for small schools'),
        ('Standard', 1200, 3, 1499.00, 'Ideal for medium sized schools'),
        ('Premium', 2500, 5, 2499.00, 'Full featured plan for large schools')
      ON DUPLICATE KEY UPDATE name=name
    `);

    console.log("Updating schools table...");
    // Add columns if they don't exist
    const [cols] = await connection.execute("SHOW COLUMNS FROM schools");
    const colNames = cols.map(c => c.Field);

    if (!colNames.includes('plan_id')) {
      await connection.execute("ALTER TABLE schools ADD COLUMN plan_id INT");
      await connection.execute("ALTER TABLE schools ADD CONSTRAINT fk_school_plan FOREIGN KEY (plan_id) REFERENCES subscription_plans(id)");
    }
    if (!colNames.includes('subscription_status')) {
      await connection.execute("ALTER TABLE schools ADD COLUMN subscription_status ENUM('ACTIVE', 'EXPIRED', 'TRIAL') DEFAULT 'ACTIVE'");
    }
    if (!colNames.includes('subscription_expiry')) {
      await connection.execute("ALTER TABLE schools ADD COLUMN subscription_expiry DATETIME");
    }
    if (!colNames.includes('custom_max_voters')) {
      await connection.execute("ALTER TABLE schools ADD COLUMN custom_max_voters INT");
    }
    if (!colNames.includes('custom_max_elections')) {
      await connection.execute("ALTER TABLE schools ADD COLUMN custom_max_elections INT");
    }

    // Set default plan (Free) for existing schools
    await connection.execute("UPDATE schools SET plan_id = (SELECT id FROM subscription_plans WHERE name='Free' LIMIT 1) WHERE plan_id IS NULL");

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
