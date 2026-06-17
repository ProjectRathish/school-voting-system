const db = require('../config/db');

// Get all plans
exports.getPlans = async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM subscription_plans ORDER BY price ASC");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all active plans for public display
exports.getPublicPlans = async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM subscription_plans WHERE is_active = 1 ORDER BY price ASC");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create a plan
exports.createPlan = async (req, res) => {
  try {
    const { name, max_voters, max_elections, price, duration_months, description } = req.body;
    await db.execute(
      "INSERT INTO subscription_plans (name, max_voters, max_elections, price, duration_months, description) VALUES (?, ?, ?, ?, ?, ?)",
      [name, max_voters, max_elections, price, duration_months || 12, description]
    );
    res.status(201).json({ message: "Plan created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update a plan
exports.updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, max_voters, max_elections, price, duration_months, description, is_active } = req.body;
    await db.execute(
      "UPDATE subscription_plans SET name=?, max_voters=?, max_elections=?, price=?, duration_months=?, description=?, is_active=? WHERE id=?",
      [name, max_voters, max_elections, price, duration_months || 12, description, is_active ? 1 : 0, id]
    );
    res.json({ message: "Plan updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a plan
exports.deletePlan = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if any school is using this plan
    const [schools] = await db.execute("SELECT id FROM schools WHERE plan_id = ?", [id]);
    if (schools.length > 0) {
      return res.status(400).json({ message: "Cannot delete plan: It is currently assigned to schools" });
    }

    await db.execute("DELETE FROM subscription_plans WHERE id = ?", [id]);
    res.json({ message: "Plan deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
