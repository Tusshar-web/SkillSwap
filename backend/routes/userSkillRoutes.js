const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    addUserSkill,
    getMySkills,
    updateUserSkill,
    deleteUserSkill
} = require("../controllers/userSkillController");

router.post("/", authMiddleware, addUserSkill);
router.get("/me", authMiddleware, getMySkills);
router.put("/:id", authMiddleware, updateUserSkill);
router.delete("/:id", authMiddleware, deleteUserSkill);


module.exports = router;