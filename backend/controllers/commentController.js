const {
  addComment,
  getCommentsByPost,
  deleteComment,
} = require("../models/commentModel");

const {createNotification} = require("../models/notifcationModel");
const { getPostById } = require("../models/postModel");

const createComment = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;
    const { comment } = req.body;

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment cannot be empty.",
      });
    }

    const post = await getPostById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
      });
    }

    await addComment(postId, userId, comment);

    // Notify the post owner (don't notify yourself)
    if (post.user_id !== userId) {
      await createNotification(post.user_id, userId, "post_comment", postId);
    }

    res.status(201).json({
      success: true,
      message: "Comment added successfully.",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getComments = async (req, res) => {
  try {
    const comments = await getCommentsByPost(req.params.id);

    res.json({
      success: true,
      comments,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const removeComment = async (req, res) => {
  try {
    const result = await deleteComment(req.params.id, req.user.id);

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Comment not found.",
      });
    }

    res.json({
      success: true,
      message: "Comment deleted successfully.",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  createComment,
  getComments,
  removeComment,
};
