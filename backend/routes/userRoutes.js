const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
    getProfile, 
    updateProfile,
    getMyProfile
} = require("../controllers/userController");

router.get("/profile", authMiddleware, getProfile);
router.put("/me", authMiddleware, updateProfile);
router.get("/me", authMiddleware, getMyProfile);



module.exports = router;