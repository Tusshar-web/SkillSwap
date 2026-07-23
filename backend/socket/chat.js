const { getRequestById } = require("../models/swapRequestModel");
const { saveMessage } = require("../models/chatModel");
const { createNotification } = require("../models/notifcationModel");

module.exports = (io, socket) => {
  socket.on("sendMessage", async (data) => {
    try {
      const { requestId, message } = data;

      const request = await getRequestById(requestId);
      console.log("sendMessage requestId:", requestId, "status:", JSON.stringify(request?.status));
      if (!request) {
        return socket.emit("errorMessage", "Swap request not found.");
      }

      if (request.status.toLowerCase() !== "accepted") {
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
      
      // Notify receiver
      await createNotification(
          receiverId,
          senderId,
          "chat",
          requestId
      );
      
      io.to(`user_${receiverId}`).emit("newNotification", { type: "chat" });

      io.to(`request_${requestId}`).emit("newMessage", {
        request_id: requestId,
        sender_id: senderId,
        receiver_id: receiverId,
        message,
        created_at: new Date(),
      });
    } catch (err) {
      console.error(err);

      socket.emit("errorMessage", "Unable to send message.");
    }
  });
};
