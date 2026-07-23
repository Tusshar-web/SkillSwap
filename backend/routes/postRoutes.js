const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
    createNewPost,
    getFeed,
    editPost,
    removePost
} = require("../controllers/postController");

const {
    toggleLike
} = require("../controllers/likeController");

const {
    createComment,
    getComments,
    removeComment
} = require("../controllers/commentController");

//post
router.post("/",authMiddleware,upload.single("image"),createNewPost);
router.get("/",authMiddleware,getFeed);
router.put("/:id",authMiddleware,editPost);
router.delete("/:id",authMiddleware,removePost);

//likes
router.post("/:id/like",authMiddleware,toggleLike);

// Comments
router.post("/:id/comments",authMiddleware,createComment);
router.get("/:id/comments",getComments);
router.delete("/comments/:id",authMiddleware,removeComment);

module.exports = router;