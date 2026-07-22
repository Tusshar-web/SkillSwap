const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const {
    getProfile, 
    updateProfile,
    getMyProfile,
    getAllUsers,
    getOfferSkills,
    uploadProfilePicture
} = require("../controllers/userController");

router.get("/profile", authMiddleware, getProfile);
router.put("/me", authMiddleware, updateProfile);
router.get("/me", authMiddleware, getMyProfile);
router.get("/all", getAllUsers);
router.get("/", getAllUsers);
router.get("/:userId/offer-skills",authMiddleware,getOfferSkills);
router.post("/profile-picture",authMiddleware,upload.single("image"),uploadProfilePicture);

module.exports = router;