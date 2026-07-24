let socket = null;

function connectSocket(token) {

    if (socket) return;

    socket = io(window.CONFIG.SOCKET_URL, {

        auth: {
            token: token
        }

    });

    socket.on("connect", () => {

        console.log("✅ Connected:", socket.id);

    });

    socket.on("disconnect", () => {

        console.log("❌ Disconnected");

    });

    socket.on("newNotification", (data) => {
        if (typeof renderNotifications === "function") {
            renderNotifications();
        }
    });

    socket.on("connect_error", (err) => {

        console.log(err.message);

    });

}

function getSocket() {
    return socket;
}

window.SocketService = {
    connectSocket,
    getSocket
};