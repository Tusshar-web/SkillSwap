const db = require("../config/db");

const createNotification = async (
    userId,
    senderId,
    type,
    referenceId
) => {

    const [result] = await db.execute(
        `
        INSERT INTO notifications
        (
            user_id,
            sender_id,
            type,
            reference_id
        )
        VALUES (?, ?, ?, ?)
        `,
        [
            userId,
            senderId,
            type,
            referenceId
        ]
    );

    return result;

};

const getNotifications = async (userId) => {

    const [rows] = await db.execute(
        `
        SELECT

            n.notification_id,

            n.type,

            n.reference_id,

            n.is_read,

            n.created_at,

            u.id AS sender_id,

            u.full_name,

            u.profile_picture

        FROM notifications n

        JOIN users u
            ON n.sender_id = u.id

        WHERE n.user_id = ?

        ORDER BY n.created_at DESC
        `,
        [userId]
    );

    return rows;

};

const markAsRead = async (notificationId, userId) => {

    const [result] = await db.execute(
        `
        UPDATE notifications
        SET is_read = TRUE
        WHERE notification_id = ?
        AND user_id = ?
        `,
        [
            notificationId,
            userId
        ]
    );

    return result;

};

const markAllAsRead = async (userId) => {

    const [result] = await db.execute(
        `
        UPDATE notifications
        SET is_read = TRUE
        WHERE user_id = ?
        `,
        [userId]
    );

    return result;

};

const getUnreadCount = async (userId) => {

    const [rows] = await db.execute(
        `
        SELECT COUNT(*) AS count
        FROM notifications
        WHERE user_id = ?
        AND is_read = FALSE
        `,
        [userId]
    );

    return rows[0];

};

module.exports = {
    createNotification,
    getNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount
};