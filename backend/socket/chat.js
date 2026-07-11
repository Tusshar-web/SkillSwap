const { getRequestById } = require("../models/swapRequestModel");
const { saveMessage } = require("../models/chatModel");

module.exports = (io, socket) => {
  socket.on("sendMessage", async (data) => {
    try {
      const { requestId, message } = data;

      const request = await getRequestById(requestId);

      if (!request) {
        return socket.emit("errorMessage", "Swap request not found.");
      }

      if (request.status !== "Accepted") {
        return socket.emit("errorMessage", "Chat not available.");
      }

      const senderId = socket.user.id;

      if (request.sender_id !== senderId && request.receiver_id !== senderId) {
        return socket.emit("errorMessage", "Unauthorized.");
      }

      let receiverId;

      if (request.sender_id === senderId) {
        receiverId = request.receiver_id;
      } else {
        receiverId = request.sender_id;
      }

      await saveMessage(requestId, senderId, receiverId, message);

      io.to(`request_${requestId}`).emit("newMessage", {
        requestId,
        senderId,
        receiverId,
        message,
        created_at: new Date(),
      });
    } catch (err) {
      console.error(err);

      socket.emit("errorMessage", "Unable to send message.");
    }
  });
};
