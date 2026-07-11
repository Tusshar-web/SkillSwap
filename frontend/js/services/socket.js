let socket = null;

function connectSocket(token) {

    socket = io("http://localhost:5009", {

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