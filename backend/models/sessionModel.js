const db = require("../config/db");

const createSession = async (request_id, partner_1_id, partner_2_id, topic, scheduled_date, scheduled_time, timezone, meeting_url) => {
    // Note: request_id might be "req-custom-book" or similar string from frontend if it was manual.
    // If it's not a valid INT, we store NULL or we just change the schema to allow string?
    // Wait, DB schema says request_id is INT. Let's cast to INT or set NULL if not a number.
    let reqId = parseInt(request_id);
    if (isNaN(reqId)) {
        reqId = null;
    }

    const [result] = await db.execute(
        `INSERT INTO sessions (request_id, partner_1_id, partner_2_id, topic, scheduled_date, scheduled_time, timezone, meeting_url) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [reqId, partner_1_id, partner_2_id, topic, scheduled_date, scheduled_time, timezone, meeting_url]
    );
    return result.insertId;
};

const getUserSessions = async (userId) => {
    const [rows] = await db.execute(
        `SELECT * FROM sessions 
         WHERE partner_1_id = ? OR partner_2_id = ? 
         ORDER BY scheduled_date ASC, scheduled_time ASC`,
        [userId, userId]
    );
    return rows;
};

const getSessionById = async (id) => {
    const [rows] = await db.execute(
        `SELECT * FROM sessions WHERE id = ?`,
        [id]
    );
    return rows[0];
};

const markSessionCompleted = async (id, userId) => {
    const session = await getSessionById(id);
    if (!session) return null;

    if (session.partner_1_id === userId) {
        await db.execute(`UPDATE sessions SET partner_1_completed = TRUE WHERE id = ?`, [id]);
    } else if (session.partner_2_id === userId) {
        await db.execute(`UPDATE sessions SET partner_2_completed = TRUE WHERE id = ?`, [id]);
    }

    const updated = await getSessionById(id);
    if (updated.partner_1_completed && updated.partner_2_completed) {
        await db.execute(`UPDATE sessions SET status = 'completed' WHERE id = ?`, [id]);
        return await getSessionById(id);
    }
    
    return updated;
};

const cancelSession = async (id) => {
    await db.execute(`DELETE FROM sessions WHERE id = ?`, [id]);
};

module.exports = {
    createSession,
    getUserSessions,
    getSessionById,
    markSessionCompleted,
    cancelSession
};
