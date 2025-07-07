const express = require("express");
const multer = require("multer");
const docxToPDF = require("docx-pdf");
const path = require("path");
const fs = require("fs");
const cors=require("cors")

const app = express();
const port = 3000;
app.use(cors());
// Ensure folders exist
const ensureFolderExists = (folder) => {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }
};

ensureFolderExists("upload");
ensureFolderExists("files");

// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "upload");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

app.post("/convertFile", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file was uploaded" });
    }

    const outputFileName = req.file.originalname.replace(/\.docx$/, ".pdf");
    const outputpath = path.join(__dirname, "files", outputFileName);

    docxToPDF(req.file.path, outputpath, (err, result) => {
      if (err) {
        console.error("Conversion error:", err);
        return res.status(500).json({ message: "Error converting docx to pdf" });
      }

      res.download(outputpath, (err) => {
        if (err) {
          console.error("Download error:", err);
          res.status(500).send("Failed to download the file.");
        } else {
          console.log("File downloaded successfully");
        }
      });
    });
  } catch (error) {
    console.error("Internal error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});  