const express = require("express");
const {
    createSessionController,
    getSessionsController,
    completeSessionController,
    cancelSessionController
} = require("../controllers/sessionController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, createSessionController);
router.get("/", authMiddleware, getSessionsController);
router.put("/:id/complete", authMiddleware, completeSessionController);
router.delete("/:id", authMiddleware, cancelSessionController);

module.exports = router;
