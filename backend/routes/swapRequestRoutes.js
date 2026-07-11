const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    sendSwapRequest,
    receivedRequests,
    sentRequests,
    acceptRequest,
    rejectRequest,
    cancelRequest,
    getConversations
} = require("../controllers/swapRequestController");

router.post("/",authMiddleware,sendSwapRequest);
router.get("/received",authMiddleware,receivedRequests);
router.get("/sent",authMiddleware,sentRequests);
router.put("/:id/accept",authMiddleware,acceptRequest);
router.put("/:id/reject",authMiddleware,rejectRequest);
router.put("/:id/cancel",authMiddleware,cancelRequest);
router.get("/conversations",authMiddleware,getConversations);

module.exports = router;