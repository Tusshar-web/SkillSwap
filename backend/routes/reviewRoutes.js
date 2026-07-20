const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    leaveReview,
    getReviews,
    getRating
} = require("../controllers/reviewController");


router.post("/",authMiddleware,leaveReview);
router.get("/user/:id",getReviews);
router.get("/user/:id/rating",getRating);

module.exports = router;