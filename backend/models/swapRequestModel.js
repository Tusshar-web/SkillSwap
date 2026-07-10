const db = require("../config/db");

// Check if sender's offered skill belongs to them
const getUserSkill = async (user_skill_id, user_id) => {
    const [rows] = await db.execute(
        `SELECT *
         FROM user_skills
         WHERE user_skill_id = ?
         AND user_id = ?`,
        [user_skill_id, user_id]
    );

    return rows[0];
};

// Check if a pending request already exists
const pendingRequestExists = async (
    sender_id,
    receiver_id,
    sender_user_skill_id,
    receiver_user_skill_id
) => {

    const [rows] = await db.execute(
        `SELECT request_id
         FROM exchange_requests
         WHERE sender_id = ?
         AND receiver_id = ?
         AND sender_user_skill_id = ?
         AND receiver_user_skill_id = ?
         AND status = 'pending'`,
        [
            sender_id,
            receiver_id,
            sender_user_skill_id,
            receiver_user_skill_id
        ]
    );

    return rows.length > 0;
};

// Create swap request
const createSwapRequest = async (
    sender_id,
    receiver_id,
    sender_user_skill_id,
    receiver_user_skill_id,
    message
) => {

    const [result] = await db.execute(
        `INSERT INTO exchange_requests
        (
            sender_id,
            receiver_id,
            sender_user_skill_id,
            receiver_user_skill_id,
            message
        )
        VALUES (?, ?, ?, ?, ?)`,
        [
            sender_id,
            receiver_id,
            sender_user_skill_id,
            receiver_user_skill_id,
            message ?? null
        ]
    );

    return result;
};

const getReceivedRequests = async (receiver_id) => {

    const [rows] = await db.execute(
        `
        SELECT
            er.request_id,
            er.message,
            er.status,
            er.created_at,

            u.id AS sender_id,
            u.full_name,
            u.profile_picture,

            senderSkill.skill_name AS offered_skill,
            receiverSkill.skill_name AS requested_skill,

            us1.proficiency AS sender_proficiency,
            us2.proficiency AS receiver_proficiency

        FROM exchange_requests er

        JOIN users u
            ON er.sender_id = u.id

        JOIN user_skills us1
            ON er.sender_user_skill_id = us1.user_skill_id

        JOIN skills senderSkill
            ON us1.skill_id = senderSkill.skill_id

        JOIN user_skills us2
            ON er.receiver_user_skill_id = us2.user_skill_id

        JOIN skills receiverSkill
            ON us2.skill_id = receiverSkill.skill_id

        WHERE er.receiver_id = ?

        ORDER BY er.created_at DESC
        `,
        [receiver_id]
    );

    return rows;
};

const getSentRequests = async (sender_id) => {

    const [rows] = await db.execute(
        `
        SELECT
            er.request_id,
            er.message,
            er.status,
            er.created_at,

            u.id AS receiver_id,
            u.full_name,
            u.profile_picture,

            senderSkill.skill_name AS offered_skill,
            receiverSkill.skill_name AS requested_skill,

            us1.proficiency AS sender_proficiency,
            us2.proficiency AS receiver_proficiency

        FROM exchange_requests er

        JOIN users u
            ON er.receiver_id = u.id

        JOIN user_skills us1
            ON er.sender_user_skill_id = us1.user_skill_id

        JOIN skills senderSkill
            ON us1.skill_id = senderSkill.skill_id

        JOIN user_skills us2
            ON er.receiver_user_skill_id = us2.user_skill_id

        JOIN skills receiverSkill
            ON us2.skill_id = receiverSkill.skill_id

        WHERE er.sender_id = ?

        ORDER BY er.created_at DESC
        `,
        [sender_id]
    );

    return rows;
};

const getRequestById = async (request_id) => {

    const [rows] = await db.execute(
        `SELECT *
         FROM exchange_requests
         WHERE request_id = ?`,
        [request_id]
    );

    return rows[0];
};

const acceptSwapRequest = async (request_id, receiver_id) => {

    const [result] = await db.execute(
        `UPDATE exchange_requests
         SET status = 'accepted'
         WHERE request_id = ?
         AND receiver_id = ?
         AND status = 'pending'`,
        [
            request_id,
            receiver_id
        ]
    );

    return result;
};

const rejectSwapRequest = async (request_id, receiver_id) => {

    const [result] = await db.execute(
        `UPDATE exchange_requests
         SET status = 'rejected'
         WHERE request_id = ?
         AND receiver_id = ?
         AND status = 'pending'`,
        [
            request_id,
            receiver_id
        ]
    );

    return result;
};

const cancelSwapRequest = async (
    request_id,
    sender_id
) => {

    const [result] = await db.execute(
        `UPDATE exchange_requests
         SET status='cancelled'
         WHERE request_id = ?
         AND sender_id = ?
         AND status='pending'`,
        [
            request_id,
            sender_id
        ]
    );

    return result;

};

module.exports = {
    getUserSkill,
    pendingRequestExists,
    createSwapRequest,
    getReceivedRequests,
    getSentRequests,
    getRequestById,
    acceptSwapRequest,
    rejectSwapRequest,
    cancelSwapRequest

};