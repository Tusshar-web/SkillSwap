const {
    getUserSkill,
    pendingRequestExists,
    createSwapRequest,
    getReceivedRequests,
    getSentRequests,
    getRequestById,
    acceptSwapRequest,
    rejectSwapRequest,
    cancelSwapRequest
} = require("../models/swapRequestModel");

const sendSwapRequest = async (req, res) => {
    try {

        const sender_id = req.user.id;

        const {
            receiver_id,
            sender_user_skill_id,
            receiver_user_skill_id,
            message
        } = req.body;

        // Required fields
        if (
            !receiver_id ||
            !sender_user_skill_id ||
            !receiver_user_skill_id
        ) {
            return res.status(400).json({
                success: false,
                message: "All required fields must be provided."
            });
        }

        // Cannot send request to yourself
        if (sender_id === receiver_id) {
            return res.status(400).json({
                success: false,
                message: "You cannot send a swap request to yourself."
            });
        }

        // Verify sender owns the selected skill
        const senderSkill = await getUserSkill(
            sender_user_skill_id,
            sender_id
        );

        if (!senderSkill) {
            return res.status(404).json({
                success: false,
                message: "Your selected skill was not found."
            });
        }

        // Sender skill must be an OFFER skill
        if (senderSkill.skill_type !== "offer") {
            return res.status(400).json({
                success: false,
                message: "You can only offer skills marked as 'offer'."
            });
        }

        // Verify receiver owns the selected skill
        const receiverSkill = await getUserSkill(
            receiver_user_skill_id,
            receiver_id
        );

        if (!receiverSkill) {
            return res.status(404).json({
                success: false,
                message: "Receiver's selected skill was not found."
            });
        }

        // Receiver skill must also be an OFFER skill
        if (receiverSkill.skill_type !== "offer") {
            return res.status(400).json({
                success: false,
                message: "Receiver's selected skill is not available for teaching."
            });
        }

        // Prevent duplicate pending requests
        const alreadyExists = await pendingRequestExists(
            sender_id,
            receiver_id,
            sender_user_skill_id,
            receiver_user_skill_id
        );

        if (alreadyExists) {
            return res.status(409).json({
                success: false,
                message: "A pending swap request already exists."
            });
        }

        // Create request
        await createSwapRequest(
            sender_id,
            receiver_id,
            sender_user_skill_id,
            receiver_user_skill_id,
            message
        );

        return res.status(201).json({
            success: true,
            message: "Swap request sent successfully."
        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            success: false,
            message: err.message
        });

    }
};

const receivedRequests = async (req, res) => {

    try {

        const requests = await getReceivedRequests(req.user.id);

        return res.status(200).json({
            success: true,
            count: requests.length,
            data: requests
        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

const sentRequests = async (req, res) => {

    try {

        const requests = await getSentRequests(req.user.id);

        return res.status(200).json({
            success: true,
            count: requests.length,
            data: requests
        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

const acceptRequest = async (req, res) => {

    try {

        const requestId = req.params.id;

        const request = await getRequestById(requestId);

        if (!request) {

            return res.status(404).json({
                success: false,
                message: "Swap request not found."
            });

        }

        // Only receiver can accept
        if (request.receiver_id !== req.user.id) {

            return res.status(403).json({
                success: false,
                message: "You are not authorized to accept this request."
            });

        }

        // Already accepted/rejected/cancelled
        if (request.status !== "pending") {

            return res.status(400).json({
                success: false,
                message: `This request is already ${request.status}.`
            });

        }

        await acceptSwapRequest(
            requestId,
            req.user.id
        );

        return res.status(200).json({
            success: true,
            message: "Swap request accepted successfully."
        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

const rejectRequest = async (req, res) => {

    try {

        const requestId = req.params.id;

        const request = await getRequestById(requestId);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Swap request not found."
            });
        }

        if (request.receiver_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized."
            });
        }

        if (request.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: `Request is already ${request.status}.`
            });
        }

        await rejectSwapRequest(
            requestId,
            req.user.id
        );

        return res.status(200).json({
            success: true,
            message: "Swap request rejected."
        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

const cancelRequest = async (req, res) => {

    try {

        const requestId = req.params.id;

        const request = await getRequestById(requestId);

        if (!request) {

            return res.status(404).json({
                success: false,
                message: "Request not found."
            });

        }

        if (request.sender_id !== req.user.id) {

            return res.status(403).json({
                success: false,
                message: "Unauthorized."
            });

        }

        if (request.status !== "pending") {

            return res.status(400).json({
                success: false,
                message: `Cannot cancel a ${request.status} request.`
            });

        }

        await cancelSwapRequest(
            requestId,
            req.user.id
        );

        return res.status(200).json({
            success: true,
            message: "Request cancelled successfully."
        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

module.exports = {
    sendSwapRequest,
    receivedRequests,
    sentRequests,
    acceptRequest,
    rejectRequest,
    cancelRequest

};