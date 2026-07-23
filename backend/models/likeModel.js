const db = require("../config/db");

const hasLiked = async (postId, userId) => {

    const [rows] = await db.execute(
        `
        SELECT like_id
        FROM post_likes
        WHERE post_id = ?
        AND user_id = ?
        `,
        [postId, userId]
    );

    return rows.length > 0;
};

const addLike = async (postId, userId) => {

    const [result] = await db.execute(
        `
        INSERT INTO post_likes
        (post_id, user_id)
        VALUES (?, ?)
        `,
        [postId, userId]
    );

    return result;
};

const removeLike = async (postId, userId) => {

    const [result] = await db.execute(
        `
        DELETE FROM post_likes
        WHERE post_id = ?
        AND user_id = ?
        `,
        [postId, userId]
    );

    return result;
};

module.exports = {
    hasLiked,
    addLike,
    removeLike
};