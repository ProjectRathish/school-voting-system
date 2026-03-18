const multer = require("multer");
const path = require("path");
const fs = require("fs");


// Storage configuration for candidate files (photo and symbol)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const school_code = req.user.school_code || `school_${req.user.school_id}`;
      const election_id = req.body.election_id;
      
      if (!election_id) {
        return cb(new Error("Election ID is required for file upload"));
      }

      const field = file.fieldname;
      const subDir = field === "photo" ? "photos" : "symbols";
      
      // Target: uploads/candidates/[school_code]/[election_id]/[photos|symbols]/
      const targetDir = path.join(__dirname, "../uploads/candidates", school_code, String(election_id), subDir);
      
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
    // photo: photo-{admission_no}.jpg
    // symbol: symbol-{admission_no}.png
    let filename;
    if (field === "photo") {
      filename = `photo-${admission_no}.jpg`;
    } else if (field === "symbol") {
      filename = `symbol-${admission_no}.png`;
    }
    
    cb(null, filename);
  }
});

// File filter - JPG for photo and PNG for symbol
const fileFilter = (req, file, cb) => {
  const field = file.fieldname;
  
  if (field === "photo") {
    // Allow only JPG for photo
    if (file.mimetype === "image/jpeg") {
      cb(null, true);
    } else {
      cb(new Error("Photo must be JPG format"));
    }
  } else if (field === "symbol") {
    // Allow only PNG for symbol
    if (file.mimetype === "image/png") {
      cb(null, true);
    } else {
      cb(new Error("Symbol must be PNG format"));
    }
  } else {
    cb(new Error("Invalid file field"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

module.exports = upload;
