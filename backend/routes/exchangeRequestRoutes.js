const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    createRequest,
    getIncoming,
    getOutgoing,
    acceptRequest,
    rejectRequest,
    cancelRequest
} = require("../controllers/exchangeRequestController");


router.post("/",authMiddleware,createRequest);
router.get("/incoming",authMiddleware,getIncoming);
router.get("/outgoing",authMiddleware,getOutgoing);
router.put("/:id/accept",authMiddleware,acceptRequest);
router.put("/:id/reject",authMiddleware,rejectRequest);
router.delete("/:id",authMiddleware,cancelRequest);

module.exports = router;