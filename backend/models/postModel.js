const db = require("../config/db");

// Create Post
const createPost = async (
    userId,
    postType,
    content,
    imageUrl,
    imagePublicId
) => {

    const [result] = await db.execute(
        `
        INSERT INTO posts
        (
            user_id,
            post_type,
            content,
            image_url,
            image_public_id
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [
            userId,
            postType,
            content,
            imageUrl,
            imagePublicId
        ]
    );

    return result;

};

// Get all posts
const getAllPosts = async (currentUserId) => {

    const [rows] = await db.execute(
        `
        SELECT

            p.post_id,
            p.post_type,
            p.content,
            p.image_url,
            p.created_at,

            u.id AS user_id,
            u.full_name,
            u.profile_picture,

            COUNT(DISTINCT pl.like_id) AS like_count,

            COUNT(DISTINCT pc.comment_id) AS comment_count,

            EXISTS(
                SELECT 1
                FROM post_likes l
                WHERE l.post_id = p.post_id
                AND l.user_id = ?
            ) AS likedByMe

        FROM posts p

        JOIN users u
            ON p.user_id = u.id

        LEFT JOIN post_likes pl
            ON pl.post_id = p.post_id

        LEFT JOIN post_comments pc
            ON pc.post_id = p.post_id

        GROUP BY p.post_id

        ORDER BY p.created_at DESC
        `,
        [currentUserId]
    );

    return rows;
};

// Get one post
const getPostById = async (postId) => {

    const [rows] = await db.execute(
        `
        SELECT *
        FROM posts
        WHERE post_id = ?
        `,
        [postId]
    );

    return rows[0];

};

// Delete Post
const deletePost = async (
    postId,
    userId
) => {

    const [result] = await db.execute(
        `
        DELETE FROM posts
        WHERE post_id = ?
        AND user_id = ?
        `,
        [
            postId,
            userId
        ]
    );

    return result;

};

// Edit Post
const updatePost = async (
    postId,
    userId,
    postType,
    content
) => {

    const [result] = await db.execute(
        `
        UPDATE posts
        SET
            post_type = ?,
            content = ?
        WHERE
            post_id = ?
        AND user_id = ?
        `,
        [
            postType,
            content,
            postId,
            userId
        ]
    );

    return result;

};

module.exports = {
    createPost,
    getAllPosts,
    getPostById,
    deletePost,
    updatePost
};