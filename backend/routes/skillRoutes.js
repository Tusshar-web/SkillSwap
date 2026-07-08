const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    addSkill,
    getMySkills,
    getAllSkills
} = require("../controllers/skillController");

router.post("/", authMiddleware, addSkill);
router.get("/me", authMiddleware, getMySkills);
router.get("/", getAllSkills)

module.exports = router;