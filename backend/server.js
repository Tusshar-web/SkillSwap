const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

require("dotenv").config();

require("./config/db");


const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const authMiddleware = require("./middleware/authMiddleware");

app.get("/test", authMiddleware, (req, res) => {

    res.json({
        message: "Protected Route",
        user: req.user
    });

});

app.get("/", (req, res) => {
    res.send("SkillSwap Backend Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
