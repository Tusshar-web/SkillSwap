const { hasLiked, addLike, removeLike } = require("../models/likeModel");
const { createNotification } = require("../models/notifcationModel");
const { getPostById } = require("../models/postModel");

const toggleLike = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const post = await getPostById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
      });
    }

    const liked = await hasLiked(postId, userId);

    if (liked) {
      await removeLike(postId, userId);

      return res.json({
        success: true,
        liked: false,
        message: "Post unliked.",
      });
    }

    await addLike(postId, userId);

    // Don't notify users when they like their own post
    if (post.user_id !== userId) {
      await createNotification(
        post.user_id, // Receiver (post owner)
        userId, // Sender (who liked the post)
        "post_like",
        postId,
      );
    }

    res.json({
      success: true,
      liked: true,
      message: "Post liked.",
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
  toggleLike,
};
