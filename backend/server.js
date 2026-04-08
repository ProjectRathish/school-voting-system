require("dotenv").config(); // Restarted to apply email credentials
const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./config/db");

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


const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
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

// Global Error Handler for JSON responses (including Multer errors)
app.use((err, req, res, next) => {
  console.error("Global Error:", err);
  
  if (err instanceof require("multer").MulterError) {
    return res.status(400).json({ message: "File upload error: " + err.message });
  }

  res.status(err.status || 500).json({ 
    message: err.message || "Something went wrong on the server",
    error: process.env.NODE_ENV === "development" ? err : {}
  });
});


const http = require("http");
const server = http.createServer(app);

// Initialize Socket.io
const io = require("./utils/socket").init(server);

app.get("/", (req, res) => {
 res.send("School Voting System Backend Running with WebSockets");
});

db.getConnection()
.then(() => {
  console.log("MySQL Connected");
})
.catch(err => {
  console.error("Database connection failed:", err);
});

server.listen(process.env.PORT, () => {
 console.log("Server running on port " + process.env.PORT);
});