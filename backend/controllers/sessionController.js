const {
    createSession,
    getUserSessions,
    getSessionById,
    markSessionCompleted,
    cancelSession
} = require("../models/sessionModel");
const crypto = require("crypto");

const createSessionController = async (req, res) => {
    try {
        const { request_id, partner_id, topic, date, time, timezone } = req.body;
        
        if (!partner_id || !topic || !date || !time) {
            return res.status(400).json({ success: false, message: "Missing required fields." });
        }

        const roomName = "SkillSwap_Session_" + crypto.randomBytes(6).toString('hex');
        const meeting_url = `https://meet.jit.si/${roomName}`;

        const sessionId = await createSession(
            request_id,
            req.user.id,
            partner_id,
            topic,
            date,
            time,
            timezone || 'GMT+1',
            meeting_url
        );

        const newSession = await getSessionById(sessionId);

        res.status(201).json({
            success: true,
            message: "Session created successfully.",
            session: newSession
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};

const getSessionsController = async (req, res) => {
    try {
        const sessions = await getUserSessions(req.user.id);
        res.json({ success: true, sessions });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};

const completeSessionController = async (req, res) => {
    try {
        const session = await getSessionById(req.params.id);
        if (!session) {
            return res.status(404).json({ success: false, message: "Session not found." });
        }

        if (session.partner_1_id !== req.user.id && session.partner_2_id !== req.user.id) {
            return res.status(403).json({ success: false, message: "Unauthorized." });
        }

        // Check if session date/time is in the past
        const scheduledDateTime = new Date(`${session.scheduled_date.toISOString().split('T')[0]}T${session.scheduled_time}Z`);
        const now = new Date();
        
        // We will do a rough comparison (ignoring strict timezone rules for simplicity, assuming server time is UTC or close to it)
        // If the user is early, we block them.
        if (now < scheduledDateTime) {
            return res.status(400).json({ 
                success: false, 
                message: "You cannot mark a session complete before it has started." 
            });
        }

        const updated = await markSessionCompleted(req.params.id, req.user.id);

        res.json({
            success: true,
            message: updated.status === 'completed' ? 'Session fully completed!' : 'Waiting for partner to mark complete.',
            session: updated
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};

const cancelSessionController = async (req, res) => {
    try {
        const session = await getSessionById(req.params.id);
        if (!session) {
            return res.status(404).json({ success: false, message: "Session not found." });
        }

        if (session.partner_1_id !== req.user.id && session.partner_2_id !== req.user.id) {
            return res.status(403).json({ success: false, message: "Unauthorized." });
        }

        await cancelSession(req.params.id);
        res.json({ success: true, message: "Session cancelled." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    createSessionController,
    getSessionsController,
    completeSessionController,
    cancelSessionController
};
