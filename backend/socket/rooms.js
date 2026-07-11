const { getRequestById } = require("../models/swapRequestModel");

module.exports = (io, socket) => {

    socket.on("joinRoom", async (requestId) => {

        try {

            const request = await getRequestById(requestId);

            if (!request) {
                return socket.emit("errorMessage", "Swap request not found.");
            }

            // Only accepted swaps can chat
            if (request.status !== "Accepted") {
                return socket.emit("errorMessage", "Chat is not available.");
            }

            // Logged in user
            const userId = socket.user.id;

            // Only sender or receiver can join
            if (
                request.sender_id !== userId &&
                request.receiver_id !== userId
            ) {
                return socket.emit("errorMessage", "Unauthorized.");
            }

            const roomName = `request_${requestId}`;

            socket.join(roomName);

            socket.emit("joinedRoom", roomName);

            console.log(`User ${userId} joined ${roomName}`);

        } catch (err) {

            console.log(err);

            socket.emit("errorMessage", "Unable to join room.");

        }

    });

};