const db = require('../config/db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const emailService = require('../utils/emailService');

// Lazily init Razorpay so server doesn't crash if keys are missing yet
const getRazorpay = () => {
  const Razorpay = require('razorpay');
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

const generateNextSchoolCode = async () => {
  const [rows] = await db.execute('SELECT code FROM schools');
  let maxId = 0;
  rows.forEach(row => {
    const match = row.code.match(/\d+/);
    if (match) {
      const num = parseInt(match[0]);
      if (num > maxId) maxId = num;
    }
  });
  return `SPE${String(maxId + 1).padStart(4, '0')}`;
};

// POST /api/register/order
// Creates a Razorpay order for the selected plan
exports.createOrder = async (req, res) => {
  try {
    const { plan_id, school_name, contact_person, contact_email, contact_phone, location } = req.body;

    if (!plan_id || !school_name || !contact_person || !contact_email || !contact_phone) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    const [plans] = await db.execute('SELECT * FROM subscription_plans WHERE id = ? AND is_active = 1', [plan_id]);
    if (plans.length === 0) return res.status(404).json({ message: 'Plan not found or inactive' });

    const plan = plans[0];

    // Check email not already registered
    const [existingSchool] = await db.execute('SELECT id FROM schools WHERE email = ?', [contact_email]);
    if (existingSchool.length > 0) return res.status(400).json({ message: 'This email is already registered to a school' });

    // Free plan — skip payment, activate directly
    if (parseFloat(plan.price) === 0) {
      const result = await activateSchool({ plan, school_name, contact_person, contact_email, contact_phone, location });
      return res.json({ free: true, ...result });
    }

    // Paid plan — create Razorpay order
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(503).json({ message: 'Payment gateway not configured yet. Please contact support.' });
    }

    const razorpay = getRazorpay();
    const amountPaise = Math.round(parseFloat(plan.price) * 100);

    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: `reg_${Date.now()}`,
      notes: {
        plan_id: String(plan_id),
        school_name,
        contact_person,
        contact_email,
        contact_phone,
        location: location || ''
      }
    });

    res.json({
      free: false,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID,
      plan_name: plan.name,
      plan_id
    });
  } catch (error) {
    console.error('createOrder error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// POST /api/register/verify
// Verifies Razorpay payment signature and activates school
exports.verifyAndActivate = async (req, res) => {
  try {
    const {
      razorpay_order_id, razorpay_payment_id, razorpay_signature,
      plan_id, school_name, contact_person, contact_email, contact_phone, location
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Payment details missing' });
    }

    // Verify HMAC signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed. Invalid signature.' });
    }

    const [plans] = await db.execute('SELECT * FROM subscription_plans WHERE id = ?', [plan_id]);
    if (plans.length === 0) return res.status(404).json({ message: 'Plan not found' });

    const result = await activateSchool({
      plan: plans[0],
      school_name, contact_person, contact_email, contact_phone, location,
      payment_id: razorpay_payment_id
    });

    res.json(result);
  } catch (error) {
    console.error('verifyAndActivate error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Shared school activation logic
async function activateSchool({ plan, school_name, contact_person, contact_email, contact_phone, location, payment_id }) {
  const school_code = await generateNextSchoolCode();

  // Calculate subscription expiry
  const expiry = new Date();
  expiry.setMonth(expiry.getMonth() + (plan.duration_months || 12));
  const expiryStr = expiry.toISOString().slice(0, 19).replace('T', ' ');

  // Generate temp password
  const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4).toUpperCase();
  const hash = await bcrypt.hash(tempPassword, 10);

  const [schoolResult] = await db.execute(
    `INSERT INTO schools (name, contact_person, email, phone, code, location, plan_id, subscription_status, subscription_expiry)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?)`,
    [school_name, contact_person, contact_email, contact_phone, school_code, location || '', plan.id, expiryStr]
  );

  const school_id = schoolResult.insertId;

  await db.execute(
    `INSERT INTO users (school_id, username, password_hash, role, must_change_password) VALUES (?, ?, ?, 'SCHOOL_ADMIN', 1)`,
    [school_id, school_code, hash]
  );

  // Send welcome email
  try {
    await emailService.sendSchoolApprovalEmail(contact_email, school_name, school_code, tempPassword);
  } catch (emailErr) {
    console.error('Email send failed:', emailErr.message);
  }

  return {
    success: true,
    school_code,
    school_name,
    plan_name: plan.name,
    subscription_expiry: expiryStr,
    message: 'School account created successfully! Check your email for login credentials.'
  };
}
