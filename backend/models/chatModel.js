const db = require("../config/db");

// Save a new message
const saveMessage = async (
    requestId,
    senderId,
    receiverId,
    message
) => {

    const [result] = await db.execute(
        `INSERT INTO messages
        (request_id, sender_id, receiver_id, message)
        VALUES (?, ?, ?, ?)`,
        [requestId, senderId, receiverId, message]
    );

    return result.insertId;
};

// Get all messages of a swap request
const getMessagesByRequestId = async (requestId) => {

    const [rows] = await db.execute(
        `SELECT *
         FROM messages
         WHERE request_id = ?
         ORDER BY created_at ASC`,
        [requestId]
    );

    return rows;
};

module.exports = {
    saveMessage,
    getMessagesByRequestId
};