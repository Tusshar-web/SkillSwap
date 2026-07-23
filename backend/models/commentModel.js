const db = require("../config/db");

const addComment = async (postId, userId, comment) => {

    const [result] = await db.execute(
        `
        INSERT INTO post_comments
        (
            post_id,
            user_id,
            comment
        )
        VALUES (?, ?, ?)
        `,
        [
            postId,
            userId,
            comment
        ]
    );

    return result;
};

const getCommentsByPost = async (postId) => {

    const [rows] = await db.execute(
        `
        SELECT

            pc.comment_id,
            pc.comment,
            pc.created_at,

            u.id,
            u.full_name,
            u.profile_picture

        FROM post_comments pc

        JOIN users u
            ON pc.user_id = u.id

        WHERE pc.post_id = ?

        ORDER BY pc.created_at ASC
        `,
        [postId]
    );

    return rows;
};

const deleteComment = async (commentId, userId) => {

    const [result] = await db.execute(
        `
        DELETE FROM post_comments
        WHERE comment_id = ?
        AND user_id = ?
        `,
        [
            commentId,
            userId
        ]
    );

    return result;
};

module.exports = {
    addComment,
    getCommentsByPost,
    deleteComment
};