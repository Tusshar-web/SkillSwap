const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
    getProfile, 
    updateProfile,
    getMyProfile,
    getAllUsers
} = require("../controllers/userController");

router.get("/profile", authMiddleware, getProfile);
router.put("/me", authMiddleware, updateProfile);
router.get("/me", authMiddleware, getMyProfile);
router.get("/all", getAllUsers);
router.get("/", getAllUsers);

module.exports = router;