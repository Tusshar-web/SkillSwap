const uploadToCloudinary = require("../utils/uploadToCloudinary");

const {
    createPost,
    getAllPosts,
    getPostById,
    deletePost,
    updatePost
} = require("../models/postModel");

const createNewPost = async (req, res) => {

    try {

        const {
            post_type,
            content
        } = req.body;

        if (!content) {
            return res.status(400).json({
                success: false,
                message: "Post content is required."
            });
        }

        const validTypes = [
            "achievement",
            "project",
            "certificate",
            "question",
            "general",
            "study",
            "whiteboard",
            "workspace"
        ];

        if (
            post_type &&
            !validTypes.includes(post_type)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid post type."
            });
        }

        let imageUrl = null;
        let imagePublicId = null;

        if (req.file) {

            const uploaded =
                await uploadToCloudinary(
                    req.file.buffer,
                    "LearnLoop/posts"
                );

            imageUrl = uploaded.secure_url;
            imagePublicId = uploaded.public_id;
        }

        await createPost(
            req.user.id,
            post_type || "general",
            content,
            imageUrl,
            imagePublicId
        );

        res.status(201).json({
            success: true,
            message: "Post created successfully."
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

const getFeed = async (req, res) => {

    try {

        const posts =
            await getAllPosts(req.user.id);

        res.json({
            success: true,
            posts
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};


const editPost = async (req, res) => {

    try {

        const post =
            await getPostById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found."
            });
        }

        if (post.user_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized."
            });
        }

        const {
            post_type,
            content
        } = req.body;

        await updatePost(
            req.params.id,
            req.user.id,
            post_type,
            content
        );

        res.json({
            success: true,
            message: "Post updated successfully."
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

const removePost = async (req, res) => {

    try {

        const post =
            await getPostById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found."
            });
        }

        if (post.user_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized."
            });
        }

        await deletePost(
            req.params.id,
            req.user.id
        );

        res.json({
            success: true,
            message: "Post deleted successfully."
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
    createNewPost,
    getFeed,
    editPost,
    removePost
};