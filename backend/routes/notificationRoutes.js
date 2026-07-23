const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
    getMyNotifications,
    readNotification,
    readAllNotifications,
    unreadNotificationCount
} = require("../controllers/notificationController");

router.get("/",authMiddleware,getMyNotifications);
router.get("/unread-count",authMiddleware,unreadNotificationCount);
router.put("/:id/read",authMiddleware,readNotification);
router.put("/read-all",authMiddleware,readAllNotifications);

module.exports = router;