const express = require("express");
const { uploadContent } = require("../controllers/contentController");
const { protect } = require("../middleware/auth");
const { upload } = require("../middleware/upload");

const router = express.Router();

router.post("/upload", protect, upload.single("file"), uploadContent);

module.exports = router;
