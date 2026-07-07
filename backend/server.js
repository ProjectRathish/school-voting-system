require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const db = require("./config/db");
const { authLimiter, generalLimiter } = require("./middleware/rateLimiter");

const authRoutes = require("./routes/authRoutes");
const platformRoutes = require("./routes/platformRoutes");
const electionRoutes = require("./routes/electionRoutes");
const sectionRoutes = require("./routes/sectionRoutes");
const classRoutes = require("./routes/classRoutes");
const voterRoutes = require("./routes/voterRoutes");
const postRoutes = require("./routes/postRoutes");
const candidateRoutes = require("./routes/candidateRoutes");
const pollingBoothRoutes = require("./routes/pollingBoothRoutes");
const votingMachineRoutes = require("./routes/votingMachineRoutes");
const schoolRoutes = require("./routes/schoolRoutes");
const reportRoutes = require("./routes/reportRoutes");
const planRoutes = require("./routes/planRoutes");
const registrationRoutes = require('./routes/registrationRoutes');
const auditRoutes = require('./routes/auditRoutes');

const app = express();

// Trust reverse proxy (Nginx, Cloudflare, etc.) to get correct client IPs for rate limiting
app.set('trust proxy', 1);

// ─── Security Headers ────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow uploads to be served cross-origin
  contentSecurityPolicy: false // Disable CSP here; configure at reverse proxy/CDN level
}));

// ─── CORS ────────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

// Also allow any device on the local 192.168.x.x network (LAN access)
const isLocalNetworkOrigin = (origin) => {
  try {
    const url = new URL(origin);
    const hostname = url.hostname;
    const port = url.port;
    const isLanIp = /^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
                    /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
                    /^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/.test(hostname);
    const isDevPort = !port || ['5173', '3000', '4173', '80', '443'].includes(port);
    return isLanIp && isDevPort;
  } catch {
    return false;
  }
};

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, same-origin)
    if (!origin || allowedOrigins.includes(origin) || isLocalNetworkOrigin(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: Origin ${origin} not allowed`));
    }
  },
  credentials: true
}));

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ─── Static Files ─────────────────────────────────────────────────────────────
// Serve uploaded files with standard CORS configuration allowing all origins
// Serve uploads from persistent directory (UPLOADS_DIR in production) or local public/uploads in dev
const uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, "public/uploads");
app.use("/uploads", cors(), express.static(uploadsDir));

// ─── Temporary Debug Endpoint ─────────────────────────────────────────────────
// TODO: Remove this after confirming UPLOADS_DIR is working on live server
app.get("/debug-uploads", (req, res) => {
  const fs = require("fs");
  const candidatesDir = path.join(uploadsDir, "candidates");
  
  let writeTestSuccess = false;
  let writeTestError = null;
  const testFilePath = path.join(uploadsDir, "write_test.txt");
  
  try {
    fs.writeFileSync(testFilePath, "write test at " + new Date().toISOString());
    writeTestSuccess = true;
    fs.unlinkSync(testFilePath); // Clean up
  } catch (err) {
    writeTestError = err.message;
  }

  let candidatesFiles = [];
  try {
    if (fs.existsSync(candidatesDir)) {
      candidatesFiles = fs.readdirSync(candidatesDir);
    }
  } catch (err) {
    candidatesFiles = ["Error listing candidates dir: " + err.message];
  }

  res.json({
    UPLOADS_DIR_ENV: process.env.UPLOADS_DIR || "NOT SET (using fallback)",
    resolvedPath: uploadsDir,
    pathExists: fs.existsSync(uploadsDir),
    candidatesDirExists: fs.existsSync(candidatesDir),
    writeTest: writeTestSuccess ? "SUCCESS" : "FAILED: " + writeTestError,
    candidatesDirContents: candidatesFiles,
    __dirname: __dirname,
  });
});


// ─── Rate Limiting ────────────────────────────────────────────────────────────
app.use(generalLimiter);

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/auth", authLimiter, authRoutes);  // Strict limit on auth
app.use("/api/platform", platformRoutes);
app.use("/api/elections", electionRoutes);
app.use("/api/sections", sectionRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/voters", voterRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/polling-booths", pollingBoothRoutes);
app.use("/api/machines", votingMachineRoutes);
app.use("/api/schools", schoolRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/plans", planRoutes);
app.use('/api/register', registrationRoutes);
app.use('/api/audit', auditRoutes);

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Global Error:", err);

  if (err.message && err.message.startsWith('CORS:')) {
    return res.status(403).json({ message: err.message });
  }

  if (err instanceof require("multer").MulterError) {
    return res.status(400).json({ message: "File upload error: " + err.message });
  }

  res.status(err.status || 500).json({
    message: err.message || "Something went wrong on the server",
    error: process.env.NODE_ENV === "development" ? err : {}
  });
});

app.get("/", (req, res) => {
  res.send("School Voting System Backend Running");
});

db.getConnection()
  .then(() => {
    console.log("MySQL Connected");
  })
  .catch(err => {
    console.error("Database connection failed:", err);
  });

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
  console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
});