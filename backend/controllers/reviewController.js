const {
    createReview,
    reviewAlreadyExists,
    getUserReviews,
    getUserRating
} = require("../models/reviewModel");

const {
    getExchangeRequestById
} = require("../models/exchangeRequestModel");

// Leave Review
const leaveReview = async (req, res) => {

    try {

        const {
            request_id,
            rating,
            comment
        } = req.body;

        if (!request_id || !rating) {
            return res.status(400).json({
                success: false,
                message: "Request ID and rating are required."
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 5."
            });
        }

        const request =
            await getExchangeRequestById(request_id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Exchange request not found."
            });
        }

        if (request.status !== "completed") {
            return res.status(400).json({
                success: false,
                message: "Exchange must be completed before reviewing."
            });
        }

        const reviewerId = req.user.id;

        if (
            reviewerId !== request.sender_id &&
            reviewerId !== request.receiver_id
        ) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized."
            });
        }

        const alreadyReviewed =
            await reviewAlreadyExists(
                request_id,
                reviewerId
            );

        if (alreadyReviewed) {
            return res.status(400).json({
                success: false,
                message: "You have already reviewed this exchange."
            });
        }

        // Automatically determine reviewee
        const revieweeId =
            reviewerId === request.sender_id
                ? request.receiver_id
                : request.sender_id;

        await createReview(
            request_id,
            reviewerId,
            revieweeId,
            rating,
            comment || ""
        );

        res.status(201).json({
            success: true,
            message: "Review submitted successfully."
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

// Get all reviews for a user
const getReviews = async (req, res) => {

    try {

        const reviews =
            await getUserReviews(req.params.id);

        res.json({
            success: true,
            reviews
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

// Get user's rating
const getRating = async (req, res) => {

    try {

        const rating =
            await getUserRating(req.params.id);

        res.json({
            success: true,
            rating
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

module.exports = {
    leaveReview,
    getReviews,
    getRating
};