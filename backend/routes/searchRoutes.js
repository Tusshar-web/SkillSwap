const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  searchUsersBySkill,
} = require("../controllers/searchController");

router.get("/", authMiddleware, searchUsersBySkill);

module.exports = router;