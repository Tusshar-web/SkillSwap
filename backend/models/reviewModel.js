const db = require("../config/db");

// Create Review
const createReview = async (
    requestId,
    reviewerId,
    revieweeId,
    rating,
    comment
) => {

    const [result] = await db.execute(
        `
        INSERT INTO reviews
        (
            request_id,
            reviewer_id,
            reviewee_id,
            rating,
            comment
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [
            requestId,
            reviewerId,
            revieweeId,
            rating,
            comment
        ]
    );

    return result;
};

// Check if review already exists
const reviewAlreadyExists = async (
    requestId,
    reviewerId
) => {

    const [rows] = await db.execute(
        `
        SELECT review_id
        FROM reviews
        WHERE request_id = ?
        AND reviewer_id = ?
        `,
        [
            requestId,
            reviewerId
        ]
    );

    return rows.length > 0;
};

// Get all reviews for a user
const getUserReviews = async (userId) => {

    const [rows] = await db.execute(
        `
        SELECT
            r.review_id,
            r.rating,
            r.comment,
            r.created_at,
            u.full_name AS reviewer_name

        FROM reviews r

        JOIN users u
        ON r.reviewer_id = u.id

        WHERE r.reviewee_id = ?

        ORDER BY r.created_at DESC
        `,
        [userId]
    );

    return rows;
};

// Get user's average rating
const getUserRating = async (userId) => {

    const [rows] = await db.execute(
        `
        SELECT

        ROUND(AVG(rating),1) AS average_rating,

        COUNT(*) AS total_reviews

        FROM reviews

        WHERE reviewee_id = ?
        `,
        [userId]
    );

    return rows[0];
};

module.exports = {
    createReview,
    reviewAlreadyExists,
    getUserReviews,
    getUserRating
};