const express = require("express");
const router = express.Router();

const { sendMessage } = require("../controllers/contactController");

// Public contact form
router.post("/", sendMessage);

module.exports = router;
