const { getMessagesByRequestId, markMessagesAsRead } = require("../models/chatModel");
const { getRequestById } = require("../models/swapRequestModel");

const getChatHistory = async (req, res) => {

    try {

        const requestId = req.params.requestId;

        const request = await getRequestById(requestId);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Swap request not found."
            });
        }

        const userId = req.user.id;

        if (
            request.sender_id !== userId &&
            request.receiver_id !== userId
        ) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized."
            });
        }

        await markMessagesAsRead(requestId, userId);

        const messages =
            await getMessagesByRequestId(requestId);

        res.json({
            success: true,
            messages
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

};

module.exports = {
    getChatHistory
};