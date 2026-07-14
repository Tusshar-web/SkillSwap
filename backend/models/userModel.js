const db = require("../config/db");

const findUserByEmail = async (email) => {
    const [rows] = await db.execute(
        "SELECT * FROM users WHERE email = ?",
        [email]
    );

    return rows[0];
};

const createUser = async (
    full_name,
    email,
    password_hash
) => {

    const [result] = await db.execute(

        `INSERT INTO users
        (
            full_name,
            email,
            password_hash,
            is_verified
        )
        VALUES (?, ?, ?, ?)`,
        [
            full_name,
            email,
            password_hash,
            0
        ]

    );

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

const getUserProfile = async (userId) => {
    const [rows] = await db.execute(
        `SELECT
            id,
            full_name,
            email,
            bio,
            location,
            profile_picture,
            created_at
         FROM users
         WHERE id = ?`,
        [userId]
    );

    return rows[0];
};

const saveOTP = async (
    userId,
    otp,
    expiry
) => {

    await db.execute(

        `
        UPDATE users
        SET
            verification_otp = ?,
            otp_expiry = ?
        WHERE id = ?
        `,

        [
            otp,
            expiry,
            userId
        ]

    );

};

const verifyOTP = async (email, otp) => {

    const [rows] = await db.execute(

        `
        SELECT *

        FROM users

        WHERE
            email = ?
            AND verification_otp = ?
        `,

        [email, otp]

    );

    return rows[0];

};

const markEmailVerified = async (userId) => {

    await db.execute(

        `
        UPDATE users
        SET
            is_verified = 1,
            verification_otp = NULL,
            otp_expiry = NULL
        WHERE id = ?
        `,

        [userId]

    );

};

module.exports = {
    findUserByEmail,
    createUser,
    getUserById,
    updateUserProfile,
    getUserProfile,
    saveOTP,
    verifyOTP,
    markEmailVerified
};