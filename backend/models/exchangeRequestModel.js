const db = require("../config/db");

// Create a new exchange request
const createExchangeRequest = async (
  senderId,
  receiverId,
  senderUserSkillId,
  receiverUserSkillId,
  message,
) => {
  const [result] = await db.execute(
    `
        INSERT INTO exchange_requests
        (
            sender_id,
            receiver_id,
            sender_user_skill_id,
            receiver_user_skill_id,
            message
        )
        VALUES (?, ?, ?, ?, ?)
        `,
    [senderId, receiverId, senderUserSkillId, receiverUserSkillId, message],
  );

  return result;
};

// Get request by ID
const getExchangeRequestById = async (requestId) => {
  const [rows] = await db.execute(
    `
        SELECT *
        FROM exchange_requests
        WHERE request_id = ?
        `,
    [requestId],
  );

  return rows[0];
};

// Check if a pending request already exists
const pendingRequestExists = async (
  senderId,
  receiverId,
  senderUserSkillId,
  receiverUserSkillId,
) => {
  const [rows] = await db.execute(
    `
        SELECT request_id
        FROM exchange_requests
        WHERE
            sender_id = ?
        AND receiver_id = ?
        AND sender_user_skill_id = ?
        AND receiver_user_skill_id = ?
        AND status = 'pending'
        `,
    [senderId, receiverId, senderUserSkillId, receiverUserSkillId],
  );

  return rows.length > 0;
};

// Incoming requests
const getIncomingRequests = async (userId) => {
  const [rows] = await db.execute(
    `
        SELECT
            er.*,
            u.full_name AS sender_name,

            ss.skill_name AS sender_skill,
            rs.skill_name AS receiver_skill

        FROM exchange_requests er

        LEFT JOIN users u
            ON er.sender_id = u.id

        LEFT JOIN user_skills us1
            ON er.sender_user_skill_id = us1.user_skill_id

        LEFT JOIN skills ss
            ON us1.skill_id = ss.skill_id

        LEFT JOIN user_skills us2
            ON er.receiver_user_skill_id = us2.user_skill_id

        LEFT JOIN skills rs
            ON us2.skill_id = rs.skill_id

        WHERE er.receiver_id = ?

        ORDER BY er.created_at DESC
        `,
    [userId],
  );

  return rows;
};

// Outgoing requests
const getOutgoingRequests = async (userId) => {
  const [rows] = await db.execute(
    `
        SELECT
            er.*,
            u.full_name AS receiver_name,

            ss.skill_name AS sender_skill,
            rs.skill_name AS receiver_skill

        FROM exchange_requests er

        LEFT JOIN users u
            ON er.receiver_id = u.id

        LEFT JOIN user_skills us1
            ON er.sender_user_skill_id = us1.user_skill_id

        LEFT JOIN skills ss
            ON us1.skill_id = ss.skill_id

        LEFT JOIN user_skills us2
            ON er.receiver_user_skill_id = us2.user_skill_id

        LEFT JOIN skills rs
            ON us2.skill_id = rs.skill_id

        WHERE er.sender_id = ?

        ORDER BY er.created_at DESC
        `,
    [userId],
  );

  return rows;
};

// Accept request
const acceptExchangeRequest = async (requestId) => {
  const [result] = await db.execute(
    `
        UPDATE exchange_requests
        SET status = 'accepted'
        WHERE request_id = ?
        `,
    [requestId],
  );

  return result;
};

// Reject request
const rejectExchangeRequest = async (requestId) => {
  const [result] = await db.execute(
    `
        UPDATE exchange_requests
        SET status = 'rejected'
        WHERE request_id = ?
        `,
    [requestId],
  );

  return result;
};

// Cancel request
const cancelExchangeRequest = async (requestId) => {
  const [result] = await db.execute(
    `
        DELETE
        FROM exchange_requests
        WHERE request_id = ?
        `,
    [requestId],
  );

  return result;
};

// Mark exchange as completed by one user
const markCompleted = async (requestId, userId) => {
  const request = await getExchangeRequestById(requestId);

  if (!request) return null;

  if (request.sender_id === userId) {
    await db.execute(
      `
            UPDATE exchange_requests
            SET completed_by_sender = TRUE
            WHERE request_id = ?
            `,
      [requestId],
    );
  } else if (request.receiver_id === userId) {
    await db.execute(
      `
            UPDATE exchange_requests
            SET completed_by_receiver = TRUE
            WHERE request_id = ?
            `,
      [requestId],
    );
  }

  const updated = await getExchangeRequestById(requestId);

  if (updated.completed_by_sender && updated.completed_by_receiver) {
    await db.execute(
      `
            UPDATE exchange_requests
            SET status = 'completed'
            WHERE request_id = ?
            `,
      [requestId],
    );
  }

  return await getExchangeRequestById(requestId);
};

// Check if request is completed
const isCompleted = async (requestId) => {
  const request = await getExchangeRequestById(requestId);

  return request && request.status === "completed";
};

module.exports = {
  createExchangeRequest,
  getExchangeRequestById,
  pendingRequestExists,
  getIncomingRequests,
  getOutgoingRequests,
  acceptExchangeRequest,
  rejectExchangeRequest,
  cancelExchangeRequest,
  markCompleted,
  isCompleted,
};
