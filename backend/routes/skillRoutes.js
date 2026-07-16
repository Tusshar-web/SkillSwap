const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    createSkill,
    getMySkills,
    getAllSkillsController,
    searchSkillsController,
    editSkill,
    removeSkill
} = require("../controllers/skillController");

router.post("/", authMiddleware, createSkill);

router.get("/me", authMiddleware, getMySkills);

router.get("/", getAllSkillsController);

router.get("/search", searchSkillsController);

router.put("/:id", authMiddleware, editSkill);

router.delete("/:id", authMiddleware, removeSkill);

module.exports = router;