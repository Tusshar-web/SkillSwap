const authenticateSocket = require("./auth");
const registerRoom = require("./rooms");
const registerChat = require("./chat");

const activeUsers = new Map();

module.exports = (io) => {

    io.use(authenticateSocket);

    io.on("connection", (socket) => {

        const userId = socket.user.id;
        
        // Join personal room for notifications
        socket.join(`user_${userId}`);
        
        // Track connection
        activeUsers.set(userId, (activeUsers.get(userId) || 0) + 1);
        if (activeUsers.get(userId) === 1) {
            io.emit("userStatusChange", { userId, isOnline: true });
        }

        registerRoom(io, socket);
        registerChat(io, socket);

        socket.on("getOnlineUsers", (callback) => {
            if (typeof callback === "function") {
                callback(Array.from(activeUsers.keys()));
            }
        });

        socket.on("disconnect", () => {
            const count = activeUsers.get(userId) || 0;
            if (count <= 1) {
                activeUsers.delete(userId);
                io.emit("userStatusChange", { userId, isOnline: false });
            } else {
                activeUsers.set(userId, count - 1);
            }
        });

    });

};