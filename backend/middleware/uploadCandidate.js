const multer = require("multer");
const path = require("path");
const fs = require("fs");


// Storage configuration for candidate files (photo and symbol)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      let school_code = 'public';
      if (req.user) {
        school_code = req.user.school_code || `school_${req.user.school_id}`;
      }
      
      const election_id = req.body.election_id;
      
      // For public nominations, we'll store in a simple public folder first
      // The controller will then relocate it if needed, or we just keep it there.
      const targetDir = req.user 
        ? path.join(__dirname, "../public/uploads/candidates", school_code, String(election_id), file.fieldname === "photo" ? "photos" : "symbols")
        : path.join(__dirname, "../public/uploads/public", String(election_id || 'temp'), file.fieldname === "photo" ? "photos" : "symbols");
      
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      cb(null, targetDir);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    // Extract admission number from request body
    const admission_no = req.body.admission_no;
    const field = file.fieldname; // 'photo' or 'symbol'
    
    if (!admission_no) {
      return cb(new Error("Admission number is required"));
    }
    
    // File naming: 
    // photo: photo-{admission_no}.{ext}
    // symbol: symbol-{admission_no}.{ext}
    const ext = path.extname(file.originalname) || (field === "photo" ? ".jpg" : ".png");
    const filename = `${field}-${admission_no}${ext}`;
    
    cb(null, filename);
  }
});

// File filter - JPG for photo and PNG for symbol
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPG, PNG, and WebP are allowed."));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit (reduced from 50MB for security)
  },
});

module.exports = upload;
