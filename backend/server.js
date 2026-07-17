const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
app.use(cors());
app.use(express.json());

require("dotenv").config();

require("./config/db");

//Routes registering
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);
const skillRoutes = require("./routes/skillRoutes");
app.use("/api/skills", skillRoutes);
const userSkillRoutes = require("./routes/userSkillRoutes");
app.use("/api/user-skills", userSkillRoutes);
const searchRoutes = require("./routes/searchRoutes");
app.use("/api/search", searchRoutes);
const swapRequestRoutes = require("./routes/swapRequestRoutes");
app.use("/api/swap", swapRequestRoutes);
const chatRoutes = require("./routes/chatRoutes");
app.use("/api/chat", chatRoutes);
const exchangeRequestRoutes = require("./routes/exchangeRequestRoutes");
app.use("/api/exchange-requests", exchangeRequestRoutes);
// Protected Route
const authMiddleware = require("./middleware/authMiddleware");
app.get("/test", authMiddleware, (req, res) => {

    res.json({
        message: "Protected Route",
        user: req.user
    });

});


//backend browser msg
app.get("/", (req, res) => {
    res.send("SkillSwap Backend Running");
});

//socket.io setup
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})
require("./socket")(io);


const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
