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

    const getUserById = async (id) => {
    const [rows] = await db.execute(
        `SELECT id,
                full_name,
                email,
                bio,
                location,
                profile_picture,
                created_at
         FROM users
         WHERE id = ?`,
        [id]
    );

    return rows[0];
};

    const updateUserProfile = async (
    id,
    full_name,
    bio,
    location,
    profile_picture
) => {

    const [result] = await db.execute(
        `UPDATE users
         SET full_name = ?,
             bio = ?,
             location = ?,
             profile_picture = ?
         WHERE id = ?`,
        [
            full_name,
            bio,
            location,
            profile_picture,
            id
        ]
    );

    return result;
};

module.exports = {
    findUserByEmail,
    createUser,
    getUserById,
    updateUserProfile
};