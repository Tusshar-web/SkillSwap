const authenticateSocket = require("./auth");
const registerRoom = require("./rooms");
const registerChat = require("./chat");


module.exports = (io) => {

    io.use(authenticateSocket);

    io.on("connection", (socket) => {

        console.log(`✅ User ${socket.user.id} connected`);

        registerRoom(io, socket);
        registerChat(io, socket);


        socket.on("disconnect", () => {
            console.log(`❌ User ${socket.user.id} disconnected`);
        });

    });

};