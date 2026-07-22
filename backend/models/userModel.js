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

const getUserOfferSkills = async (userId) => {

    const [rows] = await db.execute(
        `
        SELECT
            us.user_skill_id,
            s.skill_name,
            us.proficiency,
            us.description
        FROM user_skills us
        JOIN skills s
            ON us.skill_id = s.skill_id
        WHERE
            us.user_id = ?
        AND us.skill_type = 'offer'
        ORDER BY s.skill_name
        `,
        [userId]
    );

    return rows;
};

const updateProfilePicture = async (userId, imageUrl) => {

    const [result] = await db.execute(
        `
        UPDATE users
        SET profile_picture = ?
        WHERE id = ?
        `,
        [
            imageUrl,
            userId
        ]
    );

    return result;

};

const getUserStats = async (userId) => {
    const [offeredRows] = await db.execute(
        "SELECT COUNT(*) as count FROM user_skills WHERE user_id = ? AND skill_type = 'offer'",
        [userId]
    );
    const [wantedRows] = await db.execute(
        "SELECT COUNT(*) as count FROM user_skills WHERE user_id = ? AND skill_type = 'want'",
        [userId]
    );
    const [activeReqRows] = await db.execute(
        "SELECT COUNT(*) as count FROM exchange_requests WHERE (sender_id = ? OR receiver_id = ?) AND status = 'pending'",
        [userId, userId]
    );
    const [completedRows] = await db.execute(
        "SELECT COUNT(*) as count FROM exchange_requests WHERE (sender_id = ? OR receiver_id = ?) AND status = 'completed'",
        [userId, userId]
    );
    const [ratingRows] = await db.execute(
        "SELECT AVG(rating) as avg_rating FROM reviews WHERE reviewee_id = ?",
        [userId]
    );

    return {
        offeredCount: offeredRows[0].count,
        wantedCount: wantedRows[0].count,
        activeRequests: activeReqRows[0].count,
        completedSessions: completedRows[0].count,
        rating: ratingRows[0].avg_rating ? parseFloat(ratingRows[0].avg_rating) : 0.0
    };
};

const getActivityStats = async (userId) => {
    const monthsData = [];
    const d = new Date();
    d.setDate(1); 
    
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    for (let i = 4; i >= 0; i--) {
        const temp = new Date(d);
        temp.setMonth(d.getMonth() - i);
        monthsData.push({
            name: monthNames[temp.getMonth()],
            year: temp.getFullYear(),
            monthNum: temp.getMonth() + 1 
        });
    }

    const teachHours = [0, 0, 0, 0, 0];
    const learnHours = [0, 0, 0, 0, 0];

    const [rows] = await db.execute(`
        SELECT 
            MONTH(updated_at) as month,
            YEAR(updated_at) as year,
            sender_id,
            receiver_id,
            sender_user_skill_id,
            receiver_user_skill_id
        FROM exchange_requests
        WHERE status = 'completed' 
        AND (sender_id = ? OR receiver_id = ?)
        AND updated_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
    `, [userId, userId]);

    rows.forEach(row => {
        const idx = monthsData.findIndex(m => m.monthNum === row.month && m.year === row.year);
        if (idx !== -1) {
            if (row.sender_id === userId) {
                if (row.sender_user_skill_id) teachHours[idx] += 1;
                if (row.receiver_user_skill_id) learnHours[idx] += 1;
            } else if (row.receiver_id === userId) {
                if (row.receiver_user_skill_id) teachHours[idx] += 1;
                if (row.sender_user_skill_id) learnHours[idx] += 1;
            }
        }
    });

    return {
        months: monthsData.map(m => m.name),
        teachHours,
        learnHours
    };
};

module.exports = {
    findUserByEmail,
    createUser,
    getUserById,
    updateUserProfile,
    getUserProfile,
    saveOTP,
    verifyOTP,
    markEmailVerified,
    getUserOfferSkills,
    updateProfilePicture,
    getUserStats,
    getActivityStats
};