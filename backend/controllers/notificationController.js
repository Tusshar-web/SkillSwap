const {
    getNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount
} = require("../models/notifcationModel");

const dayjs = require("dayjs");
const relativeTime = require("dayjs/plugin/relativeTime");

dayjs.extend(relativeTime);

const getMyNotifications = async (req, res) => {

    try {

        const notifications =
            await getNotifications(req.user.id);

const formattedNotifications = notifications.map((notification) => {

    let message = "";
    let icon = "";
    let color = "";

    switch (notification.type) {

        case "request":
            icon = "🤝";
            color = "#2563eb";
            message = `${notification.full_name} sent you a skill exchange request.`;
            break;

        case "request_accepted":
            icon = "✅";
            color = "#16a34a";
            message = `${notification.full_name} accepted your request.`;
            break;

        case "request_rejected":
            icon = "❌";
            color = "#dc2626";
            message = `${notification.full_name} rejected your request.`;
            break;

        case "post_like":
            icon = "❤️";
            color = "#ef4444";
            message = `${notification.full_name} liked your post.`;
            break;

        case "post_comment":
            icon = "💬";
            color = "#0ea5e9";
            message = `${notification.full_name} commented on your post.`;
            break;

        case "review":
            icon = "⭐";
            color = "#f59e0b";
            message = `${notification.full_name} reviewed you.`;
            break;

        case "chat":
            icon = "💬";
            color = "#0ea5e9";
            message = `${notification.full_name} sent you a new message.`;
            break;

        default:
            icon = "🔔";
            color = "#6b7280";
            message = "You have a new notification.";
    }

    return {

        notification_id: notification.notification_id,

        sender_id: notification.sender_id,

        sender_name: notification.full_name,

        profile_picture: notification.profile_picture,

        type: notification.type,

        reference_id: notification.reference_id,

        is_read: notification.is_read,

        icon,

        color,

        message,

        created_at: notification.created_at,

        time: dayjs(notification.created_at).fromNow()

    };

});

        res.json({
            success: true,
            notifications: formattedNotifications
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

const readNotification = async (req, res) => {

    try {

        const result =
            await markAsRead(
                req.params.id,
                req.user.id
            );

        if (!result.affectedRows) {
            return res.status(404).json({
                success: false,
                message: "Notification not found."
            });
        }

        res.json({
            success: true,
            message: "Notification marked as read."
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

const readAllNotifications = async (req, res) => {

    try {

        await markAllAsRead(req.user.id);

        res.json({
            success: true,
            message: "All notifications marked as read."
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

const unreadNotificationCount = async (req, res) => {

    try {

        const count =
            await getUnreadCount(req.user.id);

        res.json({
            success: true,
            unreadCount: count.count
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
    getMyNotifications,
    readNotification,
    readAllNotifications,
    unreadNotificationCount
};