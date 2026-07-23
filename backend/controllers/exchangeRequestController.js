const {
  createExchangeRequest,
  getExchangeRequestById,
  pendingRequestExists,
  getIncomingRequests,
  getOutgoingRequests,
  acceptExchangeRequest,
  rejectExchangeRequest,
  cancelExchangeRequest,
  markCompleted
} = require("../models/exchangeRequestModel");

const {createNotification} = require("../models/notifcationModel");
const { getSkillById } = require("../models/skillModel");

// Create Exchange Request
const createRequest = async (req, res) => {
  try {
    const senderId = req.user.id;

    const {
      receiver_id,
      sender_user_skill_id,
      receiver_user_skill_id,
      message,
    } = req.body;

    if (!receiver_id || !sender_user_skill_id || !receiver_user_skill_id) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields.",
      });
    }

    if (senderId == receiver_id) {
      return res.status(400).json({
        success: false,
        message: "You cannot send a request to yourself.",
      });
    }

    // Verify sender owns the offered skill
    const senderSkill = await getSkillById(sender_user_skill_id);

    if (!senderSkill || senderSkill.user_id != senderId) {
      return res.status(403).json({
        success: false,
        message: "Invalid sender skill.",
      });
    }
    if (!senderSkill.skill_type || senderSkill.skill_type.toLowerCase() !== "offer") {
      return res.status(400).json({
        success: false,
        message: "You can only offer skills marked as 'offer'.",
      });
    }

    // Verify receiver owns requested skill
    const receiverSkill = await getSkillById(receiver_user_skill_id);

    if (!receiverSkill || receiverSkill.user_id != receiver_id) {
      return res.status(403).json({
        success: false,
        message: "Invalid receiver skill.",
      });
    }
    if (!receiverSkill.skill_type || receiverSkill.skill_type.toLowerCase() !== "offer") {
      return res.status(400).json({
        success: false,
        message: "You can only request skills that the user offers.",
      });
    }
    // Prevent duplicate requests
    const exists = await pendingRequestExists(
      senderId,
      receiver_id,
      sender_user_skill_id,
      receiver_user_skill_id,
    );

    if (exists) {
      return res.status(409).json({
        success: false,
        message: "A pending request already exists.",
      });
    }

    const result = await createExchangeRequest(
      senderId,
      receiver_id,
      sender_user_skill_id,
      receiver_user_skill_id,
      message || "",
    );

    await createNotification(
    receiver_id,          // User who receives the notification
    senderId,             // User who performed the action
    "request",
    result.insertId       // Newly created request_id
    );

    res.status(201).json({
      success: true,
      message: "Exchange request sent successfully.",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Incoming Requests
const getIncoming = async (req, res) => {
  try {
    const requests = await getIncomingRequests(req.user.id);

    res.json({
      success: true,
      requests,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Outgoing Requests
const getOutgoing = async (req, res) => {
  try {
    const requests = await getOutgoingRequests(req.user.id);

    res.json({
      success: true,
      requests,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Accept Request
const acceptRequest = async (req, res) => {
  try {
    const request = await getExchangeRequestById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found.",
      });
    }

    if (request.receiver_id != req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized.",
      });
    }
    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "This request has already been processed.",
      });
    }
    await acceptExchangeRequest(req.params.id);

    // Notify the sender that their request was accepted
    await createNotification(
      request.sender_id,
      req.user.id,
      "request_accepted",
      req.params.id
    );

    res.json({
      success: true,
      message: "Request accepted.",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Reject Request
const rejectRequest = async (req, res) => {
  try {
    const request = await getExchangeRequestById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found.",
      });
    }

    if (request.receiver_id != req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    await rejectExchangeRequest(req.params.id);
    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "This request has already been processed.",
      });
    }

    // Notify the sender that their request was rejected
    await createNotification(
      request.sender_id,
      req.user.id,
      "request_rejected",
      req.params.id
    );

    res.json({
      success: true,
      message: "Request rejected.",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Cancel Request
const cancelRequest = async (req, res) => {
  try {
    const request = await getExchangeRequestById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found.",
      });
    }

    if (request.sender_id != req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    await cancelExchangeRequest(req.params.id);

    res.json({
      success: true,
      message: "Request cancelled.",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const completeRequest = async (req, res) => {

    try {

        const request =
            await getExchangeRequestById(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Request not found."
            });
        }

        if (
            request.sender_id !== req.user.id &&
            request.receiver_id !== req.user.id
        ) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized."
            });
        }

        if (request.status !== "accepted") {
            return res.status(400).json({
                success: false,
                message: "Only accepted requests can be completed."
            });
        }

        const updated =
            await markCompleted(
                req.params.id,
                req.user.id
            );

        res.json({
            success: true,
            message:
                updated.status === "completed"
                ? "Exchange completed successfully."
                : "Waiting for the other user to confirm completion.",
            request: updated
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
  createRequest,
  getIncoming,
  getOutgoing,
  acceptRequest,
  rejectRequest,
  cancelRequest,
  completeRequest
};
