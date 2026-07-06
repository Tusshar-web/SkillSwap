const db = require("../config/db");

const findUserByEmail = async (email) => {
    const [rows] = await db.execute(
        "SELECT * FROM users WHERE email = ?",
        [email]
    );

    return rows[0];
};

const createUser = async (full_name, email, password_hash) => {
    const [result] = await db.execute(
        `INSERT INTO users (full_name, email, password_hash)
         VALUES (?, ?, ?)`,
        [full_name, email, password_hash]
    );
    console.log("Insert result ", result)
    return result;
};

module.exports = {
    findUserByEmail,
    createUser
};